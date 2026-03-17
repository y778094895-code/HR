import { API_CONFIG } from '../config/api';

export type WebSocketConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

type EventHandler = (data: any) => void;
type StatusChangeHandler = (status: WebSocketConnectionStatus) => void;

interface AlertEventPayload {
    alert?: {
        id: string;
        type: string;
        severity: string;
        status: string;
        title: string;
        description: string;
        employeeId?: string;
        employeeName?: string;
        department?: string;
        riskScore?: number;
        triggeredAt: string;
        modelSource?: string;
        readAt: string | null;
        resolvedAt?: string | null;
        assignedToUserId?: string;
        assignedToName?: string;
        escalated?: boolean;
        convertedCaseId?: string;
        mlModelVersion?: string;
        confidenceScore?: number;
    };
    alerts?: any[];
    data?: any;
}

class WebSocketService {
    private socket: WebSocket | null = null;
    private handlers: Map<string, EventHandler[]> = new Map();
    private statusHandlers: StatusChangeHandler[] = [];
    private reconnectInterval = 3000;
    private maxReconnectAttempts = 10;
    private reconnectAttempts = 0;
    private shouldReconnect = true;
    private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
    private connectionStatus: WebSocketConnectionStatus = 'disconnected';

    get status(): WebSocketConnectionStatus {
        return this.connectionStatus;
    }

    private setStatus(status: WebSocketConnectionStatus) {
        this.connectionStatus = status;
        this.statusHandlers.forEach(handler => handler(status));
    }

    connect() {
        if (this.socket?.readyState === WebSocket.OPEN) {
            return;
        }

        this.shouldReconnect = true;
        this.setStatus('connecting');

        try {
            this.socket = new WebSocket(API_CONFIG.wsURL);

            this.socket.onopen = () => {
                console.log('WebSocket Connected');
                this.setStatus('connected');
                this.reconnectAttempts = 0;
                this.startHeartbeat();
            };

            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('WebSocket Message Parse Error:', error);
                }
            };

            this.socket.onclose = (event) => {
                console.log('WebSocket Disconnected', event.code, event.reason);
                this.setStatus('disconnected');
                this.stopHeartbeat();

                if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    const delay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), 60000);
                    // Only log every 3 attempts to reduce noise
                    if (this.reconnectAttempts % 3 === 0 || this.reconnectAttempts === 1) {
                        console.log(`WebSocket Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                    }
                    setTimeout(() => this.connect(), delay);
                } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    console.warn('WebSocket: Max reconnection attempts reached. Stopping retries until manual reconnect.');
                    this.setStatus('error');
                }
            };

            this.socket.onerror = (error) => {
                // Silenced error logs to reduce noise
                this.setStatus('error');
            };
        } catch (error) {
            console.warn('WebSocket Connection Issue: Server unreachable');
            this.setStatus('error');
        }
    }

    private handleMessage(message: any) {
        if (!message || typeof message !== 'object') {
            console.warn('WebSocket: Invalid message format');
            return;
        }

        const { eventType, data } = message;

        if (!eventType) {
            console.warn('WebSocket: Missing eventType in message');
            return;
        }

        // Handle alert-specific events with payload normalization
        if (eventType === 'alert:new' || eventType === 'alert:created') {
            const normalizedData = this.normalizeAlertPayload(data);
            if (normalizedData) {
                const handlers = this.handlers.get('alert:new');
                if (handlers) {
                    handlers.forEach(handler => handler(normalizedData));
                }
            }
            return;
        }

        if (eventType === 'alert:updated') {
            const normalizedData = this.normalizeAlertPayload(data);
            if (normalizedData) {
                const handlers = this.handlers.get('alert:updated');
                if (handlers) {
                    handlers.forEach(handler => handler(normalizedData));
                }
            }
            return;
        }

        if (eventType === 'alert:deleted') {
            const handlers = this.handlers.get('alert:deleted');
            if (handlers) {
                handlers.forEach(handler => handler(data));
            }
            return;
        }

        // Generic event handling
        const handlers = this.handlers.get(eventType);
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
    }

    /**
     * Normalize incoming alert payload to handle various wrapper formats
     * Supports: {alert: {...}}, {data: {...}}, {alerts: [...]}, direct alert object
     */
    private normalizeAlertPayload(data: any): any | null {
        if (!data) {
            return null;
        }

        // Handle { alert: {...} } wrapper
        if (data.alert && typeof data.alert === 'object') {
            return data.alert;
        }

        // Handle { data: {...} } wrapper
        if (data.data && typeof data.data === 'object') {
            return data.data;
        }

        // Handle direct alert object
        if (data.id && data.title) {
            return data;
        }

        // Handle array - return first element if it looks like an alert
        if (Array.isArray(data) && data.length > 0) {
            const first = data[0];
            if (first && typeof first === 'object' && first.id && first.title) {
                return first;
            }
        }

        console.warn('WebSocket: Could not normalize alert payload', data);
        return null;
    }

    private startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            if (this.socket?.readyState === WebSocket.OPEN) {
                try {
                    this.socket.send(JSON.stringify({ type: 'ping' }));
                } catch (error) {
                    console.error('WebSocket Heartbeat Error:', error);
                }
            }
        }, 30000);
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    subscribe(eventType: string, handler: EventHandler) {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType)?.push(handler);
    }

    unsubscribe(eventType: string, handler: EventHandler) {
        const handlers = this.handlers.get(eventType);
        if (handlers) {
            this.handlers.set(eventType, handlers.filter(h => h !== handler));
        }
    }

    onStatusChange(handler: StatusChangeHandler) {
        this.statusHandlers.push(handler);
        // Immediately call with current status
        handler(this.connectionStatus);
    }

    removeStatusHandler(handler: StatusChangeHandler) {
        this.statusHandlers = this.statusHandlers.filter(h => h !== handler);
    }

    disconnect() {
        this.shouldReconnect = false;
        this.stopHeartbeat();
        if (this.socket) {
            this.socket.close(1000, 'Client disconnect');
            this.socket = null;
        }
        this.setStatus('disconnected');
    }

    isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }
}

export const webSocketService = new WebSocketService();
export default webSocketService;

// Re-export types for consumers
export type { AlertEventPayload };

