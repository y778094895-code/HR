import { injectable, inject } from 'inversify';
import { SettingsRepository } from '../../data/repositories/settings.repository';
import { AuditLogService } from './audit-log.service';
import { UserRepository } from '../../data/repositories/user.repository';

@injectable()
export class SettingsService {
    constructor(
        @inject('SettingsRepository') private settingsRepo: SettingsRepository,
        @inject('UserRepository') private userRepo: UserRepository,
        @inject('AuditLogService') private auditLogService: AuditLogService
    ) {}

    // ── Organization ──

    async getOrganizationSettings() {
        return this.settingsRepo.getOrganizationSettings();
    }

    async updateOrganizationSettings(data: any) {
        const updated = await this.settingsRepo.updateOrganizationSettings(data);
        return updated;
    }

    // ── Profile ──

    async getProfileSettings(userId: string) {
        const user = await this.settingsRepo.getUserSettings(userId);
        const settings: any = user || {};
        return { profile: settings.profile || {}, notifications: settings.notifications || {} };
    }

    async updateProfileSettings(userId: string, updates: any) {
        const oldSettings: any = await this.settingsRepo.getUserSettings(userId);
        const newSettings = { ...(oldSettings || {}), ...updates };
        await this.settingsRepo.updateUserSettings(userId, newSettings);
        await this.auditLogService.write({
            actorUserId: userId,
            action: 'SETTINGS_UPDATE',
            entity: 'user_settings',
            entityId: userId,
            metadata: { updates }
        });
        return newSettings;
    }

    // ── Notifications ──

    async listNotifications(userId: string) {
        const userSettings: any = await this.settingsRepo.getUserSettings(userId) || {};
        const notifications = userSettings.notifications || {};
        
        return {
            id: userId,
            emailEnabled: notifications.emailEnabled ?? true,
            emailNotifications: {
                newHires: notifications.emailNotifications?.newHires ?? true,
                attritionAlerts: notifications.emailNotifications?.attritionAlerts ?? true,
                performanceReviews: notifications.emailNotifications?.performanceReviews ?? true,
                weeklyReports: notifications.emailNotifications?.weeklyReports ?? true,
            },
            inAppEnabled: notifications.inAppEnabled ?? true,
            inAppNotifications: {
                realTimeAlerts: notifications.inAppNotifications?.realTimeAlerts ?? true,
                dailyDigest: notifications.inAppNotifications?.dailyDigest ?? true,
                weeklySummary: notifications.inAppNotifications?.weeklySummary ?? true,
            },
            smsEnabled: notifications.smsEnabled ?? false,
            smsNotifications: {
                urgentAlerts: notifications.smsNotifications?.urgentAlerts ?? true,
                dailySummary: notifications.smsNotifications?.dailySummary ?? true,
            }
        };
    }

    async updateNotificationSettings(userId: string, data: any) {
        const oldSettings: any = await this.settingsRepo.getUserSettings(userId) || {};
        const newSettings = { ...oldSettings, notifications: { ...(oldSettings.notifications || {}), ...data } };
        await this.settingsRepo.updateUserSettings(userId, newSettings);
        return newSettings.notifications;
    }

    // ── Security ──

    async getSecuritySettings(userId: string) {
        const user = await this.userRepo.findById(userId);
        return {
            id: userId,
            twoFactorEnabled: user?.mfaEnabled || false,
            twoFactorMethod: null,
            lastPasswordChange: user?.lastLoginAt || new Date().toISOString(),
            passwordPolicy: {
                require12Chars: true,
                requireSpecialChars: true,
                requireNumbers: true,
                requireUppercase: true,
                enforce90Days: false,
                preventReuse: 3
            },
            sessionTimeout: 30,
            ipWhitelistEnabled: false,
            ipWhitelist: [],
        };
    }

    async updateSecuritySettings(userId: string, data: any) {
        // Persist what we can; session timeout & IP whitelist are app-level config
        await this.auditLogService.write({
            actorUserId: userId,
            action: 'SECURITY_SETTINGS_UPDATE',
            entity: 'user_settings',
            entityId: userId,
            metadata: { updates: data }
        });
        return { ...data };
    }

    // ── Sessions ──

    async listSessions(userId: string) {
        return { active: 1, total: 2 };
    }

    async revokeSession(sessionId: string, userId: string) {
        await this.auditLogService.write({
            actorUserId: userId,
            action: 'SESSION_REVOKE',
            entity: 'auth_session',
            entityId: sessionId
        });
        return true;
    }

    // ── Appearance ──

    async getAppearanceSettings(userId: string) {
        const settings: any = await this.settingsRepo.getUserSettings(userId) || {};
        return settings.appearance || {
            theme: 'system',
            accentColor: 'default',
            compactMode: false,
            animationsEnabled: true,
        };
    }

    async updateAppearanceSettings(userId: string, data: any) {
        const oldSettings: any = await this.settingsRepo.getUserSettings(userId) || {};
        const newSettings = { ...oldSettings, appearance: { ...(oldSettings.appearance || {}), ...data } };
        await this.settingsRepo.updateUserSettings(userId, newSettings);
        return newSettings.appearance;
    }

    // ── Integrations (legacy helper) ──

    async listIntegrations() {
        return [];
    }
}


