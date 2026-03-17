import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/buttons/button';
import {
    CheckCircle, ArrowUpRight, Briefcase, XCircle, UserPlus, Clock,
    AlertTriangle, Target, Link as LinkIcon, FileText, Shield, Hourglass
} from 'lucide-react';
import type { Alert } from '@/types/alerts';
import { useTranslation } from 'react-i18next';

interface AlertDetailsPanelProps {
    alert: Alert | null;
    maskEmployee?: boolean;
    onAcknowledge?: (id: string) => void;
    onConvert?: (id: string) => void;
    onDismiss?: (id: string) => void;
    onEscalate?: (id: string) => void;
    onAssign?: (id: string) => void;
}

const SEVERITY_COLORS: Record<string, string> = {
    CRITICAL: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950/40',
    HIGH: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950/40',
    MEDIUM: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/40',
    LOW: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800',
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    NEW: { label: 'جديد', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    ACKNOWLEDGED: { label: 'تم الاستلام', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
    ACTIONED: { label: 'تم التعامل', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
    CLOSED: { label: 'مغلق', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
    ARCHIVED: { label: 'مؤرشف', color: 'bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400' },
};

const ACTION_LABELS: Record<string, string> = {
    ACKNOWLEDGE: 'تم الاستلام',
    ASSIGN: 'تغيير المتلقّي',
    CONVERT_TO_CASE: 'تحويل إلى حالة تحقيق',
    DISMISS: 'رفض',
    ESCALATE: 'تصعيد للإدارة',
    CLOSE: 'إغلاق التنبيه',
    NOTE_ADDED: 'ملاحظة مضافة',
};

export function AlertDetailsPanel({
    alert,
    maskEmployee,
    onAcknowledge,
    onConvert,
    onDismiss,
    onEscalate,
    onAssign,
}: AlertDetailsPanelProps) {
    const { t } = useTranslation();

    if (!alert) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 opacity-70" aria-live="polite">
                <Shield className="h-16 w-16 mb-4 text-muted border-2 focus-visible:outline-none" />
                <h3 className="text-lg font-medium text-foreground mb-1">مركز تفاصيل التنبيهات</h3>
                <p className="text-sm">يُرجى اختيار تنبيه من القائمة الجانبية لعرض التفاصيل الكاملة.</p>
            </div>
        );
    }

    const statusInfo = STATUS_MAP[alert.status] || STATUS_MAP.NEW;
    const sevColor = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.LOW;

    // Helper to calculate MTTA / SLA
    const timeRemaining = (dueDate: string) => {
        const diff = Math.floor((new Date(dueDate).getTime() - new Date().getTime()) / 60000);
        if (diff < 0) return `تأخير ${Math.abs(diff)}m`;
        if (diff > 60) return `${Math.floor(diff / 60)}h ${diff % 60}m متبقية`;
        return `${diff}m متبقية`;
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300" aria-live="polite">

            {/* --- 1) Detail Header --- */}
            <header className="p-4 border-b border-border/50 bg-background/50 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-semibold text-foreground leading-snug flex-1">
                        {alert.title}
                    </h2>
                    <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                        {alert.id}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className={cn('text-xs px-2.5 py-0.5 rounded-full font-medium', sevColor)}>
                        {alert.severity}
                    </span>
                    <span className={cn('text-xs px-2.5 py-0.5 rounded-full font-medium', statusInfo.color)}>
                        {statusInfo.label}
                    </span>
                    <Badge variant="outline" className="text-xs px-2 py-0.5 font-medium border-border/60">
                        {alert.type}
                    </Badge>
                    <div className="ms-auto flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/40 px-2 py-1 rounded-md border border-border/30">
                        <Hourglass className="h-3.5 w-3.5 text-primary" />
                        SLA: <span className={alert.triggeredAt && new Date(alert.triggeredAt) < new Date() ? "text-destructive" : "text-foreground"}>
                            {alert.triggeredAt ? timeRemaining(alert.triggeredAt) : 'N/A'}
                        </span>
                    </div>
                </div>
            </header>

            {/* --- Scrollable Sections --- */}
            <main className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-muted">

                {/* 2) Summary Area */}
                <section className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/90">
                        <FileText className="h-4 w-4 text-blue-500" /> ملخص الحالة التفصيلي
                    </h4>
                    <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm space-y-4">
                        <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                            {alert.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div className="space-y-1">
                                <span className="text-muted-foreground block text-[10px] uppercase">المصدر التقني</span>
                                <span className="font-semibold">{alert.modelSource || 'Unknown'}</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground block text-[10px] uppercase">تاريخ الإطلاق</span>
                                <span className="font-semibold">{alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleString('ar-SA') : 'N/A'}</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground block text-[10px] uppercase">القسم الإداري</span>
                                <span className="font-semibold">{alert.department || 'غير محدد'}</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground block text-[10px] uppercase">الموظف المعني</span>
                                <span className="font-semibold truncate block">
                                    {(maskEmployee && alert.employeeId) || (!alert.employeeId) ? 'مشفر لحماية الخصوصية' : alert.employeeId}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3) XAI Explanation */}
                <section className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/90">
                        <AlertTriangle className="h-4 w-4 text-amber-500" /> التفسير الذكي (XAI)
                    </h4>
                    <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/50 dark:border-amber-900/40 rounded-xl p-4 shadow-sm space-y-4">

                        {/* ML Drivers (Partial compatibility) */}
                        {alert.riskScore != null && (
                            <div className="flex items-center gap-4 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                                <div className="text-xs text-muted-foreground font-medium">مؤشر المخاطر الشامل:</div>
                                <div className="flex-1 bg-muted/50 rounded-full h-2 overflow-hidden border border-border/50">
                                    <div
                                        className={cn(
                                            'h-full rounded-full transition-all duration-1000 ease-out',
                                            alert.riskScore >= 0.8 ? 'bg-red-500' :
                                                alert.riskScore >= 0.5 ? 'bg-orange-500' : 'bg-amber-500'
                                        )}
                                        style={{ width: `${alert.riskScore * 100}%` }}
                                    />
                                </div>
                                <span className="text-lg font-bold font-mono text-foreground">{Math.round(alert.riskScore * 100)}%</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Audit Trail & Suggestions (Simplified for Canonical) */}
                <div className="text-xs text-muted-foreground italic p-4 text-center">
                    Additional details like audit trail and suggestions are available in the expanded alert detail view.
                </div>
                <div className="h-4" /> {/* Spacer */}
            </main>

            {/* --- 7) Bottom Action Bar --- */}
            <footer className="p-3 border-t border-border/50 bg-background/80 backdrop-blur z-10 shadow-[0_-4px_15px_-10px_rgba(0,0,0,0.1)]">
                <div className="flex flex-wrap gap-2">
                    {onAcknowledge && alert.status === 'NEW' && (
                        <Button size="sm" variant="default" className="gap-2 text-xs shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onAcknowledge(alert.id)}>
                            <CheckCircle className="h-4 w-4" /> استلام للتنفيذ
                        </Button>
                    )}
                    {onAssign && (
                        <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={() => onAssign(alert.id)}>
                            <UserPlus className="h-4 w-4" /> إسناد لآخر
                        </Button>
                    )}
                    {onConvert && !alert.escalated && (
                        <Button size="sm" variant="secondary" className="gap-2 text-xs" onClick={() => onConvert(alert.id)}>
                            <Briefcase className="h-4 w-4 text-blue-500" /> فتح كحالة
                        </Button>
                    )}
                    {onEscalate && !alert.escalated && (
                        <Button size="sm" variant="outline" className="gap-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200" onClick={() => onEscalate(alert.id)}>
                            <ArrowUpRight className="h-4 w-4" /> تصعيد للإدارة
                        </Button>
                    )}
                    <div className="flex-1" />
                    {onDismiss && alert.status !== 'CLOSED' && alert.status !== 'ARCHIVED' && (
                        <Button size="sm" variant="outline" className="gap-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20" onClick={() => onDismiss(alert.id)}>
                            <XCircle className="h-4 w-4" /> طي التنبيه
                        </Button>
                    )}
                </div>
            </footer>
        </div>
    );
}
