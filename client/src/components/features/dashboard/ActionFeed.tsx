import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/buttons/button';
import { cn } from '@/lib/utils';
import { Eye, Briefcase, X } from 'lucide-react';
import { useCaseStore } from '@/stores/business/case.store';
import type { ActionFeedItem } from '@/types/dashboard.types';

const DISMISSED_KEY = 'dashboard_dismissed_feed';

function getDismissedIds(): string[] {
    try {
        const stored = localStorage.getItem(DISMISSED_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function persistDismissedIds(ids: string[]) {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
}

// ---- Time ago formatter ----
function timeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
}

// ---- Feed type border colors ----
const feedTypeColors: Record<string, string> = {
    alert: 'border-s-red-500',
    threshold: 'border-s-amber-500',
    recommendation: 'border-s-blue-500',
    performance_drop: 'border-s-orange-500',
};

// ---- Skeleton ----
function ActionFeedSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="dash-skeleton h-[72px]" />
            ))}
        </div>
    );
}

// ---- Props ----
interface ActionFeedProps {
    items: ActionFeedItem[];
    loading?: boolean;
    error?: string | null;
}

export default function ActionFeed({ items, loading, error }: ActionFeedProps) {
    const navigate = useNavigate();
    const addCase = useCaseStore((s) => s.addCase);
    const [dismissedIds, setDismissedIds] = useState<string[]>(getDismissedIds);

    const handleDismiss = useCallback((id: string) => {
        setDismissedIds(prev => {
            const next = [...prev, id];
            persistDismissedIds(next);
            return next;
        });
    }, []);

    const handleOpenCase = useCallback((item: ActionFeedItem) => {
        addCase({
            title: item.message,
            description: item.detail || item.message,
            priority: item.type === 'alert' ? 'high' : 'medium',
            employeeId: item.employeeId,
            employeeName: item.employeeName,
            ownerName: 'المستخدم الحالي',
        });
        navigate('/dashboard/cases');
    }, [addCase, navigate]);

    if (loading) return <ActionFeedSkeleton />;
    if (error) return (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
    );

    const visibleItems = items.filter(item => !dismissedIds.includes(item.id));

    return (
        <section aria-label="Action Feed">
            <div className="flex items-baseline justify-between mb-4">
                <div>
                    <h2 className="dash-section-title">سجل التنبيهات والإجراءات</h2>
                    <p className="dash-section-subtitle">{visibleItems.length} عنصر نشط</p>
                </div>
            </div>

            {visibleItems.length === 0 ? (
                <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground text-sm">
                    لا توجد تنبيهات جديدة
                </div>
            ) : (
                <div className="space-y-2">
                    {visibleItems.map(item => (
                        <div
                            key={item.id}
                            className={cn(
                                'dash-feed-item flex items-start gap-3 border bg-card border-s-4',
                                feedTypeColors[item.type] || 'border-s-border'
                            )}
                        >
                            {/* Icon */}
                            <span className="text-lg mt-0.5 shrink-0" aria-hidden="true">{item.icon}</span>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-snug">{item.message}</p>
                                {item.detail && (
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.detail}</p>
                                )}
                                <span className="text-[11px] text-muted-foreground mt-1 block">{timeAgo(item.timestamp)}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                                {item.availableActions.includes('view') && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        aria-label="عرض"
                                        title="عرض"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                                {item.availableActions.includes('open_case') && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-primary"
                                        aria-label="فتح حالة"
                                        title="فتح حالة"
                                        onClick={() => handleOpenCase(item)}
                                    >
                                        <Briefcase className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                                {item.availableActions.includes('dismiss') && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                        aria-label="تجاهل"
                                        title="تجاهل"
                                        onClick={() => handleDismiss(item.id)}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
