// useSettings Hook
// Custom hook for managing settings state and API interactions

import { useState, useEffect, useCallback } from 'react';
import { settingsService } from '@/services/resources/settings.service';
import type { 
    OrganizationSettings, 
    NotificationSettings, 
    SecuritySettings,
    AppearanceSettings,
    UserSession 
} from '@/types/settings';

interface SettingsState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    isDirty: boolean;
}

interface UseSettingsReturn<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    isDirty: boolean;
    load: () => Promise<void>;
    save: (data: Partial<T>) => Promise<T | void>;
    setData: (data: T) => void;
    reset: () => void;
}

function createSettingsHook<T>(
    loadFn: () => Promise<T>,
    saveFn: (data: Partial<T>) => Promise<T>,
    defaultValue: T
): () => UseSettingsReturn<T> {
    return function useSettings() {
        const [data, setDataState] = useState<T | null>(null);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const [isDirty, setIsDirty] = useState(false);

        const load = useCallback(async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await loadFn();
                setDataState(result);
                setIsDirty(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load settings');
                setDataState(defaultValue);
            } finally {
                setIsLoading(false);
            }
        }, [loadFn, defaultValue]);

        const save = useCallback(async (updateData: Partial<T>) => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await saveFn(updateData);
                setDataState(result);
                setIsDirty(false);
                return result;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
                setError(errorMessage);
                throw new Error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }, [saveFn]);

        const setData = useCallback((newData: T) => {
            setDataState(newData);
            setIsDirty(true);
        }, []);

        const reset = useCallback(() => {
            setDataState(defaultValue);
            setIsDirty(false);
            setError(null);
        }, [defaultValue]);

        useEffect(() => {
            load();
        }, [load]);

        return { data, isLoading, error, isDirty, load, save, setData, reset };
    };
}

// Organization Settings Hook
export const useOrganizationSettings = createSettingsHook(
    () => settingsService.getOrganizationSettings(),
    (data) => settingsService.updateOrganizationSettings(data),
    {
        id: 'org-default',
        companyName: 'Smart HR Core',
        industry: 'technology',
        size: '100-500',
        timezone: 'Asia/Riyadh',
        fiscalYearStart: 'january',
        language: 'ar',
        dateFormat: 'DD/MM/YYYY'
    } as OrganizationSettings
);

// Notification Settings Hook
export const useNotificationSettings = createSettingsHook(
    () => settingsService.getNotificationSettings(),
    (data) => settingsService.updateNotificationSettings(data),
    {
        id: 'notif-default',
        emailEnabled: true,
        emailNotifications: {
            newHires: true,
            attritionAlerts: true,
            performanceReviews: true,
            weeklyReports: false
        },
        inAppEnabled: true,
        inAppNotifications: {
            realTimeAlerts: true,
            dailyDigest: true,
            weeklySummary: false
        },
        smsEnabled: false,
        smsNotifications: {
            urgentAlerts: false,
            dailySummary: false
        }
    } as NotificationSettings
);

// Security Settings Hook
export const useSecuritySettings = createSettingsHook(
    () => settingsService.getSecuritySettings(),
    (data) => settingsService.updateSecuritySettings(data),
    {
        id: 'security-default',
        twoFactorEnabled: false,
        twoFactorMethod: null,
        lastPasswordChange: new Date().toISOString(),
        passwordPolicy: {
            require12Chars: true,
            requireSpecialChars: true,
            requireNumbers: true,
            requireUppercase: true,
            enforce90Days: false,
            preventReuse: 5
        },
        sessionTimeout: 30,
        ipWhitelistEnabled: false,
        ipWhitelist: []
    } as SecuritySettings
);

// 2FA Status Hook
interface Use2FAStatusReturn {
    isEnabled: boolean;
    method: string | null;
    isLoading: boolean;
    error: string | null;
    enable: (method: 'totp' | 'sms' | 'email') => Promise<void>;
    disable: () => Promise<void>;
    verify: (token: string) => Promise<boolean>;
    refresh: () => Promise<void>;
}

export function use2FAStatus(): Use2FAStatusReturn {
    const [isEnabled, setIsEnabled] = useState(false);
    const [method, setMethod] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const status = await settingsService.get2FAStatus();
            setIsEnabled(status.enabled);
            setMethod(status.method);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get 2FA status');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const enable = useCallback(async (method: 'totp' | 'sms' | 'email') => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await settingsService.enable2FA(method);
            if (result.success) {
                setIsEnabled(true);
                setMethod(method);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to enable 2FA';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const disable = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await settingsService.disable2FA();
            if (result.success) {
                setIsEnabled(false);
                setMethod(null);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to disable 2FA';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const verify = useCallback(async (token: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await settingsService.verify2FAToken(token);
            return result.success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to verify 2FA';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { isEnabled, method, isLoading, error, enable, disable, verify, refresh };
}

// Active Sessions Hook
interface UseActiveSessionsReturn {
    sessions: UserSession[];
    isLoading: boolean;
    error: string | null;
    terminate: (sessionId: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export function useActiveSessions(): UseActiveSessionsReturn {
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await settingsService.getActiveSessions();
            setSessions(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get sessions');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const terminate = useCallback(async (sessionId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await settingsService.terminateSession(sessionId);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to terminate session';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { sessions, isLoading, error, terminate, refresh };
}

// Password Change Hook
interface UsePasswordChangeReturn {
    isLoading: boolean;
    error: string | null;
    changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

export function usePasswordChange(): UsePasswordChangeReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await settingsService.changePassword(currentPassword, newPassword);
            return result.success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { isLoading, error, changePassword };
}

