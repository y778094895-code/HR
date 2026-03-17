// Integration Types
// Type definitions for integrations module

export interface Integration {
    id: string;
    type: IntegrationType;
    name: string;
    description: string;
    logoUrl?: string;
    status: IntegrationStatus;
    connectedAt: string | null;
    lastSyncAt: string | null;
    config: IntegrationConfig;
    capabilities: IntegrationCapability[];
}

export type IntegrationType = 
    | 'slack'
    | 'google_workspace'
    | 'microsoft_365'
    | 'workday'
    | 'successfactors'
    | 'adp'
    | ' BambooHR'
    | 'custom';

export type IntegrationStatus = 
    | 'connected'
    | 'disconnected'
    | 'error'
    | 'pending'
    | 'syncing';

export interface IntegrationConfig {
    webhookUrl?: string;
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
    tenantId?: string;
    channelId?: string;
    syncInterval?: number;
    enabledFeatures?: string[];
}

export interface IntegrationCapability {
    feature: string;
    enabled: boolean;
    lastSync?: string;
}

export interface IntegrationAction {
    type: 'connect' | 'disconnect' | 'sync' | 'configure' | 'reconnect';
    integrationId: string;
    payload?: Record<string, unknown>;
}

export interface IntegrationSyncResult {
    success: boolean;
    recordsProcessed: number;
    errors: string[];
    syncedAt: string;
}

// API Response types
export interface IntegrationListResponse {
    success: boolean;
    data: Integration[];
    total: number;
}

export interface IntegrationResponse {
    success: boolean;
    data: Integration;
}

export interface IntegrationActionResponse {
    success: boolean;
    message: string;
    data?: IntegrationSyncResult;
}

// Predefined integrations available in the system
export const AVAILABLE_INTEGRATIONS: Integration[] = [
    {
        id: 'slack',
        type: 'slack',
        name: 'Slack',
        description: 'Receive notifications and alerts in Slack channels',
        status: 'disconnected',
        connectedAt: null,
        lastSyncAt: null,
        config: {},
        capabilities: [
            { feature: 'notifications', enabled: false },
            { feature: 'alerts', enabled: false }
        ]
    },
    {
        id: 'google_workspace',
        type: 'google_workspace',
        name: 'Google Workspace',
        description: 'Sync calendar, users, and directory from Google Workspace',
        status: 'disconnected',
        connectedAt: null,
        lastSyncAt: null,
        config: {},
        capabilities: [
            { feature: 'user_sync', enabled: false },
            { feature: 'calendar', enabled: false },
            { feature: 'directory', enabled: false }
        ]
    },
    {
        id: 'microsoft_365',
        type: 'microsoft_365',
        name: 'Microsoft 365',
        description: 'Sync with Microsoft Azure AD and Office 365',
        status: 'disconnected',
        connectedAt: null,
        lastSyncAt: null,
        config: {},
        capabilities: [
            { feature: 'user_sync', enabled: false },
            { feature: 'calendar', enabled: false },
            { feature: 'directory', enabled: false }
        ]
    },
    {
        id: 'workday',
        type: 'workday',
        name: 'Workday',
        description: 'Integrate with Workday HCM for employee data',
        status: 'disconnected',
        connectedAt: null,
        lastSyncAt: null,
        config: {},
        capabilities: [
            { feature: 'employee_data', enabled: false },
            { feature: 'org_chart', enabled: false }
        ]
    },
    {
        id: 'successfactors',
        type: 'successfactors',
        name: 'SAP SuccessFactors',
        description: 'Integrate with SAP SuccessFactors HR system',
        status: 'disconnected',
        connectedAt: null,
        lastSyncAt: null,
        config: {},
        capabilities: [
            { feature: 'employee_data', enabled: false },
            { feature: 'performance', enabled: false }
        ]
    }
];

