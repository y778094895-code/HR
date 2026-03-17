// Settings Types - Phase 2 Module
// Types for Settings, Security, and Integrations frontend module

export interface OrganizationSettings {
  id?: string;
  companyName: string;
  industry: string;
  size: string;
  timezone: string;
  fiscalYearStart: string;
  language: 'ar' | 'en';
  dateFormat: string;
}

export interface NotificationSettings {
  id?: string;
  emailEnabled: boolean;
  emailNotifications: {
    newHires: boolean;
    attritionAlerts: boolean;
    performanceReviews: boolean;
    weeklyReports: boolean;
  };
  inAppEnabled: boolean;
  inAppNotifications: {
    realTimeAlerts: boolean;
    dailyDigest: boolean;
    weeklySummary: boolean;
  };
  smsEnabled: boolean;
  smsNotifications: {
    urgentAlerts: boolean;
    dailySummary: boolean;
  };
}

export interface SecuritySettings {
  id?: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: 'totp' | 'sms' | 'email' | null;
  lastPasswordChange: string;
  passwordPolicy: {
    require12Chars: boolean;
    requireSpecialChars: boolean;
    requireNumbers: boolean;
    requireUppercase: boolean;
    enforce90Days: boolean;
    preventReuse: number;
  };
  sessionTimeout: number;
  ipWhitelistEnabled: boolean;
  ipWhitelist: string[];
}

export interface AppearanceSettings {
  id?: string;
  theme: 'light' | 'dark' | 'midnight' | 'sand' | 'system';
  accentColor: 'default' | 'blue' | 'green' | 'purple' | 'orange';
  compactMode: boolean;
  animationsEnabled: boolean;
}

export interface GeneralSettings {
  id?: string;
  language: 'ar' | 'en';
  timezone: string;
  dateFormat: string;
  currency: string;
}

// User Session for active sessions management
export interface UserSession {
  id: string;
  device: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  current: boolean;
}

// API Response types
export interface SettingsResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SettingsUpdateRequest {
  category: 'organization' | 'notifications' | 'security' | 'appearance' | 'general';
  data: Partial<OrganizationSettings | NotificationSettings | SecuritySettings | AppearanceSettings | GeneralSettings>;
}

export interface SettingsExport {
  organization: OrganizationSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

