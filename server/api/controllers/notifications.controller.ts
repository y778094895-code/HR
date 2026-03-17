import { Request, Response } from 'express';
import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { inject } from 'inversify';
import { NotificationsRepository } from '../../data/repositories/notifications.repository';
import { ApiResponse } from '../../shared/api-response';

@controller('/notifications')
export class NotificationsController {
    constructor(@inject('NotificationsRepository') private notificationsRepo: NotificationsRepository) { }

    @httpGet('/')
    async getNotifications(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user?.id) {
                return res.status(401).json(ApiResponse.error('UNAUTHORIZED', 'Unauthorized'));
            }

            const result = await this.notificationsRepo.findByUser(user.id, {
                page: parseInt(req.query.page as string) || 1,
                pageSize: parseInt(req.query.pageSize as string) || 20,
                isRead: req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined,
                category: req.query.category as string,
            });
            res.json(ApiResponse.success(result));
        } catch (err: any) {
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }

    @httpGet('/unread-count')
    async getUnreadCount(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user?.id) {
                return res.status(401).json(ApiResponse.error('UNAUTHORIZED', 'Unauthorized'));
            }

            const count = await this.notificationsRepo.getUnreadCount(user.id);
            res.json(ApiResponse.success({ count }));
        } catch (err: any) {
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }

    @httpPut('/:id/read')
    async markAsRead(req: Request, res: Response) {
        try {
            const result = await this.notificationsRepo.markAsRead(req.params.id);
            if (!result) {
                return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Notification not found'));
            }
            res.json(ApiResponse.success(result, 'Notification marked as read'));
        } catch (err: any) {
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }

    @httpPut('/read-all')
    async markAllAsRead(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user?.id) {
                return res.status(401).json(ApiResponse.error('UNAUTHORIZED', 'Unauthorized'));
            }

            await this.notificationsRepo.markAllReadForUser(user.id);
            res.json(ApiResponse.success(null, 'All notifications marked as read'));
        } catch (err: any) {
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }

    @httpPost('/')
    async createNotification(req: Request, res: Response) {
        try {
            const { userId, type, title, message } = req.body;
            if (!userId || !type || !title || !message) {
                return res.status(400).json(ApiResponse.error(
                    'VALIDATION_ERROR',
                    'userId, type, title, and message are required'
                ));
            }

            const result = await this.notificationsRepo.create({
                userId: req.body.userId,
                type: req.body.type,
                category: req.body.category || 'general',
                title: req.body.title,
                message: req.body.message,
                priority: req.body.priority || 'normal',
                channel: req.body.channel || 'in_app',
                metadata: req.body.metadata || {},
                relatedEntityType: req.body.relatedEntityType || null,
                relatedEntityId: req.body.relatedEntityId || null,
            });

            res.status(201).json(ApiResponse.success(result, 'Notification created'));
        } catch (err: any) {
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }

    @httpDelete('/:id')
    async deleteNotification(req: Request, res: Response) {
        try {
            const result = await this.notificationsRepo.delete(req.params.id);
            if (!result) {
                return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Notification not found'));
            }
            res.json(ApiResponse.success(result, 'Notification deleted'));
        } catch (err: any) {
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }
}
