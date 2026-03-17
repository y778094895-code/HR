import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { cn } from '@/lib/utils';
import { AlertTriangle, Scale, TrendingUp, Award } from 'lucide-react';
import type { FairnessData } from '@/types/dashboard.types';

// ---- Individual Indicator Card ----
function IndicatorCard({
    label,
    value,
    unit,
    status,
    icon: Icon,
    description,
}: {
    label: string;
    value: number;
    unit: string;
    status: string;
    icon: React.ElementType;
    description: string;
}) {
    const isBreached = status === 'warning' || status === 'critical';
    return (
        <div
            className={cn('dash-card dash-fairness-indicator border bg-card rounded-2xl p-4 relative')}
            data-breached={isBreached}
        >
            <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                    'p-2 rounded-lg',
                    isBreached ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-primary/10 text-primary'
                )}>
                    <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
                <span className={cn(
                    'text-2xl font-black',
                    isBreached ? 'text-red-600 dark:text-red-400' : 'text-foreground'
                )}>
                    {typeof value === 'number' && value < 1 ? value.toFixed(2) : value}
                </span>
                <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
            {isBreached && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    تجاوز الحد المسموح
                </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-2">{description}</p>
        </div>
    );
}

// ---- Skeleton ----
function FairnessPanelSkeleton() {
    return (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="dash-skeleton h-[160px]" />
            ))}
        </div>
    );
}

// ---- Props ----
interface FairnessMonitoringPanelProps {
    data: FairnessData | null;
    loading?: boolean;
    error?: string | null;
}

export default function FairnessMonitoringPanel({ data, loading, error }: FairnessMonitoringPanelProps) {
    if (loading) return <FairnessPanelSkeleton />;
    if (error) return (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
    );
    if (!data) return null;

    const hasBreach = [
        data.salaryGap.status,
        data.evaluationBias.status,
        data.promotionEquity.status
    ].some(s => s === 'warning' || s === 'critical');

    return (
        <section aria-label="Fairness Monitoring">
            <div className="flex items-baseline justify-between mb-4">
                <div>
                    <h2 className="dash-section-title">مراقبة العدالة والإنصاف</h2>
                    <p className="dash-section-subtitle">مؤشرات العدالة في التعويضات والتقييم والترقيات</p>
                </div>
                {hasBreach && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        تنبيه عدالة نشط
                    </span>
                )}
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <IndicatorCard
                    label="فجوة الرواتب"
                    value={data.salaryGap.value}
                    unit="%"
                    status={data.salaryGap.status}
                    icon={Scale}
                    description="النسبة المئوية لفجوة الرواتب بين الفئات المتشابهة"
                />
                <IndicatorCard
                    label="تحيز التقييم"
                    value={data.evaluationBias.value}
                    unit="معامل"
                    status={data.evaluationBias.status}
                    icon={TrendingUp}
                    description="معامل التحيز في تقييمات الأداء (0 = محايد تماماً)"
                />
                <IndicatorCard
                    label="عدالة الترقيات"
                    value={data.promotionEquity.value}
                    unit="نسبة"
                    status={data.promotionEquity.status}
                    icon={Award}
                    description="نسبة العدالة في توزيع الترقيات بين الأقسام"
                />
                <Card className={cn(
                    'dash-card border bg-card',
                    hasBreach ? 'border-red-500/30' : ''
                )}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">الحالة العامة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            'flex flex-col items-center justify-center py-3',
                            hasBreach ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                        )}>
                            {hasBreach ? (
                                <>
                                    <AlertTriangle className="h-8 w-8 mb-2" />
                                    <span className="text-sm font-bold">يتطلب مراجعة</span>
                                    <span className="text-[11px] text-muted-foreground mt-1">مؤشر واحد أو أكثر تجاوز الحد</span>
                                </>
                            ) : (
                                <>
                                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                                        <span className="text-lg">✓</span>
                                    </div>
                                    <span className="text-sm font-bold">ضمن الحدود</span>
                                    <span className="text-[11px] text-muted-foreground mt-1">جميع المؤشرات سليمة</span>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
