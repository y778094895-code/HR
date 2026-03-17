import React from 'react';
import { AlertsToolbar } from './AlertsToolbar';
import { Alert } from '@/types/alerts';
import { AlertCard } from './AlertCard'; // Will update/create next

interface AlertsSidebarProps {
    alerts: Alert[];
    isLoading?: boolean;
    selectedAlertId: string | null;
    onSelectAlert: (id: string) => void;
    searchQuery: string;
    onSearchChange: (q: string) => void;
    selectedIds: Set<string>;
    onToggleSelection: (id: string, selected: boolean) => void;
    onBulkAcknowledge?: () => void;
    onBulkConvert?: () => void;
    onAcknowledge?: (id: string) => void;
    onConvert?: (id: string) => void;
}

export function AlertsSidebar({
    alerts,
    isLoading,
    selectedAlertId,
    onSelectAlert,
    searchQuery,
    onSearchChange,
    selectedIds,
    onToggleSelection,
    onBulkAcknowledge,
    onBulkConvert,
    onAcknowledge,
    onConvert
}: AlertsSidebarProps) {

    // Empty State handling inside list wrapper
    const renderContent = () => {
        if (alerts.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-center h-40 opacity-70">
                    <div className="bg-muted p-3 rounded-full mb-3">
                        <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                    </div>
                    <h3 className="text-sm font-medium mb-1">لا توجد تنبيهات</h3>
                    <p className="text-xs text-muted-foreground">لم يتم العثور على تنبيهات تطابق معايير البحث.</p>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-1 p-2">
                {alerts.map((alert) => (
                    <AlertCard
                        key={alert.id}
                        alert={alert}
                        isSelected={alert.id === selectedAlertId}
                        isChecked={selectedIds.has(alert.id)}
                        onSelect={() => onSelectAlert(alert.id)}
                        onCheckToggle={(checked) => onToggleSelection(alert.id, checked)}
                        onAcknowledge={onAcknowledge ? () => onAcknowledge(alert.id) : undefined}
                        onConvert={onConvert ? () => onConvert(alert.id) : undefined}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full opacity-0 animate-in fade-in duration-300">
            <AlertsToolbar
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                selectedCount={selectedIds.size}
                totalCount={alerts.length}
                onBulkAcknowledge={onBulkAcknowledge}
                onBulkConvert={onBulkConvert}
            />
            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                {renderContent()}
            </div>
        </div>
    );
}
