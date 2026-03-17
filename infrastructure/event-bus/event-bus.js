const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

class EventBus {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.exchanges = {
            employee: 'employee.events',
            fairness: 'fairness.events',
            intervention: 'intervention.events',
            turnover: 'turnover.events'
        };
    }

    async connect() {
        try {
            this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
            this.channel = await this.connection.createChannel();

            // Create Exchanges
            for (const exchange of Object.values(this.exchanges)) {
                await this.channel.assertExchange(exchange, 'topic', { durable: true });
            }

            console.log('EventBus connected to RabbitMQ');
        } catch (error) {
            console.error('EventBus connection failed:', error);
            // Retry logic could be added here
            setTimeout(() => this.connect(), 5000);
        }
    }

    async publish(service, eventType, data, routingKey = '') {
        if (!this.channel) {
            console.error('EventBus channel not established');
            return;
        }
        const exchange = this.exchanges[service];
        if (!exchange) {
            throw new Error(`Unknown service: ${service}`);
        }

        const message = {
            eventType,
            data,
            timestamp: Date.now(),
            traceId: data.traceId || uuidv4()
        };

        try {
            this.channel.publish(
                exchange,
                routingKey || eventType,
                Buffer.from(JSON.stringify(message)),
                { persistent: true }
            );

            console.log(`Published ${eventType} to ${exchange}`);
        } catch (e) {
            console.error('Publish failed', e);
        }
    }

    async subscribe(service, eventTypes, handler, queueName = '') {
        if (!this.channel) await this.connect();

        const exchange = this.exchanges[service];
        const q = await this.channel.assertQueue(queueName, { exclusive: queueName === '' }); // Exclusive if unnamed

        for (const eventType of eventTypes) {
            await this.channel.bindQueue(q.queue, exchange, eventType);
        }

        this.channel.consume(q.queue, (msg) => {
            if (msg) {
                const content = JSON.parse(msg.content.toString());
                handler(content);
                this.channel.ack(msg);
            }
        });

        console.log(`Subscribed to ${eventTypes.join(', ')} from ${exchange}`);
    }

    async disconnect() {
        await this.channel?.close();
        await this.connection?.close();
    }
}

module.exports = new EventBus();
