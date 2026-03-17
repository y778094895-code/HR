import { injectable, inject } from 'inversify';
import { HelpRepository } from '../../data/repositories/help.repository';
import { SupportRepository } from '../../data/repositories/support.repository';
import { AuditLogService } from './audit-log.service';

@injectable()
export class HelpService {
    constructor(
        @inject('HelpRepository') private helpRepo: HelpRepository,
        @inject('SupportRepository') private supportRepo: SupportRepository,
        @inject('AuditLogService') private auditLogService: AuditLogService
    ) { }

    async getCategories() {
        return await this.helpRepo.listCategories();
    }

    async listArticles(page: number = 1, limit: number = 20) {
        return await this.helpRepo.listArticles(page, limit);
    }

    async getPopularArticles(limit: number = 10) {
        return await this.helpRepo.getPopularArticles(limit);
    }

    async searchArticles(query: string) {
        return await this.helpRepo.searchArticles(query);
    }

    async getArticle(slug: string) {
        return await this.helpRepo.getArticleBySlug(slug);
    }

    async listArticlesByCategory(categorySlug: string) {
        return await this.helpRepo.listArticlesByCategory(categorySlug);
    }

    async getFAQs() {
        return await this.helpRepo.listFAQs();
    }

    async getFAQsByCategory(categoryId: string) {
        return await this.helpRepo.listFAQsByCategory(categoryId);
    }

    async listTickets(userId: string, status?: string) {
        return this.supportRepo.listTickets(userId, status);
    }

    async createTicket(userId: string, ticket: any) {
        const newTicket = await this.supportRepo.createTicket({ ...ticket, userId });
        await this.auditLogService.write({
            actorUserId: userId,
            action: 'HELP_TICKET_CREATE',
            entity: 'help_ticket',
            entityId: newTicket.id
        });
        return newTicket;
    }

    async getTicket(id: string) {
        return this.supportRepo.getTicket(id);
    }

    async updateTicket(id: string, updates: any) {
        return this.supportRepo.updateTicket(id, updates);
    }

    async addMessage(ticketId: string, userId: string, message: string) {
        return this.supportRepo.addMessage(ticketId, userId, message);
    }

    async listMessages(ticketId: string) {
        return this.supportRepo.listMessages(ticketId);
    }
}
