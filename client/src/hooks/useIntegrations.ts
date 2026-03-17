// useIntegrations Hook
// Custom hook for managing integrations state and API interactions

import { useState, useEffect, useCallback } from 'react';
import { integrationService } from '@/services/resources/integration.service';
import type { Integration } from '@/types/integrations';

interface UseIntegrationsReturn {
    integrations: Integration[];
    isLoading: boolean;
    error: string | null;
    connect: (id: string, config?: Record<string, unknown>) => Promise<void>;
    disconnect: (id: string) => Promise<void>;
    sync: (id: string) => Promise<void>;
    reconnect: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export function useIntegrations(): UseIntegrationsReturn {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await integrationService.getIntegrations();
            setIntegrations(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load integrations');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const connect = useCallback(async (id: string, config: Record<string, unknown> = {}) => {
        setIsLoading(true);
        setError(null);
        try {
            await integrationService.connect(id, config);
            // Update local state to reflect connected status
            setIntegrations(prev => prev.map(integration => 
                integration.id === id 
                    ? { ...integration, status: 'connected' as const, connectedAt: new Date().toISOString() }
                    : integration
            ));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to connect integration';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const disconnect = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await integrationService.disconnect(id);
            // Update local state to reflect disconnected status
            setIntegrations(prev => prev.map(integration => 
                integration.id === id 
                    ? { ...integration, status: 'disconnected' as const, connectedAt: null }
                    : integration
            ));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect integration';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const sync = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await integrationService.sync(id);
            // Update local state with new sync time
            setIntegrations(prev => prev.map(integration => 
                integration.id === id 
                    ? { ...integration, lastSyncAt: new Date().toISOString() }
                    : integration
            ));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sync integration';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reconnect = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await integrationService.reconnect(id);
            // Update local state to reflect reconnected status
            setIntegrations(prev => prev.map(integration => 
                integration.id === id 
                    ? { ...integration, status: 'connected' as const }
                    : integration
            ));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to reconnect integration';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { 
        integrations, 
        isLoading, 
        error, 
        connect, 
        disconnect, 
        sync, 
        reconnect,
        refresh 
    };
}

// Single Integration Hook
interface UseIntegrationReturn {
    integration: Integration | null;
    isLoading: boolean;
    error: string | null;
    connect: (config?: Record<string, unknown>) => Promise<void>;
    disconnect: () => Promise<void>;
    sync: () => Promise<void>;
    reconnect: () => Promise<void>;
    testConnection: () => Promise<{ success: boolean; message: string }>;
}

export function useIntegration(id: string): UseIntegrationReturn {
    const [integration, setIntegration] = useState<Integration | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await integrationService.getIntegration(id);
            setIntegration(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load integration');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    const connect = useCallback(async (config: Record<string, unknown> = {}) => {
        setIsLoading(true);
        setError(null);
        try {
            await integrationService.connect(id, config);
            await refresh();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to connect integration';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [id, refresh]);

    const disconnect = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await integrationService.disconnect(id);
            await refresh();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect integration';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [id, refresh]);

    const sync = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await integrationService.sync(id);
            await refresh();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sync integration';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [id, refresh]);

    const reconnect = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await integrationService.reconnect(id);
            await refresh();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to reconnect integration';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [id, refresh]);

    const testConnection = useCallback(async (): Promise<{ success: boolean; message: string }> => {
        try {
            return await integrationService.testConnection(id);
        } catch (err) {
            return { 
                success: false, 
                message: err instanceof Error ? err.message : 'Connection test failed' 
            };
        }
    }, [id]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { 
        integration, 
        isLoading, 
        error, 
        connect, 
        disconnect, 
        sync, 
        reconnect,
        testConnection
    };
}

