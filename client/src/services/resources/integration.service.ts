// Integration Service
// Handles API calls for integrations management
// Note: This service provides frontend-accessible API patterns
// Backend integration endpoints should be implemented to match these patterns

import { apiClient } from '../api/client';
import { normalizeKeys } from '../api/normalizers';
import type { 
    Integration, 
    IntegrationActionResponse,
    IntegrationSyncResult,
} from '@/types/integrations';
import { AVAILABLE_INTEGRATIONS } from '@/types/integrations';
import { createDefaultIntegration } from '@/utils/factories';

const coerceIntegration = (data: any): Integration => {
    const defaults = createDefaultIntegration(data?.id);
    if (!data) return defaults;
    
    return {
        ...defaults,
        ...data,
        config: data.config || {},
        capabilities: Array.isArray(data.capabilities) ? data.capabilities : [],
    };
};

const coerceIntegrations = (data: any[]): Integration[] => {
    if (!Array.isArray(data)) return AVAILABLE_INTEGRATIONS;
    return data.map(coerceIntegration);
};

const INTEGRATIONS_API = '/integrations';

class IntegrationService {
    // Get all available integrations
    async getIntegrations(): Promise<Integration[]> {
        try {
            const raw = await apiClient.get<unknown>(INTEGRATIONS_API);
            const normalized = normalizeKeys<unknown>(raw);
            
            // Handle both array response and wrapped response
            if (Array.isArray(normalized)) {
                return coerceIntegrations(normalized);
            }
            
            if (normalized && typeof normalized === 'object' && 'data' in normalized) {
                const data = (normalized as Record<string, unknown>).data;
                return Array.isArray(data) ? coerceIntegrations(data) : [];
            }
            
            return AVAILABLE_INTEGRATIONS;
        } catch (error) {
            console.warn('Integrations not available from API, returning available list:', error);
            return AVAILABLE_INTEGRATIONS;
        }
    }

    // Get a specific integration by ID
    async getIntegration(id: string): Promise<Integration | null> {
        try {
            const raw = await apiClient.get<unknown>(`${INTEGRATIONS_API}/${id}`);
            return coerceIntegration(normalizeKeys<any>(raw));
        } catch (error) {
            console.warn(`Integration ${id} not available from API:`, error);
            // Return from available list if exists
            return AVAILABLE_INTEGRATIONS.find(i => i.id === id) || null;
        }
    }

    // Connect an integration
    async connect(id: string, config: Record<string, unknown> = {}): Promise<IntegrationActionResponse> {
        try {
            const raw = await apiClient.post<unknown>(`${INTEGRATIONS_API}/${id}/connect`, config);
            return normalizeKeys<IntegrationActionResponse>(raw);
        } catch (error) {
            console.error(`Failed to connect integration ${id}:`, error);
            throw error;
        }
    }

    // Disconnect an integration
    async disconnect(id: string): Promise<IntegrationActionResponse> {
        try {
            const raw = await apiClient.post<unknown>(`${INTEGRATIONS_API}/${id}/disconnect`, {});
            return normalizeKeys<IntegrationActionResponse>(raw);
        } catch (error) {
            console.error(`Failed to disconnect integration ${id}:`, error);
            throw error;
        }
    }

    // Sync an integration
    async sync(id: string): Promise<IntegrationSyncResult> {
        try {
            const raw = await apiClient.post<unknown>(`${INTEGRATIONS_API}/${id}/sync`, {});
            return normalizeKeys<IntegrationSyncResult>(raw);
        } catch (error) {
            console.error(`Failed to sync integration ${id}:`, error);
            throw error;
        }
    }

    // Reconnect an integration (after error state)
    async reconnect(id: string): Promise<IntegrationActionResponse> {
        try {
            const raw = await apiClient.post<unknown>(`${INTEGRATIONS_API}/${id}/reconnect`, {});
            return normalizeKeys<IntegrationActionResponse>(raw);
        } catch (error) {
            console.error(`Failed to reconnect integration ${id}:`, error);
            throw error;
        }
    }

    // Configure an integration
    async configure(id: string, config: Record<string, unknown>): Promise<IntegrationActionResponse> {
        try {
            const raw = await apiClient.put<unknown>(`${INTEGRATIONS_API}/${id}/config`, config);
            return normalizeKeys<IntegrationActionResponse>(raw);
        } catch (error) {
            console.error(`Failed to configure integration ${id}:`, error);
            throw error;
        }
    }

    // Test an integration connection
    async testConnection(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const raw = await apiClient.post<unknown>(`${INTEGRATIONS_API}/${id}/test`, {});
            return normalizeKeys<{ success: boolean; message: string }>(raw);
        } catch (error) {
            console.error(`Failed to test integration ${id}:`, error);
            return { 
                success: false, 
                message: error instanceof Error ? error.message : 'Connection test failed' 
            };
        }
    }
}

export const integrationService = new IntegrationService();
export default integrationService;

