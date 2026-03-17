import { Request, Response } from 'express';
import { controller, httpGet, httpPost, httpPatch } from 'inversify-express-utils';
import { inject } from 'inversify';
import { ApiResponse } from '../../shared/api-response';
import { HelpService } from '../../services/business/help.service';

@controller('/help')
export class ConsoleHelpController {
    constructor(
        @inject('HelpService') private helpService: HelpService
    ) {}

    @httpGet('/categories')
    async getCategories(req: Request, res: Response) {
        const result = await this.helpService.getCategories();
        res.json(ApiResponse.success(result));
    }

    @httpGet('/categories/:categoryId/articles')
    async getArticlesByCategory(req: Request, res: Response) {
        const categoryId = req.params.categoryId;
        const result = await this.helpService.listArticlesByCategory(categoryId);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/articles')
    async listArticles(req: Request, res: Response) {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const result = await this.helpService.listArticles(page, limit);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/articles/popular')
    async getPopularArticles(req: Request, res: Response) {
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await this.helpService.getPopularArticles(limit);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/articles/search')
    async searchArticles(req: Request, res: Response) {
        const query = req.query.q as string;
        const result = await this.helpService.searchArticles(query || '');
        res.json(ApiResponse.success(result));
    }

    @httpGet('/search')
    async searchHelp(req: Request, res: Response) {
        const query = req.query.query as string || req.query.q as string;
        const result = await this.helpService.searchArticles(query || '');
        res.json(ApiResponse.success(result));
    }

    @httpGet('/articles/:slug')
    async getArticle(req: Request, res: Response) {
        const slug = req.params.slug;
        const result = await this.helpService.getArticle(slug);
        if (!result) return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Article not found'));
        res.json(ApiResponse.success(result));
    }

    @httpGet('/faqs')
    async getFAQs(req: Request, res: Response) {
        const result = await this.helpService.getFAQs();
        res.json(ApiResponse.success(result));
    }

    @httpGet('/faqs/:categoryId')
    async getFAQsByCategory(req: Request, res: Response) {
        const result = await this.helpService.getFAQsByCategory(req.params.categoryId);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/support-categories')
    async getSupportCategories(req: Request, res: Response) {
        console.log('[HelpController] getSupportCategories called');
        res.json(ApiResponse.success([
            { id: 'technical', name: 'Technical Issue' },
            { id: 'billing', name: 'Billing' },
            { id: 'hr', name: 'HR Inquiry' },
            { id: 'general', name: 'General Question' }
        ]));
    }

    @httpGet('/support-priorities')
    async getSupportPriorities(req: Request, res: Response) {
        try {
            console.log('[HelpController] getSupportPriorities called');
            res.json(ApiResponse.success([
                { id: 'low', name: 'Low', level: 1 },
                { id: 'medium', name: 'Medium', level: 2 },
                { id: 'high', name: 'High', level: 3 },
                { id: 'urgent', name: 'Urgent', level: 4 }
            ]));
        } catch (error: any) {
            console.error('[HelpController] getSupportPriorities failed:', error);
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', error.message));
        }
    }

    @httpGet('/tickets')
    async listTickets(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.sub;
            const status = req.query.status as string;
            console.log(`[HelpController] listTickets for user: ${userId}, status: ${status}`);
            
            if (!userId) {
                return res.status(401).json(ApiResponse.error('UNAUTHORIZED', 'User context missing'));
            }

            const tickets = await this.helpService.listTickets(userId, status);
            res.json(ApiResponse.success(tickets));
        } catch (error: any) {
            console.error('[HelpController] listTickets failed:', error);
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', error.message));
        }
    }

    @httpPost('/tickets')
    async createTicket(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.sub;
            console.log(`[HelpController] createTicket for user: ${userId}`);
            
            if (!userId) {
                return res.status(401).json(ApiResponse.error('UNAUTHORIZED', 'User context missing'));
            }

            const ticket = await this.helpService.createTicket(userId, req.body);
            res.status(201).json(ApiResponse.success(ticket));
        } catch (error: any) {
            console.error('[HelpController] createTicket failed:', error);
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', error.message));
        }
    }

    @httpGet('/tickets/:id')
    async getTicket(req: Request, res: Response) {
        const id = req.params.id;
        const ticket = await this.helpService.getTicket(id);
        if (!ticket) return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Ticket not found'));
        res.json(ApiResponse.success(ticket));
    }

    @httpPatch('/tickets/:id')
    async updateTicket(req: Request, res: Response) {
        const id = req.params.id;
        const result = await this.helpService.updateTicket(id, req.body);
        if (!result) return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Ticket not found'));
        res.json(ApiResponse.success(result));
    }

    @httpPost('/tickets/:id/messages')
    async addTicketMessage(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const result = await this.helpService.addMessage(req.params.id, userId, req.body.content);
        res.json(ApiResponse.success(result));
    }

    @httpGet('/tickets/:id/messages')
    async listTicketMessages(req: Request, res: Response) {
        const result = await this.helpService.listMessages(req.params.id);
        res.json(ApiResponse.success(result));
    }
}

// Alias controller — exposes support-ticket routes at /support/* in addition to /help/*
@controller('/support')
export class SupportController {
    constructor(
        @inject('HelpService') private helpService: HelpService
    ) {}

    @httpGet('/tickets')
    async listTickets(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.sub;
            if (!userId) {
                return res.status(401).json(ApiResponse.error('UNAUTHORIZED', 'User context missing'));
            }
            const tickets = await this.helpService.listTickets(userId, req.query.status as string);
            res.json(ApiResponse.success(tickets));
        } catch (error: any) {
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', error.message));
        }
    }
}

