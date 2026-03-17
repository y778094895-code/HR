import React, { useMemo } from 'react';
import { useAlertStore } from '@/stores/business/alert.store';
import { useTranslation } from 'react-i18next';
import { Activity, Download, Filter, Search, Clock, FileText, Server, User } from 'lucide-react';
import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import { ScrollArea } from '@/components/ui/layout/scroll-area';

export default function ResponseLogPage() {
    const { t } = useTranslation();
    const { alerts } = useAlertStore();

    // In a logical mapping for the unified experience, 
    // we show alerts that are not 'NEW' or 'UNREAD' as they have been responded to.
    const processedAlerts = useMemo(() =>
        alerts.filter(a => a.status !== 'NEW'),
        [alerts]
    );

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-slate-950 animate-in fade-in zoom-in-95 duration-200">
            {/* Page Header */}
            <div className="p-4 sm:p-6 pb-4 shrink-0 border-b border-border/50 bg-white dark:bg-card">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Activity className="h-6 w-6 text-violet-600 dark:text-violet-500" />
                            {t('alerts.responseLog', 'سجل الاستجابة (Operations Log)')}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            تحليل أداء الاستجابة وتتبع إجراءات الموارد البشرية عبر النظام.
                        </p>
                    </div>
                </div>

                {/* KPI Widgets Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full -z-0" />
                        <span className="text-sm font-medium text-muted-foreground mb-2 z-10">{t('alerts.processedCount', 'تنبيهات تمت معالجتها')}</span>
                        <div className="flex items-end gap-2 z-10">
                            <span className="text-2xl font-bold">{processedAlerts.length}</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full -z-0" />
                        <span className="text-sm font-medium text-muted-foreground mb-2 z-10">MTTR (متوسط زمن الحل)</span>
                        <div className="flex items-end gap-2 z-10">
                            <span className="text-2xl font-bold">1.5</span>
                            <span className="text-sm text-emerald-500 font-semibold mb-1">ساعة</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/5 rounded-bl-full -z-0" />
                        <span className="text-sm font-medium text-muted-foreground mb-2 z-10">SLA Compliance</span>
                        <div className="flex items-end gap-2 z-10">
                            <span className="text-2xl font-bold">94.8%</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-full -z-0" />
                        <span className="text-sm font-medium text-muted-foreground mb-2 z-10">Escalation Rate</span>
                        <div className="flex items-end gap-2 z-10">
                            <span className="text-2xl font-bold">6.1%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audit Table Controls */}
            <div className="p-4 shrink-0 bg-[#f8fafc] dark:bg-slate-950 border-b border-border/40">
                <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 w-full max-w-sm relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="بحث في السجل..."
                            className="bg-white dark:bg-card pr-9 h-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9 gap-2 bg-white dark:bg-card">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            فلاتر
                        </Button>
                        <Button variant="default" size="sm" className="h-9 gap-2 shadow-sm">
                            <Download className="w-4 h-4" />
                            تصدير
                        </Button>
                    </div>
                </div>
            </div>

            {/* DataGrid Table Space */}
            <ScrollArea className="flex-1 bg-white dark:bg-transparent p-0 relative">
                <div className="min-w-[1000px] w-full max-w-7xl mx-auto align-middle inline-block p-4">
                    <div className="border border-border/60 rounded-lg overflow-hidden bg-white dark:bg-card shadow-sm">
                        <table className="min-w-full divide-y divide-border/60">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        الوقت (Time)
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        التنبيه (Alert ID)
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        المسؤول (Actor)
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        الإجراء (Action)
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        الحالة (Status)
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        ملاحظة (Note)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-card divide-y divide-border/40">
                                {processedAlerts.length > 0 ? processedAlerts.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-muted-foreground">
                                            {new Date(log.triggeredAt).toLocaleString('ar-SA')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-primary">
                                            {log.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-slate-400" />
                                                <span className="font-medium">{log.assignedToName || 'System'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground/80">
                                            Update Status
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Badge variant="secondary" className="text-[10px] py-0 px-2 font-mono">
                                                {log.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-foreground max-w-xs truncate">
                                            {log.description}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground bg-slate-50/30 dark:bg-slate-900/10">
                                            لا توجد سجلات حالياً.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
