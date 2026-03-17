import { eq, lt, and } from 'drizzle-orm';
import { injectable, inject } from 'inversify';
import { DatabaseConnection } from '../../data/database/connection';
import { outbox, NewOutboxEvent } from '../../data/models/outbox.schema';
import { eventBus } from './event-bus';

@injectable()
export class OutboxService {

    constructor(@inject('DatabaseConnection') private dbConnection: DatabaseConnection) { }

    async storeEvent(service: string, eventType: string, data: any): Promise<void> {
        const event: NewOutboxEvent = {
            service,
            eventType,
            payload: data,
            status: 'PENDING'
        };

        await this.dbConnection.db.insert(outbox).values(event);
        console.log(`Stored event ${eventType} in outbox`);
    }

    async startProcessor(intervalMs: number = 5000) {
        console.log('Starting Outbox Processor...');
        setInterval(async () => {
            await this.processPendingEvents();
        }, intervalMs);
    }

async processPendingEvents() {
        try {
            const db = this.dbConnection.db;
            const pendingEvents = await db.select()
                .from(outbox)
                .where(
                    and(
                        eq(outbox.status, 'PENDING'),
                        lt(outbox.retryCount, 5)
                    )
                )
                .limit(50);

            for (const event of pendingEvents) {
                try {
                    console.log(`Processing outbox event: ${event.id} - ${event.eventType}`);

                    await eventBus.publish(
                        event.service,
                        event.eventType,
                        event.payload
                    );

                    await db.update(outbox)
                        .set({
                            status: 'SENT',
                            processedAt: new Date()
                        })
                        .where(eq(outbox.id, event.id));

                } catch (error) {
                    console.error(`Failed to process event ${event.id}:`, error);
                    await db.update(outbox)
                        .set({
                            retryCount: event.retryCount + 1,
                            lastError: error instanceof Error ? error.message : 'Unknown error'
                        })
                        .where(eq(outbox.id, event.id));
                }
            }
        } catch (error) {
            console.error('Error in Outbox Processor:', error);
        }
    }

    async getEmployeeEvents(employeeId: string, limit: number = 10) {
        const { db } = this.dbConnection;
        const { sql, desc } = await import('drizzle-orm');
        return db
            .select()
            .from(outbox)
            .where(sql`payload->>'subject_employee_id' = ${employeeId}`)
            .orderBy(desc(outbox.createdAt))
            .limit(limit);
    }


}
