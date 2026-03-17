import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { helpTickets, helpTicketMessages } from '../models/help.schema';
import { eq, and } from 'drizzle-orm';

@injectable()
export class SupportRepository extends BaseRepository<typeof helpTickets> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, helpTickets);
    }

    async listTickets(userId: string, status?: string) {
        try {
            console.log(`[SupportRepository] listTickets start: user=${userId}, status=${status}`);
            if (!status) {
                const result = await this.db.select().from(helpTickets).where(eq(helpTickets.userId, userId));
                console.log(`[SupportRepository] result count: ${result.length}`);
                return result;
            }
            const result = await this.db.select().from(helpTickets).where(and(eq(helpTickets.userId, userId), eq(helpTickets.status, status)));
            console.log(`[SupportRepository] filtered result count: ${result.length}`);
            return result;
        } catch (error: any) {
            console.error('[SupportRepository] listTickets error:', error);
            throw error;
        }
    }

    async createTicket(ticket: any) {
        const result = await this.db.insert(helpTickets).values(ticket).returning();
        return result[0];
    }

    async getTicket(id: string) {
        const result = await this.db.select().from(helpTickets).where(eq(helpTickets.id, id));
        return result[0] || null;
    }

    async updateTicket(id: string, updates: any) {
        const result = await this.db.update(helpTickets).set(updates).where(eq(helpTickets.id, id)).returning();
        return result[0];
    }

    async addMessage(ticketId: string, senderId: string, messageText: string) {
        const result = await this.db.insert(helpTicketMessages).values({
            ticketId,
            senderId,
            message: messageText
        }).returning();
        return result[0];
    }

    async listMessages(ticketId: string) {
        return this.db.select().from(helpTicketMessages).where(eq(helpTicketMessages.ticketId, ticketId)).orderBy(helpTicketMessages.createdAt);
    }
}
