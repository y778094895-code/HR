// Settings Service
// Handles API calls for settings management
// Note: This service provides frontend-accessible API patterns
// Backend integration endpoints should be implemented to match these patterns

import { apiClient } from '../api/client';
import { normalizeKeys } from '../api/normalizers';
import type { 
    OrganizationSettings, 
    NotificationSettings, 
    SecuritySettings, 
    AppearanceSettings,
    UserSession
} from '@/types/settings';
import { createDefaultNotificationSettings, createDefaultSecuritySettings } from '@/utils/factories';

// API base paths
const SETTINGS_API = '/settings';
const SECURITY_API = '/security';
const NOTIFICATIONS_API = '/notifications';
const APPEARANCE_API = '/appearance';
const SESSIONS_API = '/sessions';

// Coercion functions for safe data handling
const coerceNotificationSettings = (data: any): NotificationSettings => {
    const defaults = createDefaultNotificationSettings();
    if (!data) return defaults;
    
    return {
        ...defaults,
        ...data,
        emailNotifications: { ...defaults.emailNotifications, ...data.emailNotifications },
        inAppNotifications: { ...defaults.inAppNotifications, ...data.inAppNotifications },
        smsNotifications: { ...defaults.smsNotifications, ...data.smsNotifications },
    };
};

const coerceSecuritySettings = (data: any): SecuritySettings => {
    const defaults = createDefaultSecuritySettings();
    if (!data) return defaults;

    return {
        ...defaults,
        ...data,
        passwordPolicy: { ...defaults.passwordPolicy, ...data.passwordPolicy },
    };
};

const DEFAULT_ORGANIZATION_SETTINGS: OrganizationSettings = {
    id: 'org-default',
    companyName: 'Smart HR Core',
    industry: 'technology',
    size: '100-500',
    timezone: 'Asia/Riyadh',
    fiscalYearStart: 'january',
    language: 'ar',
    dateFormat: 'DD/MM/YYYY'
};

class SettingsService {
    // Organization Settings
    async getOrganizationSettings(): Promise<OrganizationSettings> {
        try {
            const raw = await apiClient.get<unknown>(`${SETTINGS_API}/organization`);
            return normalizeKeys<OrganizationSettings>(raw);
        } catch (error) {
            console.warn('Organization settings not available from API, using defaults:', error);
            return DEFAULT_ORGANIZATION_SETTINGS;
        }
    }

    async updateOrganizationSettings(data: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
        try {
            const raw = await apiClient.put<unknown>(`${SETTINGS_API}/organization`, data);
            return normalizeKeys<OrganizationSettings>(raw);
        } catch (error) {
            console.error('Failed to update organization settings:', error);
            throw error;
        }
    }

    // Notification Settings
    async getNotificationSettings(): Promise<NotificationSettings> {
        try {
            const raw = await apiClient.get<unknown>(`${NOTIFICATIONS_API}`);
            return coerceNotificationSettings(normalizeKeys<any>(raw));
        } catch (error) {
            console.warn('Notification settings not available from API, using defaults:', error);
            return createDefaultNotificationSettings();
        }
    }

    async updateNotificationSettings(data: Partial<NotificationSettings>): Promise<NotificationSettings> {
        try {
            const raw = await apiClient.put<unknown>(`${NOTIFICATIONS_API}`, data);
            return coerceNotificationSettings(normalizeKeys<any>(raw));
        } catch (error) {
            console.error('Failed to update notification settings:', error);
            throw error;
        }
    }

    // Security Settings
    async getSecuritySettings(): Promise<SecuritySettings> {
        try {
            const raw = await apiClient.get<unknown>(`${SECURITY_API}/settings`);
            return coerceSecuritySettings(normalizeKeys<any>(raw));
        } catch (error) {
            console.warn('Security settings not available from API, using defaults:', error);
            return createDefaultSecuritySettings();
        }
    }

    async updateSecuritySettings(data: Partial<SecuritySettings>): Promise<SecuritySettings> {
        try {
            const raw = await apiClient.put<unknown>(`${SECURITY_API}/settings`, data);
            return coerceSecuritySettings(normalizeKeys<any>(raw));
        } catch (error) {
            console.error('Failed to update security settings:', error);
            throw error;
        }
    }

    // 2FA / MFA
    async get2FAStatus(): Promise<{ enabled: boolean; method: string | null }> {
        try {
            const raw = await apiClient.get<unknown>(`${SECURITY_API}/2fa/status`);
            return normalizeKeys<{ enabled: boolean; method: string | null }>(raw);
        } catch (error) {
            console.warn('2FA status not available from API:', error);
            return { enabled: false, method: null };
        }
    }

    async enable2FA(method: 'totp' | 'sms' | 'email'): Promise<{ success: boolean; secret?: string }> {
        try {
            const raw = await apiClient.post<unknown>(`${SECURITY_API}/2fa/enable`, { method });
            return normalizeKeys<{ success: boolean; secret?: string }>(raw);
        } catch (error) {
            console.error('Failed to enable 2FA:', error);
            throw error;
        }
    }

    async disable2FA(): Promise<{ success: boolean }> {
        try {
            const raw = await apiClient.post<unknown>(`${SECURITY_API}/2fa/disable`, {});
            return normalizeKeys<{ success: boolean }>(raw);
        } catch (error) {
            console.error('Failed to disable 2FA:', error);
            throw error;
        }
    }

    async verify2FAToken(token: string): Promise<{ success: boolean }> {
        try {
            const raw = await apiClient.post<unknown>(`${SECURITY_API}/2fa/verify`, { token });
            return normalizeKeys<{ success: boolean }>(raw);
        } catch (error) {
            console.error('Failed to verify 2FA token:', error);
            throw error;
        }
    }

    // Session Management
    async getActiveSessions(): Promise<UserSession[]> {
        try {
            const raw = await apiClient.get<unknown>(`${SESSIONS_API}`);
            const normalized = normalizeKeys<unknown>(raw);
            return Array.isArray(normalized) ? normalized as UserSession[] : [];
        } catch (error) {
            console.warn('Active sessions not available from API:', error);
            return [];
        }
    }

    async terminateSession(sessionId: string): Promise<{ success: boolean }> {
        try {
            const raw = await apiClient.delete<unknown>(`${SESSIONS_API}/${sessionId}`);
            return normalizeKeys<{ success: boolean }>(raw);
        } catch (error) {
            console.error('Failed to terminate session:', error);
            throw error;
        }
    }

    // Appearance Settings
    async getAppearanceSettings(): Promise<AppearanceSettings> {
        try {
            const raw = await apiClient.get<unknown>(`${APPEARANCE_API}`);
            return normalizeKeys<AppearanceSettings>(raw);
        } catch (error) {
            // Return defaults - these are stored locally anyway
            return {
                theme: 'system',
                accentColor: 'default',
                compactMode: false,
                animationsEnabled: true
            };
        }
    }

    async updateAppearanceSettings(data: Partial<AppearanceSettings>): Promise<AppearanceSettings> {
        try {
            const raw = await apiClient.put<unknown>(`${APPEARANCE_API}`, data);
            return normalizeKeys<AppearanceSettings>(raw);
        } catch (error) {
            console.error('Failed to update appearance settings:', error);
            throw error;
        }
    }

    // Password Management
    async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
        try {
            const raw = await apiClient.post<unknown>(`${SECURITY_API}/password/change`, {
                currentPassword,
                newPassword
            });
            return normalizeKeys<{ success: boolean }>(raw);
        } catch (error) {
            console.error('Failed to change password:', error);
            throw error;
        }
    }
}

export const settingsService = new SettingsService();
export default settingsService;

