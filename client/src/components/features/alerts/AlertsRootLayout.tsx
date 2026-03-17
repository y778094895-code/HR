import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom';
import { Inbox, CheckCircle2, AlertTriangle, Activity, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/buttons/button';
import { useAlertStore } from '@/stores/business/alert.store';

export function AlertsRootLayout() {
    const { t } = useTranslation();
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const { alerts } = useAlertStore();

    // Counts for badges
    const unreadCount = alerts.filter(a => !a.readAt).length;
    const highRiskCount = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;

    const navLinks = [
        {
            to: '/dashboard/alerts/all',
            label: 'كل التنبيهات',
            icon: <Inbox className="h-5 w-5" />,
            badge: null,
            color: 'text-foreground'
        },
        {
            to: '/dashboard/alerts/unread',
            label: 'غير المقروءة',
            icon: <CheckCircle2 className="h-5 w-5" />,
            badge: unreadCount > 0 ? (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                </span>
            ) : null,
            color: 'text-blue-500'
        },
        {
            to: '/dashboard/alerts/high-risk',
            label: 'عالية الخطورة',
            icon: <AlertTriangle className="h-5 w-5" />,
            badge: highRiskCount > 0 ? (
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {highRiskCount}
                </span>
            ) : null,
            color: 'text-orange-500'
        },
        {
            to: '/dashboard/alerts/response-log',
            label: 'سجل الاستجابة (KPIs)',
            icon: <Activity className="h-5 w-5" />,
            badge: null,
            color: 'text-violet-500'
        }
    ];

    const closeMobileMenu = () => setIsMobileOpen(false);

    return (
        <div className="flex h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 bg-background overflow-hidden relative" dir="rtl">

            {/* Mobile Sidebar Toggle Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Header (Shows only on small screens to toggle menu) */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-border/50 bg-card z-30">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-primary" />
                        مركز التنبيهات
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>

                {/* Sub-routes render here */}
                <div className="flex-1 overflow-hidden">
                    <Outlet />
                </div>
            </div>

            {/* Sidebar Navigation */}
            <div className={cn(
                "fixed inset-y-0 end-0 z-50 w-72 bg-card border-s border-border/50 shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none flex flex-col",
                isMobileOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="p-6 border-b border-border/50 shrink-0 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                            <AlertTriangle className="h-6 w-6 text-primary" />
                            مركز التنبيهات
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">إدارة ومتابعة أحداث النظام</p>
                    </div>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={closeMobileMenu}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                        فروع التنبيهات
                    </div>
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={closeMobileMenu}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                                    : "text-foreground/80 hover:bg-muted/60 hover:text-foreground border border-transparent"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={cn(
                                        "p-1.5 rounded-lg transition-colors",
                                        isActive ? "bg-background shadow-xs text-primary" : "bg-muted text-muted-foreground group-hover:text-foreground"
                                    )}>
                                        {/* Colored icon based on branch, or primary if active */}
                                        <div className={isActive ? "" : link.color}>
                                            {link.icon}
                                        </div>
                                    </div>
                                    <span className="flex-1">{link.label}</span>
                                    {link.badge && (
                                        <div className={cn(
                                            "transition-transform",
                                            isActive ? "scale-110" : "scale-100"
                                        )}>
                                            {link.badge}
                                        </div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
}
