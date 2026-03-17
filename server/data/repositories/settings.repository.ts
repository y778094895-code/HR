import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { DatabaseConnection } from '../database/connection';
import { users } from '../models/index';
import { eq, and } from 'drizzle-orm';

@injectable()
export class SettingsRepository extends BaseRepository<typeof users> {
    constructor(@inject('DatabaseConnection') dbConnection: DatabaseConnection) {
        super(dbConnection, users);
    }

    async getUserSettings(userId: string) {
        const result = await this.db.select({ id: users.id, settings: users.settings }).from(users).where(eq(users.id, userId));
        return result[0]?.settings || {};
    }

    async updateUserSettings(userId: string, settings: any) {
        const result = await this.db.update(users).set({ settings }).where(eq(users.id, userId)).returning();
        return result[0];
    }

    async getOrganizationSettings() {
        // Organization settings stored as a well-known key in the system
        // For honest-limited: return defaults, real impl would use a dedicated org_settings table
        return {
            companyName: 'Smart HR Core',
            industry: 'technology',
            size: '100-500',
            timezone: 'Asia/Riyadh',
            fiscalYearStart: 'january',
            language: 'ar',
            dateFormat: 'DD/MM/YYYY',
        };
    }

    async updateOrganizationSettings(data: any) {
        // Honest-limited: accept and return merged data; real impl persists to org_settings
        return { ...await this.getOrganizationSettings(), ...data };
    }
}

export type HelpTicketRepository = SettingsRepository;
