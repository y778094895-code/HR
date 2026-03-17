import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/data-display/badge';
import type { Alert } from '@/types/alerts';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/overlays/dropdown-menu';
import { MoreHorizontal, CheckCircle, ArrowUpRight, Briefcase, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/buttons/button';

interface AlertCardProps {
    alert: Alert;
    isSelected: boolean;
    isChecked: boolean;
    onSelect: () => void;
    onCheckToggle: (checked: boolean) => void;
    onAcknowledge?: () => void;
    onConvert?: () => void;
    onDismiss?: () => void;
    onEscalate?: () => void;
}

const SEVERITY_STYLES = {
    CRITICAL: {
        border: 'border-s-4 border-s-red-500',
        bg: 'bg-red-50/40 dark:bg-red-950/20',
        badge: 'destructive',
    },
    HIGH: {
        border: 'border-s-4 border-s-orange-500',
        bg: 'bg-orange-50/20 dark:bg-orange-950/10',
        badge: 'secondary',
    },
    MEDIUM: {
        border: 'border-s-4 border-s-amber-500',
        bg: 'bg-amber-50/10 dark:bg-amber-950/5',
        badge: 'secondary',
    },
    LOW: {
        border: 'border-s-4 border-s-slate-300 dark:border-s-slate-600',
        bg: 'bg-card',
        badge: 'outline',
    },
};

const STATUS_LABELS: Record<string, string> = {
    NEW: 'جديد',
    ACKNOWLEDGED: 'تم الاستلام',
    ACTIONED: 'تم التعامل',
    CLOSED: 'مغلق',
    ARCHIVED: 'مؤرشف',
};

export function AlertCard({
    alert,
    isSelected,
    isChecked,
    onSelect,
    onCheckToggle,
    onAcknowledge,
    onConvert,
    onDismiss,
    onEscalate,
}: AlertCardProps) {
    const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.LOW;
    const isClosedOrActioned = alert.status === 'CLOSED' || alert.status === 'ACTIONED' || alert.status === 'ARCHIVED';

    const timeAgo = (isoString: string) => {
        const diff = Math.floor((new Date().getTime() - new Date(isoString).getTime()) / 60000);
        if (diff < 60) return `${diff} دقيقة`;
        const hrs = Math.floor(diff / 60);
        if (hrs < 24) return `${hrs} ساعة`;
        return `${Math.floor(hrs / 24)} يوم`;
    };

    return (
        <div
            className={cn(
                'relative flex items-stretch rounded-lg border transition-all duration-200 cursor-pointer group mb-2',
                style.border,
                !alert.readAt && !isSelected && 'opacity-85 hover:opacity-100',
                isClosedOrActioned && 'opacity-60 saturate-50 hover:opacity-100 hover:saturate-100',
                style.bg,
                isSelected
                    ? 'ring-1 ring-primary shadow-sm bg-primary/5 hover:bg-primary/10'
                    : 'hover:border-primary/30 hover:bg-muted/30 hover:-translate-y-px',
            )}
            onClick={onSelect}
            role="button"
            tabIndex={0}
            aria-selected={isSelected}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect();
                }
            }}
        >
            <div className="flex-1 p-3.5 flex flex-col min-w-0">
                {/* Header Row */}
                <div className="flex items-start gap-3">
                    <div className="pt-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => onCheckToggle(e.target.checked)}
                            className="h-4 w-4 rounded border-border/70 text-primary focus:ring-primary cursor-pointer align-middle"
                            aria-label="تحديد التنبيه"
                        />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <h4 className={cn(
                                'text-sm mb-1 leading-snug pe-4 line-clamp-1 flex-1 relative',
                                !alert.readAt ? 'text-foreground font-semibold' : 'text-foreground/80 font-medium'
                            )}>
                                {!alert.readAt && (
                                    <span className="absolute -start-3.5 top-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                                {alert.title}
                            </h4>

                            <div className="flex-shrink-0 flex items-center gap-2 mt-[-2px]">
                                {alert.riskScore != null && (
                                    <Badge variant="outline" className={cn(
                                        "px-1.5 rounded border-opacity-50 font-mono text-[10px]",
                                        alert.riskScore > 80 ? "text-red-600 border-red-200 bg-red-50" :
                                            alert.riskScore > 50 ? "text-orange-600 border-orange-200 bg-orange-50" : "text-amber-600 border-amber-200 bg-amber-50"
                                    )}>
                                        {alert.riskScore}%
                                    </Badge>
                                )}
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                    {timeAgo(alert.triggeredAt)}
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                            {alert.description}
                        </p>

                        {/* Chips Row */}
                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <Badge variant={style.badge as any} className="text-[9px] px-1.5 py-0 h-4.5 font-medium uppercase min-w-[50px] justify-center">
                                    {alert.severity}
                                </Badge>
                                <Badge variant="outline" className={cn(
                                    "text-[9px] px-1.5 py-0 h-4.5 font-medium",
                                    alert.status === 'ACKNOWLEDGED' && "bg-amber-100/50 text-amber-700 border-amber-200",
                                    alert.status === 'ACTIONED' && "bg-emerald-100/50 text-emerald-700 border-emerald-200"
                                )}>
                                    {STATUS_LABELS[alert.status]}
                                </Badge>
                                {alert.escalated && (
                                    <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4.5">مُصعّد</Badge>
                                )}
                                {alert.assignedToName && (
                                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4.5 bg-blue-50 text-blue-700 border border-blue-100">
                                        تسليم: {alert.assignedToName}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex-shrink-0 -me-2" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-muted-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40 z-50">
                                        {onAcknowledge && alert.status === 'NEW' && (
                                            <DropdownMenuItem onClick={onAcknowledge} className="text-xs cursor-pointer gap-2">
                                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> استلام
                                            </DropdownMenuItem>
                                        )}
                                        {onConvert && (
                                            <DropdownMenuItem onClick={onConvert} className="text-xs cursor-pointer gap-2">
                                                <Briefcase className="h-3.5 w-3.5 text-blue-500" /> حالة عمل
                                            </DropdownMenuItem>
                                        )}
                                        {onEscalate && !alert.escalated && (
                                            <DropdownMenuItem onClick={onEscalate} className="text-xs cursor-pointer gap-2">
                                                <ArrowUpRight className="h-3.5 w-3.5 text-orange-500" /> تصعيد
                                            </DropdownMenuItem>
                                        )}
                                        {onDismiss && alert.status !== 'CLOSED' && (
                                            <DropdownMenuItem onClick={onDismiss} className="text-xs cursor-pointer gap-2 text-destructive focus:text-destructive">
                                                <XCircle className="h-3.5 w-3.5" /> استبعاد
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
