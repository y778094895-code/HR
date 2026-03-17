import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import type { HRCase } from '@/stores/business/case.store';

// ---- Severity Badge ----
function SeverityBadge({ severity }: { severity: string }) {
    const map: Record<string, string> = {
        critical: 'dash-severity-critical',
        high: 'dash-severity-high',
        medium: 'dash-severity-medium',
        low: 'dash-severity-low',
    };
    const labels: Record<string, string> = {
        critical: 'حرج',
        high: 'مرتفع',
        medium: 'متوسط',
        low: 'منخفض',
    };

    return (
        <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold', map[severity] || map.medium)}>
            {labels[severity] || severity}
        </span>
    );
}

// ---- Status Badge ----
function StatusBadge({ status }: { status: string }) {
    const labels: Record<string, string> = {
        open: 'مفتوحة',
        in_progress: 'قيد المعالجة',
        under_review: 'تحت المراجعة',
        closed: 'مغلقة',
    };
    const colors: Record<string, string> = {
        open: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        in_progress: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        under_review: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        closed: 'bg-muted text-muted-foreground',
    };

    return (
        <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold', colors[status] || colors.open)}>
            {labels[status] || status}
        </span>
    );
}

// ---- Skeleton ----
function CasesTableSkeleton() {
    return (
        <Card className="dash-card border bg-card">
            <CardHeader className="pb-3">
                <div className="h-5 w-40 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// ---- Props ----
interface ActiveCasesTableProps {
    cases: HRCase[];
    loading?: boolean;
    error?: string | null;
}

export default function ActiveCasesTable({ cases, loading, error }: ActiveCasesTableProps) {
    const navigate = useNavigate();

    if (loading) return <CasesTableSkeleton />;
    if (error) return (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
    );

    const activeCases = cases.filter(c => c.status !== 'closed');

    return (
        <section aria-label="Active Cases">
            <div className="flex items-baseline justify-between mb-4">
                <div>
                    <h2 className="dash-section-title">الحالات النشطة</h2>
                    <p className="dash-section-subtitle">{activeCases.length} حالة مفتوحة</p>
                </div>
            </div>

            <Card className="dash-card border bg-card">
                <CardContent className="p-0">
                    {activeCases.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            لا توجد حالات نشطة حالياً
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm" role="table">
                                <thead>
                                    <tr className="border-b text-xs text-muted-foreground bg-muted/30">
                                        <th className="text-start px-4 py-3 font-medium">رقم الحالة</th>
                                        <th className="text-start px-3 py-3 font-medium">العنوان</th>
                                        <th className="text-start px-3 py-3 font-medium">المسؤول</th>
                                        <th className="text-start px-3 py-3 font-medium">الأولوية</th>
                                        <th className="text-start px-3 py-3 font-medium">الحالة</th>
                                        <th className="text-start px-3 py-3 font-medium">التاريخ</th>
                                        <th className="px-3 py-3" aria-label="Actions"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeCases.map((c) => (
                                        <tr
                                            key={c.id}
                                            className="border-b border-border/40 hover:bg-accent/30 transition-colors cursor-pointer"
                                            onClick={() => navigate('/dashboard/cases')}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={`عرض الحالة ${c.id}`}
                                            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/dashboard/cases'); }}
                                        >
                                            <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{c.id}</td>
                                            <td className="px-3 py-3 max-w-[200px] truncate">{c.title}</td>
                                            <td className="px-3 py-3 text-muted-foreground">{c.ownerName || '—'}</td>
                                            <td className="px-3 py-3"><SeverityBadge severity={c.priority} /></td>
                                            <td className="px-3 py-3"><StatusBadge status={c.status} /></td>
                                            <td className="px-3 py-3 text-muted-foreground text-xs">
                                                {new Date(c.createdAt).toLocaleDateString('ar-SA')}
                                            </td>
                                            <td className="px-3 py-3">
                                                <button
                                                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                                                    onClick={(e) => { e.stopPropagation(); navigate('/dashboard/cases'); }}
                                                    aria-label={`فتح الحالة ${c.id}`}
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
