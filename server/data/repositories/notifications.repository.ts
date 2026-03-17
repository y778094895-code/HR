import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { notifications } from '../models/notifications.schema';
import { eq, desc, and, sql, count } from 'drizzle-orm';

@injectable()
export class NotificationsRepository extends BaseRepository<typeof notifications> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, notifications);
    }

    async findByUser(userId: string, filters: {
        page?: number;
        pageSize?: number;
        isRead?: boolean;
        category?: string;
    } = {}) {
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 20;
        const offset = (page - 1) * pageSize;

        let conditions: any[] = [eq(notifications.userId, userId)];

        if (filters.isRead !== undefined) {
            conditions.push(eq(notifications.isRead, filters.isRead));
        }
        if (filters.category) {
            conditions.push(eq(notifications.category, filters.category));
        }

        const whereClause = and(...conditions);

        const items = await this.db.select()
            .from(notifications)
            .where(whereClause)
            .orderBy(desc(notifications.createdAt))
            .limit(pageSize)
            .offset(offset);

        const [countResult] = await this.db.select({
            count: sql<number>`count(*)`,
        })
            .from(notifications)
            .where(whereClause);

        const total = Number(countResult?.count ?? 0);

        return {
            items,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }

    async getUnreadCount(userId: string): Promise<number> {
        const [result] = await this.db.select({
            count: sql<number>`count(*)`,
        })
            .from(notifications)
            .where(and(
                eq(notifications.userId, userId),
                eq(notifications.isRead, false)
            ));
        return Number(result?.count ?? 0);
    }

    async markAsRead(notificationId: string): Promise<any> {
        return this.update(notificationId, {
            isRead: true,
            readAt: new Date(),
        });
    }

    async markAllReadForUser(userId: string): Promise<void> {
        await this.db.update(notifications)
            .set({ isRead: true, readAt: new Date() })
            .where(and(
                eq(notifications.userId, userId),
                eq(notifications.isRead, false)
            ));
    }
}
