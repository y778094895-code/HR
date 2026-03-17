import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Download, CheckCheck, Briefcase } from 'lucide-react';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/forms/select';
import type { AlertFilters as AlertFiltersType } from '@/types/alerts';

interface AlertFiltersProps {
    filters: AlertFiltersType;
    onFiltersChange: (filters: Partial<AlertFiltersType>) => void;
    selectedCount: number;
    totalCount: number;
    unreadCount: number;
    onMarkAllRead: () => void;
    onBulkAcknowledge: () => void;
    onBulkConvert: () => void;
    onExportCSV: () => void;
    canConvert: boolean;
}

const SEVERITIES = [
    { value: 'ALL', label: 'الكل' },
    { value: 'CRITICAL', label: 'حرج' },
    { value: 'HIGH', label: 'عالي' },
    { value: 'MEDIUM', label: 'متوسط' },
    { value: 'LOW', label: 'منخفض' },
];

const STATUSES = [
    { value: 'ALL', label: 'الكل' },
    { value: 'NEW', label: 'جديد' },
    { value: 'ACKNOWLEDGED', label: 'قيد المعالجة' },
    { value: 'ACTIONED', label: 'تم الإجراء' },
    { value: 'CLOSED', label: 'مغلق' },
];

export function AlertFilters({
    filters,
    onFiltersChange,
    selectedCount,
    unreadCount,
    onMarkAllRead,
    onBulkAcknowledge,
    onBulkConvert,
    onExportCSV,
    canConvert,
}: AlertFiltersProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-4 py-4 px-4 sm:px-6 lg:px-8 border-b border-border/50 bg-background/50">
            {/* Top row: Search and primary selects */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full flex-shrink-0 sm:max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('alerts.searchPlaceholder', 'بحث بالرقم، العنوان، أو الموظف...')}
                        value={filters.search || ''}
                        onChange={(e) => onFiltersChange({ search: e.target.value })}
                        className="pr-10 h-10 w-full bg-card"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
                    <Select
                        value={filters.sortBy || 'newest'}
                        onValueChange={(val) => onFiltersChange({ sortBy: val as any })}
                    >
                        <SelectTrigger className="w-full sm:w-[160px] h-10 bg-card">
                            <span className="flex items-center truncate">
                                <Filter className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2 text-muted-foreground flex-shrink-0" />
                                <SelectValue placeholder={t('alerts.sortBy', 'ترتيب حسب')} />
                            </span>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">{t('alerts.sortNewest', 'الأحدث أولاً')}</SelectItem>
                            <SelectItem value="highestRisk">{t('alerts.sortHighestRisk', 'الأعلى خطورة')}</SelectItem>
                            <SelectItem value="department">{t('alerts.sortDepartment', 'القسم')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 flex-shrink-0 bg-card"
                        onClick={onExportCSV}
                        title={t('alerts.exportCSV', 'تصدير CSV')}
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Bottom row: Filter chips and bulk actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Severity Filter */}
                    <div className="flex items-center rounded-md border p-1 bg-muted/20">
                        {SEVERITIES.map((sev) => (
                            <button
                                key={sev.value}
                                onClick={() => onFiltersChange({ severity: sev.value as any })}
                                className={cn(
                                    'px-3 py-1.5 text-xs font-medium rounded transition-colors',
                                    filters.severity === sev.value || (!filters.severity && sev.value === 'ALL')
                                        ? 'bg-background shadow-sm text-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                )}
                            >
                                {sev.label}
                            </button>
                        ))}
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center rounded-md border p-1 bg-muted/20">
                        {STATUSES.map((st) => (
                            <button
                                key={st.value}
                                onClick={() => onFiltersChange({ status: st.value as any })}
                                className={cn(
                                    'px-3 py-1.5 text-xs font-medium rounded transition-colors',
                                    filters.status === st.value || (!filters.status && st.value === 'ALL')
                                        ? 'bg-background shadow-sm text-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                )}
                            >
                                {st.label}
                            </button>
                        ))}
                    </div>

                    {/* Only Unread Toggle */}
                    <button
                        onClick={() => onFiltersChange({ onlyUnread: !filters.onlyUnread })}
                        className={cn(
                            'px-3 py-2 text-xs font-medium rounded-md border transition-colors flex items-center gap-2',
                            filters.onlyUnread
                                ? 'bg-primary/10 border-primary/30 text-primary'
                                : 'bg-transparent text-muted-foreground hover:bg-muted'
                        )}
                    >
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            filters.onlyUnread ? "bg-primary" : "bg-muted-foreground/30"
                        )} />
                        {t('alerts.onlyUnread', 'غير مقروء فقط')}
                        {unreadCount > 0 && !filters.onlyUnread && (
                            <span className="ms-1 px-1.5 py-0.5 rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Bulk Actions Area */}
                <div className="flex items-center gap-2 min-h-[36px]">
                    {selectedCount > 0 ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                            <span className="text-sm font-medium text-muted-foreground mr-2">
                                {selectedCount} محدد
                            </span>
                            <Button size="sm" onClick={onBulkAcknowledge} className="h-8">
                                <CheckCheck className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                                استلام
                            </Button>
                            {canConvert && (
                                <Button size="sm" variant="secondary" onClick={onBulkConvert} className="h-8 shadow-sm border border-border">
                                    <Briefcase className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                                    تحويل لحالات
                                </Button>
                            )}
                        </div>
                    ) : (
                        unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onMarkAllRead}
                                className="h-8 text-muted-foreground hover:text-foreground"
                            >
                                <CheckCheck className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                                تحديد الكل كمقروء ({unreadCount})
                            </Button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
