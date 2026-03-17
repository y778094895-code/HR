import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Alert } from '@/types/alerts';
import { AlertsLayout } from '@/components/features/alerts/AlertsLayout';
import { AlertsSidebar } from '@/components/features/alerts/AlertsSidebar';
import { AlertDetailsPanel } from '@/components/features/alerts/AlertDetailsPanel';

interface AlertsSplitViewProps {
    alerts: Alert[];
    // Allows pages to pass a subset of alerts initially 
    // or handle global read/acknowledge actions if lifted up in the future.
    onUpdateAlert?: (id: string, updates: Partial<Alert>) => void;
    // Specific page header config
    title: React.ReactNode;
    description: string;
}

export function AlertsSplitView({ alerts: initialAlerts, onUpdateAlert, title, description }: AlertsSplitViewProps) {
    // This is local state for now until global state/backend is integrated
    const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
    const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    // Keep local alerts in sync if prop changes
    useEffect(() => {
        setAlerts(initialAlerts);
    }, [initialAlerts]);

    const activeAlert = useMemo(() =>
        alerts.find(a => a.id === selectedAlertId) || null
        , [alerts, selectedAlertId]);

    const filteredAlerts = useMemo(() => {
        let result = alerts;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a =>
                a.title.toLowerCase().includes(q) ||
                (a.description || '').toLowerCase().includes(q) ||
                a.id.toLowerCase().includes(q)
            );
        }
        return result;
    }, [alerts, searchQuery]);

    // -- Actions --
    const applyUpdate = useCallback((id: string, update: Partial<Alert>) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, ...update } : a));
        if (onUpdateAlert) onUpdateAlert(id, update);
    }, [onUpdateAlert]);

    const handleSelectAlert = useCallback((id: string) => {
        setSelectedAlertId(id);
        applyUpdate(id, { readAt: new Date().toISOString() }); // Auto read
    }, [applyUpdate]);

    const handleToggleSelection = useCallback((id: string, checked: boolean) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    }, []);

    const handleAcknowledge = useCallback((id: string) => applyUpdate(id, { status: 'ACKNOWLEDGED', readAt: new Date().toISOString() }), [applyUpdate]);
    const handleConvert = useCallback((id: string) => applyUpdate(id, { status: 'ACTIONED', readAt: new Date().toISOString() }), [applyUpdate]);
    const handleEscalate = useCallback((id: string) => applyUpdate(id, { escalated: true, readAt: new Date().toISOString() }), [applyUpdate]);
    const handleDismiss = useCallback((id: string) => applyUpdate(id, { status: 'CLOSED', readAt: new Date().toISOString() }), [applyUpdate]);

    const handleBulkAcknowledge = useCallback(() => {
        if (selectedIds.size === 0) return;
        setAlerts(prev => prev.map(a =>
            selectedIds.has(a.id) && a.status === 'NEW' ? { ...a, status: 'ACKNOWLEDGED', readAt: new Date().toISOString() } : a
        ));
        setSelectedIds(new Set());
    }, [selectedIds]);

    const handleBulkConvert = useCallback(() => {
        if (selectedIds.size === 0) return;
        setAlerts(prev => prev.map(a =>
            selectedIds.has(a.id) ? { ...a, status: 'ACTIONED', readAt: new Date().toISOString() } : a
        ));
        setSelectedIds(new Set());
    }, [selectedIds]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLSelectElement
            ) return;

            if (!selectedAlertId) return;

            switch (e.key.toLowerCase()) {
                case 'a': e.preventDefault(); handleAcknowledge(selectedAlertId); break;
                case 'e': e.preventDefault(); handleEscalate(selectedAlertId); break;
                case 'c': e.preventDefault(); handleConvert(selectedAlertId); break;
                case 'backspace':
                case 'delete': e.preventDefault(); handleDismiss(selectedAlertId); break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedAlertId, handleAcknowledge, handleEscalate, handleConvert, handleDismiss]);

    return (
        <div className="flex flex-col h-full bg-background animate-in fade-in zoom-in-95 duration-200">
            {/* Page Header (replaces Tabs) */}
            <div className="p-4 sm:p-6 pb-2 shrink-0 border-b border-border/50 bg-background/50">
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    {title}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {description}
                </p>
            </div>

            <div className="flex-1 overflow-hidden">
                <AlertsLayout
                    sidebarContent={
                        <AlertsSidebar
                            alerts={filteredAlerts}
                            selectedAlertId={selectedAlertId}
                            onSelectAlert={handleSelectAlert}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            selectedIds={selectedIds}
                            onToggleSelection={handleToggleSelection}
                            onBulkAcknowledge={handleBulkAcknowledge}
                            onBulkConvert={handleBulkConvert}
                            onAcknowledge={handleAcknowledge}
                            onConvert={handleConvert}
                        />
                    }
                    mainContent={
                        <AlertDetailsPanel
                            alert={activeAlert}
                            maskEmployee={true}
                            onAcknowledge={handleAcknowledge}
                            onConvert={handleConvert}
                            onDismiss={handleDismiss}
                            onEscalate={handleEscalate}
                            onAssign={() => { }} // Placeholder
                        />
                    }
                />
            </div>
        </div>
    );
}
