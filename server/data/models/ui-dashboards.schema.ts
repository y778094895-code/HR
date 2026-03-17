import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, primaryKey, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.schema';
import { authRoles } from './auth.schema';

export const uiDashboards = pgTable('ui_dashboards', {
    id: uuid('id').defaultRandom().primaryKey(),
    kind: varchar('kind', { length: 20 }).notNull(), // 'TEMPLATE' | 'INSTANCE'
    key: varchar('key', { length: 100 }), // Nullable, used for TEMPLATES
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),

    templateId: uuid('template_id'), // Self-reference (FK added manually in migration if needed, or logical)
    roleId: uuid('role_id').references(() => authRoles.id),

    isDefault: boolean('is_default').default(false),
    layoutJson: jsonb('layout_json'), // Layout definition

    createdByUserId: uuid('created_by_user_id').references(() => users.id),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    // Partial unique index for template keys
    keyUnique: uniqueIndex('ui_dashboards_key_unique').on(t.key).where(sql`${t.key} IS NOT NULL`),
}));

export const uiWidgets = pgTable('ui_widgets', {
    id: uuid('id').defaultRandom().primaryKey(),
    dashboardId: uuid('dashboard_id').references(() => uiDashboards.id).notNull(),
    type: varchar('type', { length: 100 }).notNull(),
    title: varchar('title', { length: 255 }),

    dataSourceType: varchar('data_source_type', { length: 50 }),
    dataSourceKey: varchar('data_source_key', { length: 100 }),

    configJson: jsonb('config_json'),
    layoutJson: jsonb('layout_json'), // Positioning within dashboard if widget-specific

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    dashboardIdx: index('ui_widgets_dashboard_id_index').on(t.dashboardId),
}));

export const uiUserDashboardPrefs = pgTable('ui_user_dashboard_prefs', {
    userId: uuid('user_id').references(() => users.id).notNull(),
    dashboardId: uuid('dashboard_id').references(() => uiDashboards.id).notNull(),

    pinned: boolean('pinned').default(false),
    layoutOverridesJson: jsonb('layout_overrides_json'),
    filtersOverridesJson: jsonb('filters_overrides_json'),

    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.dashboardId] }),
}));

export type UiDashboard = typeof uiDashboards.$inferSelect;
export type NewUiDashboard = typeof uiDashboards.$inferInsert;

export type UiWidget = typeof uiWidgets.$inferSelect;
export type NewUiWidget = typeof uiWidgets.$inferInsert;

export type UiUserDashboardPref = typeof uiUserDashboardPrefs.$inferSelect;
export type NewUiUserDashboardPref = typeof uiUserDashboardPrefs.$inferInsert;
