import { NotificationSettings, SecuritySettings } from '../types/settings';
import { Integration } from '../types/integrations';
import { QualitySummary } from '../types/dataQuality';

/**
 * Factory for default NotificationSettings
 */
export const createDefaultNotificationSettings = (): NotificationSettings => ({
    emailEnabled: true,
    emailNotifications: {
        newHires: true,
        attritionAlerts: true,
        performanceReviews: true,
        weeklyReports: true,
    },
    inAppEnabled: true,
    inAppNotifications: {
        realTimeAlerts: true,
        dailyDigest: true,
        weeklySummary: true,
    },
    smsEnabled: false,
    smsNotifications: {
        urgentAlerts: true,
        dailySummary: true,
    },
});

/**
 * Factory for default SecuritySettings
 */
export const createDefaultSecuritySettings = (): SecuritySettings => ({
    twoFactorEnabled: false,
    twoFactorMethod: null,
    lastPasswordChange: new Date().toISOString(),
    passwordPolicy: {
        require12Chars: true,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true,
        enforce90Days: false,
        preventReuse: 3,
    },
    sessionTimeout: 30,
    ipWhitelistEnabled: false,
    ipWhitelist: [],
});

/**
 * Factory for default Integration
 */
export const createDefaultIntegration = (id: string = 'unknown'): Integration => ({
    id,
    type: 'custom',
    name: 'Untitled Integration',
    description: '',
    status: 'disconnected',
    connectedAt: null,
    lastSyncAt: null,
    config: {},
    capabilities: [],
});

/**
 * Factory for default QualitySummary
 */
export const createDefaultQualitySummary = (): QualitySummary => ({
    totalIssues: 0,
    criticalIssues: 0,
    highIssues: 0,
    mediumIssues: 0,
    lowIssues: 0,
    openIssues: 0,
    resolvedIssues: 0,
    completionRate: 0,
    lastScanDate: new Date().toISOString(),
    sources: [],
});
