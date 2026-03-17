import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/overlays/sheet';
import { Button } from '@/components/ui/buttons/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, Briefcase, Clock, Lightbulb, X } from 'lucide-react';
import { useCaseStore } from '@/stores/business/case.store';
import type { RiskEmployee } from '@/types/dashboard.types';
import { useTranslation } from 'react-i18next';

// ---- XAI Factor Bar ----
function FactorBar({ factor, impact, description }: { factor: string; impact: number; description: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{factor}</span>
                <span className="text-muted-foreground">{(impact * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-500',
                        impact >= 0.4 ? 'bg-red-500' : impact >= 0.25 ? 'bg-amber-500' : 'bg-blue-500'
                    )}
                    style={{ width: `${impact * 100}%` }}
                />
            </div>
            <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
    );
}

interface RiskDrawerProps {
    employee: RiskEmployee | null;
    open: boolean;
    onClose: () => void;
}

export default function RiskDrawer({ employee, open, onClose }: RiskDrawerProps) {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const addCase = useCaseStore((s) => s.addCase);

    if (!employee) return null;

    const handleOpenCase = () => {
        addCase({
            title: `معالجة خطر الاستقالة - ${employee.name}`,
            description: `تم فتح الحالة بناءً على مؤشر خطر بنسبة ${employee.riskScore}%. السبب الرئيسي: ${employee.primaryDriver}`,
            priority: employee.riskScore >= 70 ? 'critical' : employee.riskScore >= 50 ? 'high' : 'medium',
            employeeId: employee.employeeId || employee.id,
            employeeName: employee.name,
            ownerName: 'المستخدم الحالي',
        });
        onClose();
        navigate('/dashboard/cases');
    };

    const riskColor = employee.riskScore >= 70
        ? 'text-red-600 dark:text-red-400'
        : employee.riskScore >= 50
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-emerald-600 dark:text-emerald-400';

    const riskBgColor = employee.riskScore >= 70
        ? 'bg-red-500/10 border-red-500/30'
        : employee.riskScore >= 50
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-emerald-500/10 border-emerald-500/30';

    return (
        <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <SheetContent
                side={i18n.dir() === 'rtl' ? 'left' : 'right'}
                className="w-[420px] sm:max-w-[420px] overflow-y-auto p-0"
            >
                <SheetHeader className="p-6 pb-4 border-b">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-lg font-bold">{employee.name}</SheetTitle>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0" aria-label="إغلاق">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{employee.department} • {employee.id}</p>
                </SheetHeader>

                <div className="p-6 space-y-6">
                    {/* Risk Score */}
                    <div className={cn('rounded-xl border p-4 text-center', riskBgColor)}>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <AlertTriangle className={cn('h-5 w-5', riskColor)} />
                            <span className="text-sm font-semibold text-muted-foreground">مؤشر الخطر</span>
                        </div>
                        <span className={cn('text-4xl font-black', riskColor)}>
                            {employee.riskScore}%
                        </span>
                    </div>

                    {/* XAI Contributing Factors */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            العوامل المساهمة (XAI)
                        </h3>
                        <div className="space-y-3">
                            {(employee.contributingFactors || []).map((driver, i) => (
                                <FactorBar key={i} {...driver} />
                            ))}
                        </div>
                    </div>

                    {/* Suggested Intervention */}
                    <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold">التدخل المقترح</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{employee.suggestedIntervention}</p>
                    </div>

                    {/* Open Case Button */}
                    <Button
                        className="w-full h-11 text-sm font-semibold gap-2"
                        onClick={handleOpenCase}
                    >
                        <Briefcase className="h-4 w-4" />
                        فتح حالة جديدة
                    </Button>

                    {/* Timeline */}
                    {employee.timeline.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                الخط الزمني
                            </h3>
                            <div className="relative space-y-0 border-s-2 border-border/60 ms-2">
                                {employee.timeline.map((event, i) => (
                                    <div key={i} className="ps-4 pb-4 relative">
                                        <div className="absolute -start-[7px] top-1 w-3 h-3 rounded-full bg-primary/20 border-2 border-primary" />
                                        <p className="text-sm">{event.description}</p>
                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                            <span>{new Date(event.date).toLocaleDateString('ar-SA')}</span>
                                            <span>•</span>
                                            <span>{event.source}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
