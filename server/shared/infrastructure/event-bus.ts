import * as amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

export interface EventMessage {
    eventType: string;
    data: any;
    timestamp: number;
    traceId: string;
    messageId: string;
}

export class EventBus {
    private connection: amqp.ChannelModel | null = null;
    private channel: amqp.Channel | null = null;
    private isConnecting: boolean = false;
    private isTestEnv: boolean = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
    private testHandlers: Record<string, Function[]> = {};

    private exchanges: Record<string, string> = {
        employee: 'employee.events',
        fairness: 'fairness.events',
        intervention: 'intervention.events',
        turnover: 'turnover.events',
        notification: 'notification.events'
    };

    private dlqParams = {
        exchange: 'dlq.exchange',
        queue: 'dlq.queue',
        routingKey: 'dlq.routingKey'
    };

    async connect(retries = 5) {
        if (this.connection) return;
        if (this.isConnecting) return; // Prevent race conditions

        if (this.isTestEnv) {
            console.log('EventBus mocked for test environment');
            return;
        }

        this.isConnecting = true;
        try {
            const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
            this.connection = await amqp.connect(rabbitUrl);
            this.channel = await this.connection.createChannel();

            // Setup DLQ
            await this.channel.assertExchange(this.dlqParams.exchange, 'direct', { durable: true });
            await this.channel.assertQueue(this.dlqParams.queue, { durable: true });
            await this.channel.bindQueue(this.dlqParams.queue, this.dlqParams.exchange, this.dlqParams.routingKey);

            // Create Domain Exchanges
            for (const exchange of Object.values(this.exchanges)) {
                await this.channel.assertExchange(exchange, 'topic', { durable: true });
            }

            this.connection.on('close', () => {
                console.error('RabbitMQ connection closed. Reconnecting...');
                this.connection = null;
                this.channel = null;
                this.isConnecting = false;
                this.connect();
            });

            this.connection.on('error', (err) => {
                console.error('RabbitMQ connection error:', err);
            });

            console.log('EventBus connected to RabbitMQ');
            this.isConnecting = false;
        } catch (error) {
            console.error(`EventBus connection failed. Retries left: ${retries}`, error);
            this.isConnecting = false;
            if (retries > 0) {
                await new Promise(res => setTimeout(res, 5000));
                return this.connect(retries - 1);
            }
            throw error;
        }
    }

    async publish(service: string, eventType: string, data: any, routingKey: string = '') {
        if (this.isTestEnv) {
            const messageId = uuidv4();
            const traceId = data.traceId || uuidv4();
            const message: EventMessage = {
                eventType,
                data,
                timestamp: Date.now(),
                traceId,
                messageId
            };
            const handlers = this.testHandlers[eventType] || [];
            console.log(`[Test EventBus] Mock publishing ${eventType} to ${handlers.length} handlers`);
            for (const handler of handlers) {
                setTimeout(() => handler(message), 10);
            }
            return;
        }

        if (!this.channel) {
            await this.connect();
        }
        if (!this.channel) {
            console.warn(`Cannot publish ${eventType}, channel not available.`);
            return;
        }

        const exchange = this.exchanges[service];
        if (!exchange) {
            console.error(`Unknown service: ${service}`);
            return;
        }

        const messageId = uuidv4();
        const traceId = data.traceId || uuidv4();

        const message: EventMessage = {
            eventType,
            data,
            timestamp: Date.now(),
            traceId,
            messageId
        };

        try {
            const sent = this.channel.publish(
                exchange,
                routingKey || eventType,
                Buffer.from(JSON.stringify(message)),
                {
                    persistent: true,
                    messageId: messageId,
                    headers: { 'x-trace-id': traceId }
                }
            );

            if (sent) {
                console.log(`[EventBus] Published ${eventType} to ${exchange} | Trace: ${traceId}`);
            } else {
                console.error(`[EventBus] Failed to publish ${eventType} (buffer full)`);
            }
        } catch (e) {
            console.error('[EventBus] Publish error', e);
        }
    }

    async subscribe(service: string, eventTypes: string[], handler: (content: EventMessage) => Promise<void>, queueName: string = '') {
        if (this.isTestEnv) {
            for (const eventType of eventTypes) {
                if (!this.testHandlers[eventType]) {
                    this.testHandlers[eventType] = [];
                }
                this.testHandlers[eventType].push(handler);
            }
            console.log(`[Test EventBus] Mock subscribed to ${eventTypes.join(', ')}`);
            return;
        }

        if (!this.channel) await this.connect();
        if (!this.channel) return;

        const exchange = this.exchanges[service];
        const dlqArgs = {
            'x-dead-letter-exchange': this.dlqParams.exchange,
            'x-dead-letter-routing-key': this.dlqParams.routingKey,
        };

        const q = await this.channel.assertQueue(queueName, {
            exclusive: queueName === '',
            durable: queueName !== '',
            arguments: dlqArgs
        });

        for (const eventType of eventTypes) {
            await this.channel.bindQueue(q.queue, exchange, eventType);
        }

        this.channel.consume(q.queue, async (msg) => {
            if (msg) {
                try {
                    const content: EventMessage = JSON.parse(msg.content.toString());

                    if (await this.isProcessed(content.messageId)) {
                        console.log(`[EventBus] Duplicate message detected: ${content.messageId}. Skipping.`);
                        this.channel?.ack(msg);
                        return;
                    }

                    await handler(content);
                    await this.markProcessed(content.messageId);
                    this.channel?.ack(msg);
                } catch (err) {
                    console.error(`[EventBus] Error processing ${msg.fields.routingKey}:`, err);
                    // Reject and sending to DLQ (requeue=false)
                    this.channel?.nack(msg, false, false);
                }
            }
        });

        console.log(`[EventBus] Subscribed to ${eventTypes.join(', ')} from ${exchange} on queue ${q.queue}`);
    }

    async close() {
        if (this.isTestEnv) {
            this.testHandlers = {};
            return;
        }
        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
            }
            if (this.connection) {
                await this.connection.close();
                this.connection = null;
            }
            console.log('[EventBus] Connection closed normally.');
        } catch (e) {
            console.error('[EventBus] Error while closing connection:', e);
        }
    }

    // Mock Idempotency with in-memory Set (Should be Redis in production)
    private processedMessages = new Set<string>();

    private async isProcessed(messageId: string): Promise<boolean> {
        // TODO: Replace with Redis.get(`processed:${messageId}`)
        return this.processedMessages.has(messageId);
    }

    private async markProcessed(messageId: string): Promise<void> {
        // TODO: Replace with Redis.set(`processed:${messageId}`, '1', 'EX', 86400)
        this.processedMessages.add(messageId);
        // Cleanup memory to avoid leak in mock
        if (this.processedMessages.size > 1000) {
            const first = this.processedMessages.values().next().value;
            this.processedMessages.delete(first);
        }
    }
}

export const eventBus = new EventBus();
