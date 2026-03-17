import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useAlertStore } from '@/stores/business/alert.store';
import { webSocketService, type WebSocketConnectionStatus } from '@/services/websocket';
import type { Alert, AlertSeverity } from '@/types/alerts';

// Track which alerts we've already shown a toast for (to avoid duplicates)
const shownToastAlertIds = new Set<string>();

/**
 * Hook to manage WebSocket connection for alerts and show toast notifications
 * for new incoming alerts
 */
export function useAlertWebSocket() {
    const {
        initializeWebSocket,
        disconnectWebSocket,
        wsStatus,
        handleNewAlert,
        alerts
    } = useAlertStore();

    const initializedRef = useRef(false);
    const previousAlertsLengthRef = useRef(alerts.length);

    // Initialize WebSocket on mount
    useEffect(() => {
        if (!initializedRef.current) {
            initializedRef.current = true;
            initializeWebSocket();
        }

        // Cleanup on unmount
        return () => {
            disconnectWebSocket();
            initializedRef.current = false;
        };
    }, [initializeWebSocket, disconnectWebSocket]);

    // Watch for new alerts and show toast notifications
    useEffect(() => {
        const currentLength = alerts.length;
        const previousLength = previousAlertsLengthRef.current;

        if (currentLength > previousLength && alerts.length > 0) {
            // Find the newest alert(s)
            const newestAlerts = alerts.slice(0, currentLength - previousLength);
            
            newestAlerts.forEach((alert) => {
                // Skip if we've already shown a toast for this alert
                if (shownToastAlertIds.has(alert.id)) {
                    return;
                }
                shownToastAlertIds.add(alert.id);

                // Show toast for important alerts
                showAlertToast(alert);
            });
        }

        previousAlertsLengthRef.current = currentLength;
    }, [alerts]);

    // Clear the tracked toast IDs when the user navigates away or alerts are refetched
    const clearShownToastIds = useCallback(() => {
        shownToastAlertIds.clear();
    }, []);

    return {
        wsStatus,
        isConnected: wsStatus === 'connected',
        isConnecting: wsStatus === 'connecting',
        clearShownToastIds
    };
}

/**
 * Show a toast notification for a new alert
 */
function showAlertToast(alert: Alert) {
    const severityColors: Record<AlertSeverity, string> = {
        CRITICAL: '#ef4444', // red-500
        HIGH: '#f97316',     // orange-500
        MEDIUM: '#eab308',   // yellow-500
        LOW: '#22c55e'       // green-500
    };

    const severityLabels: Record<AlertSeverity, string> = {
        CRITICAL: 'حرج',
        HIGH: 'عالي',
        MEDIUM: 'متوسط',
        LOW: 'منخفض'
    };

    const severity = alert.severity || 'MEDIUM';
    const color = severityColors[severity];
    const label = severityLabels[severity];

    // Only show toasts for HIGH and CRITICAL severity alerts by default
    if (severity !== 'CRITICAL' && severity !== 'HIGH') {
        return;
    }

    const toastId = `alert-${alert.id}`;
    
    toast(
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <span 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: color }}
                />
                <span className="font-semibold text-sm">{alert.title}</span>
            </div>
            {alert.description && (
                <span className="text-xs text-muted-foreground line-clamp-2 ms-4">
                    {alert.description}
                </span>
            )}
            <div className="flex items-center gap-2 ms-4 mt-1">
                <span 
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{ 
                        backgroundColor: `${color}20`,
                        color: color
                    }}
                >
                    {label}
                </span>
                {alert.employeeName && (
                    <span className="text-[10px] text-muted-foreground">
                        • {alert.employeeName}
                    </span>
                )}
            </div>
        </div>,
        {
            id: toastId,
            duration: 5000,
            onDismiss: () => {
                shownToastAlertIds.delete(alert.id);
            },
            action: {
                label: 'عرض',
                onClick: () => {
                    // Navigate to alerts page - this will be handled by the component
                    window.location.href = '/dashboard/alerts';
                }
            }
        }
    );
}

/**
 * Hook to get WebSocket connection status for alerts
 */
export function useAlertWsStatus() {
    const wsStatus = useAlertStore((state) => state.wsStatus);
    return wsStatus;
}

