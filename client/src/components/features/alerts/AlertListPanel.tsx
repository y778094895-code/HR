import React, { useCallback, useRef } from 'react';
import { AlertCard } from './AlertCard';
import { LoadingSkeleton } from '@/components/ui/feedback/LoadingSkeleton';
import { EmptyState } from '@/components/ui/feedback/EmptyState';
import { useTranslation } from 'react-i18next';
import type { Alert, AlertPermissions, AlertAuditEvent } from '@/types/alerts';

interface AlertListPanelProps {
    alerts: Alert[];
    isLoading: boolean;
    selectedAlertId: string | null;
    selectedIds: Set<string>;
    onSelect: (id: string) => void;
    onCheckToggle: (id: string, checked: boolean) => void;
    onAcknowledge?: (id: string) => void;
    onConvert?: (id: string) => void;
    onDismiss?: (id: string) => void;
    onEscalate?: (id: string) => void;
    onMarkRead?: (id: string) => void;
    permissions: AlertPermissions;
    maskEmployee?: boolean;
}

export function AlertListPanel({
    alerts,
    isLoading,
    selectedAlertId,
    selectedIds,
    onSelect,
    onCheckToggle,
    onAcknowledge,
    onConvert,
    onDismiss,
    onEscalate,
    onMarkRead,
    permissions,
    maskEmployee,
}: AlertListPanelProps) {
    const { t } = useTranslation();
    const lastCheckedRef = useRef<number | null>(null);

    // Shift+Click range selection
    const handleCheck = useCallback(
        (id: string, checked: boolean, event?: React.MouseEvent) => {
            const index = alerts.findIndex((a) => a.id === id);

            if (event?.shiftKey && lastCheckedRef.current !== null && lastCheckedRef.current !== index) {
                const start = Math.min(lastCheckedRef.current, index);
                const end = Math.max(lastCheckedRef.current, index);
                for (let i = start; i <= end; i++) {
                    onCheckToggle(alerts[i].id, checked);
                }
            } else {
                onCheckToggle(id, checked);
            }

            lastCheckedRef.current = index;
        },
        [alerts, onCheckToggle]
    );

    if (isLoading) {
        return (
            <div className="p-4 space-y-3">
                <LoadingSkeleton rows={8} height="5rem" />
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <EmptyState description={t('alerts.noAlerts', 'لا توجد تنبيهات تطابق معايير البحث')} />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-accent">
            {alerts.map((alert) => (
                <AlertCard
                    key={alert.id}
                    alert={alert}
                    isSelected={selectedAlertId === alert.id}
                    isChecked={selectedIds.has(alert.id)}
                    onSelect={() => onSelect(alert.id)}
                    onCheckToggle={(checked) => handleCheck(alert.id, checked)}
                    onAcknowledge={onAcknowledge ? () => onAcknowledge(alert.id) : undefined}
                    onConvert={onConvert ? () => onConvert(alert.id) : undefined}
                    onDismiss={onDismiss ? () => onDismiss(alert.id) : undefined}
                    onEscalate={onEscalate ? () => onEscalate(alert.id) : undefined}
                />
            ))}
        </div>
    );
}
