import { create } from 'zustand';
import { apiGet, apiPost } from '../../lib/api';
import { webSocketService, type WebSocketConnectionStatus } from '../../services/websocket';
import type {
    Alert,
    AlertExplanation,
    AlertRecommendation,
    AlertStatus,
    AlertType,
    AlertSeverity
} from '../../types/alerts';

interface AlertState {
    alerts: Alert[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    wsStatus: WebSocketConnectionStatus;
    filters: {
        type?: AlertType;
        severity?: AlertSeverity;
        status?: AlertStatus;
        searchQuery?: string;
    };

    // Actions
    fetchAlerts: () => Promise<void>;
    fetchAlertExplanation: (alertId: string) => Promise<AlertExplanation | null>;
    fetchAlertRecommendations: (alertId: string) => Promise<AlertRecommendation[]>;
    markAsRead: (id: string | string[]) => Promise<void>;
    updateStatus: (id: string, status: AlertStatus) => Promise<void>;
    setFilters: (filters: Partial<AlertState['filters']>) => void;
    clearFilters: () => void;
    
    // WebSocket integration
    initializeWebSocket: () => void;
    disconnectWebSocket: () => void;
    setWsStatus: (status: WebSocketConnectionStatus) => void;
    
    // Internal handlers for WebSocket events
    handleNewAlert: (alert: Alert) => void;
    handleAlertUpdate: (alert: Alert) => void;
    handleAlertDelete: (alertId: string) => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
    alerts: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    wsStatus: 'disconnected',
    filters: {},

    fetchAlerts: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiGet<any>('/alerts');
            const data = response.data || response;
            set({ alerts: data, unreadCount: data.filter((a: Alert) => !a.readAt).length, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch alerts', isLoading: false });
        }
    },

    fetchAlertExplanation: async (alertId: string) => {
        try {
            const response = await apiGet<any>(`/alerts/${alertId}/explanation`);
            return response.data || null;
        } catch (error) {
            return null;
        }
    },

    fetchAlertRecommendations: async (alertId: string) => {
        try {
            const response = await apiGet<any>(`/alerts/${alertId}/recommendations`);
            return response.data || [];
        } catch (error) {
            return [];
        }
    },

    markAsRead: async (id: string | string[]) => {
        const ids = Array.isArray(id) ? id : [id];
        set((state) => ({
            alerts: state.alerts.map(a =>
                ids.includes(a.id) ? { ...a, readAt: new Date().toISOString() } : a
            ),
            unreadCount: Math.max(0, state.unreadCount - ids.length)
        }));

        try {
            await Promise.all(ids.map(i => apiPost(`/alerts/${i}/action`, { action: 'mark_read' })));
        } catch (error) {
            console.error('Failed to mark alert as read via API');
        }
    },

    updateStatus: async (id: string, status: Alert['status']) => {
        set((state) => ({
            alerts: state.alerts.map(a =>
                a.id === id ? { ...a, status } : a
            )
        }));

        try {
            await apiPost(`/alerts/${id}/action`, { action: 'update_status', status });
        } catch (error) {
            console.error('Failed to update alert status via API');
        }
    },

    setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
    })),

    clearFilters: () => set({ filters: {} }),

    // WebSocket integration
    setWsStatus: (status) => set({ wsStatus: status }),

    initializeWebSocket: () => {
        const state = get();
        
        // Subscribe to WebSocket status changes
        webSocketService.onStatusChange((status) => {
            state.setWsStatus(status);
        });

        // Subscribe to new alert events
        webSocketService.subscribe('alert:new', (data) => {
            if (data && data.id) {
                state.handleNewAlert(data as Alert);
            }
        });

        // Subscribe to alert update events
        webSocketService.subscribe('alert:updated', (data) => {
            if (data && data.id) {
                state.handleAlertUpdate(data as Alert);
            }
        });

        // Subscribe to alert delete events
        webSocketService.subscribe('alert:deleted', (data) => {
            if (data && data.id) {
                state.handleAlertDelete(data.id);
            }
        });

        // Connect to WebSocket
        webSocketService.connect();
    },

    disconnectWebSocket: () => {
        webSocketService.disconnect();
    },

    handleNewAlert: (alert: Alert) => {
        set((state) => {
            // Check if alert already exists (avoid duplicates)
            const exists = state.alerts.some(a => a.id === alert.id);
            if (exists) {
                return state;
            }

            // Add new alert at the beginning
            const newAlerts = [alert, ...state.alerts];
            const newUnreadCount = alert.readAt ? state.unreadCount : state.unreadCount + 1;

            return {
                alerts: newAlerts,
                unreadCount: newUnreadCount
            };
        });
    },

    handleAlertUpdate: (alert: Alert) => {
        set((state) => {
            const existingIndex = state.alerts.findIndex(a => a.id === alert.id);
            if (existingIndex === -1) {
                return state;
            }

            const existing = state.alerts[existingIndex];
            const wasUnread = !existing.readAt;
            const isNowRead = !!alert.readAt;

            // Update the alert
            const newAlerts = [...state.alerts];
            newAlerts[existingIndex] = alert;

            // Update unread count if status changed
            let newUnreadCount = state.unreadCount;
            if (wasUnread && isNowRead) {
                newUnreadCount = Math.max(0, state.unreadCount - 1);
            } else if (!wasUnread && !isNowRead) {
                // Could add logic if needed
            }

            return {
                alerts: newAlerts,
                unreadCount: newUnreadCount
            };
        });
    },

    handleAlertDelete: (alertId: string) => {
        set((state) => {
            const alert = state.alerts.find(a => a.id === alertId);
            const wasUnread = alert && !alert.readAt;

            const newAlerts = state.alerts.filter(a => a.id !== alertId);
            const newUnreadCount = wasUnread 
                ? Math.max(0, state.unreadCount - 1) 
                : state.unreadCount;

            return {
                alerts: newAlerts,
                unreadCount: newUnreadCount
            };
        });
    }
}));

