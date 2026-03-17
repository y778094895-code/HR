import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
export const helpCategories = pgTable('help_categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).unique().notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    nameIdx: index('idx_help_categories_name').on(table.name),
}));

export const helpArticles = pgTable('help_articles', {
    id: uuid('id').defaultRandom().primaryKey(),
    categoryId: uuid('category_id').references(() => helpCategories.id, { onDelete: 'set null' }),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 100 }).unique().notNull(),
    content: text('content').notNull(),
    version: integer('version').default(1),
    isPublished: boolean('is_published').default(false),
    searchKeywords: jsonb('search_keywords').default('[]'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    categoryIdx: index('idx_help_articles_category').on(table.categoryId),
    publishedIdx: index('idx_help_articles_published').on(table.isPublished),
}));

export const helpFaqs = pgTable('help_faqs', {
    id: uuid('id').defaultRandom().primaryKey(),
    categoryId: uuid('category_id').references(() => helpCategories.id, { onDelete: 'set null' }),
    question: varchar('question', { length: 255 }).notNull(),
    answer: text('answer').notNull(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    categoryIdx: index('idx_help_faqs_category').on(table.categoryId),
}));

export const helpTickets = pgTable('help_tickets', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    subject: varchar('subject', { length: 255 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 50 }).default('open'),
    priority: varchar('priority', { length: 20 }).default('medium'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    closedAt: timestamp('closed_at'),
});

export const helpTicketMessages = pgTable('help_ticket_messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    ticketId: uuid('ticket_id').references(() => helpTickets.id, { onDelete: 'cascade' }).notNull(),
    senderId: uuid('sender_id').references(() => users.id).notNull(),
    message: text('message').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type HelpCategory = typeof helpCategories.$inferSelect;
export type NewHelpCategory = typeof helpCategories.$inferInsert;
export type HelpArticle = typeof helpArticles.$inferSelect;
export type NewHelpArticle = typeof helpArticles.$inferInsert;
export type HelpFaq = typeof helpFaqs.$inferSelect;
export type NewHelpFaq = typeof helpFaqs.$inferInsert;
export type HelpTicket = typeof helpTickets.$inferSelect;
export type NewHelpTicket = typeof helpTickets.$inferInsert;
export type HelpTicketMessage = typeof helpTicketMessages.$inferSelect;
export type NewHelpTicketMessage = typeof helpTicketMessages.$inferInsert;
