import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { helpCategories, helpArticles, helpFaqs } from '../models/help.schema';
import { eq, ilike, and, sql } from 'drizzle-orm';

@injectable()
export class HelpRepository extends BaseRepository<typeof helpCategories> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, helpCategories);
    }

    async listCategories() {
        return await this.db.select().from(helpCategories).where(eq(helpCategories.isActive, true));
    }

    async getArticleBySlug(slug: string) {
        const [result] = await this.db
            .select()
            .from(helpArticles)
            .leftJoin(helpCategories, eq(helpArticles.categoryId, helpCategories.id))
            .where(and(
                eq(helpArticles.slug, slug),
                eq(helpArticles.isPublished, true)
            ));
        return result || null;
    }

    async searchArticles(query: string, limit = 20) {
        return await this.db
            .select()
            .from(helpArticles)
            .leftJoin(helpCategories, eq(helpArticles.categoryId, helpCategories.id))
            .where(and(
                eq(helpArticles.isPublished, true),
                ilike(helpArticles.title, `%${query}%`),
                sql`help_articles.content ILIKE ${`%${query}%`}`
            ))
            .limit(limit);
    }

    async listArticlesByCategory(categorySlug: string, limit = 50) {
        const [category] = await this.db.select().from(helpCategories).where(eq(helpCategories.slug, categorySlug));
        if (!category) return [];
        return await this.db
            .select()
            .from(helpArticles)
            .where(and(
                eq(helpArticles.categoryId, category.id),
                eq(helpArticles.isPublished, true)
            ))
            .orderBy(helpArticles.createdAt)
            .limit(limit);
    }

    async listArticles(page: number = 1, limit: number = 20) {
        const offset = (page - 1) * limit;
        return await this.db
            .select()
            .from(helpArticles)
            .where(eq(helpArticles.isPublished, true))
            .orderBy(helpArticles.createdAt)
            .limit(limit)
            .offset(offset);
    }

    async getPopularArticles(limit: number = 10) {
        return await this.db
            .select()
            .from(helpArticles)
            .where(eq(helpArticles.isPublished, true))
            .orderBy(helpArticles.createdAt)
            .limit(limit);
    }

    async listFAQs() {
        return await this.db.select().from(helpFaqs).where(eq(helpFaqs.isActive, true));
    }

    async listFAQsByCategory(categoryId: string) {
        return await this.db.select().from(helpFaqs).where(and(eq(helpFaqs.categoryId, categoryId), eq(helpFaqs.isActive, true)));
    }
}
