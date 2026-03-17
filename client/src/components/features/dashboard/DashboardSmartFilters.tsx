import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/buttons/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/forms/select';
import { cn } from '@/lib/utils';
import { RotateCcw, Save, Calendar } from 'lucide-react';
import type { DashboardFilters } from '@/types/dashboard.types';
import { DEFAULT_DASHBOARD_FILTERS } from '@/types/dashboard.types';

interface DashboardSmartFiltersProps {
    onFilterChange: (filters: DashboardFilters) => void;
    className?: string;
}

export default function DashboardSmartFilters({ onFilterChange, className }: DashboardSmartFiltersProps) {
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize from URL params or defaults
    const [filters, setFilters] = useState<DashboardFilters>(() => ({
        timePeriod: searchParams.get('period') || DEFAULT_DASHBOARD_FILTERS.timePeriod,
        department: searchParams.get('dept') || DEFAULT_DASHBOARD_FILTERS.department,
        location: searchParams.get('loc') || DEFAULT_DASHBOARD_FILTERS.location,
        contractType: searchParams.get('contract') || DEFAULT_DASHBOARD_FILTERS.contractType,
        jobGrade: searchParams.get('grade') || DEFAULT_DASHBOARD_FILTERS.jobGrade,
    }));

    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    // Debounced filter change
    const debouncedChange = useCallback((newFilters: DashboardFilters) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onFilterChange(newFilters);

            // Sync to URL
            const params = new URLSearchParams();
            if (newFilters.timePeriod !== DEFAULT_DASHBOARD_FILTERS.timePeriod) params.set('period', newFilters.timePeriod);
            if (newFilters.department) params.set('dept', newFilters.department);
            if (newFilters.location) params.set('loc', newFilters.location);
            if (newFilters.contractType) params.set('contract', newFilters.contractType);
            if (newFilters.jobGrade) params.set('grade', newFilters.jobGrade);
            setSearchParams(params, { replace: true });
        }, 300);
    }, [onFilterChange, setSearchParams]);

    const updateFilter = (key: keyof DashboardFilters, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        debouncedChange(newFilters);
    };

    const handleReset = () => {
        setFilters({ ...DEFAULT_DASHBOARD_FILTERS });
        onFilterChange({ ...DEFAULT_DASHBOARD_FILTERS });
        setSearchParams(new URLSearchParams(), { replace: true });
    };

    const handleSaveView = () => {
        const key = 'dashboard_saved_view';
        localStorage.setItem(key, JSON.stringify(filters));
        // Brief visual feedback — could be toast
    };

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return (
        <div className={cn('py-3 px-1 border-b border-border/50 bg-background/50 mb-2', className)}>
            <div className="flex flex-wrap items-center gap-2.5">
                {/* Time Period */}
                <Select value={filters.timePeriod} onValueChange={(v) => updateFilter('timePeriod', v)}>
                    <SelectTrigger className="w-[140px] h-9 text-xs">
                        <Calendar className="h-3.5 w-3.5 me-1.5 text-muted-foreground" />
                        <SelectValue placeholder="الفترة الزمنية" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">أسبوع</SelectItem>
                        <SelectItem value="month">شهر</SelectItem>
                        <SelectItem value="quarter">ربع سنة</SelectItem>
                        <SelectItem value="half_year">نصف سنة</SelectItem>
                        <SelectItem value="year">سنة كاملة</SelectItem>
                        <SelectItem value="custom">نطاق مخصص</SelectItem>
                    </SelectContent>
                </Select>

                {/* Department */}
                <Select value={filters.department || '_all'} onValueChange={(v) => updateFilter('department', v === '_all' ? '' : v)}>
                    <SelectTrigger className="w-[140px] h-9 text-xs">
                        <SelectValue placeholder="القسم" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_all">كل الأقسام</SelectItem>
                        <SelectItem value="engineering">الهندسة</SelectItem>
                        <SelectItem value="sales">المبيعات</SelectItem>
                        <SelectItem value="marketing">التسويق</SelectItem>
                        <SelectItem value="hr">الموارد البشرية</SelectItem>
                        <SelectItem value="product">المنتجات</SelectItem>
                        <SelectItem value="finance">المالية</SelectItem>
                        <SelectItem value="operations">العمليات</SelectItem>
                        <SelectItem value="support">خدمة العملاء</SelectItem>
                    </SelectContent>
                </Select>

                {/* Location */}
                <Select value={filters.location || '_all'} onValueChange={(v) => updateFilter('location', v === '_all' ? '' : v)}>
                    <SelectTrigger className="w-[130px] h-9 text-xs">
                        <SelectValue placeholder="الموقع" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_all">كل المواقع</SelectItem>
                        <SelectItem value="riyadh">الرياض</SelectItem>
                        <SelectItem value="jeddah">جدة</SelectItem>
                        <SelectItem value="dammam">الدمام</SelectItem>
                        <SelectItem value="remote">عن بُعد</SelectItem>
                    </SelectContent>
                </Select>

                {/* Contract Type */}
                <Select value={filters.contractType || '_all'} onValueChange={(v) => updateFilter('contractType', v === '_all' ? '' : v)}>
                    <SelectTrigger className="w-[130px] h-9 text-xs">
                        <SelectValue placeholder="نوع العقد" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_all">كل الأنواع</SelectItem>
                        <SelectItem value="full_time">دوام كامل</SelectItem>
                        <SelectItem value="part_time">دوام جزئي</SelectItem>
                        <SelectItem value="contract">عقد مؤقت</SelectItem>
                    </SelectContent>
                </Select>

                {/* Job Grade */}
                <Select value={filters.jobGrade || '_all'} onValueChange={(v) => updateFilter('jobGrade', v === '_all' ? '' : v)}>
                    <SelectTrigger className="w-[120px] h-9 text-xs">
                        <SelectValue placeholder="الدرجة" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_all">كل الدرجات</SelectItem>
                        <SelectItem value="junior">مبتدئ</SelectItem>
                        <SelectItem value="mid">متوسط</SelectItem>
                        <SelectItem value="senior">أول</SelectItem>
                        <SelectItem value="lead">قيادي</SelectItem>
                        <SelectItem value="executive">تنفيذي</SelectItem>
                    </SelectContent>
                </Select>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Reset */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                    aria-label="إعادة تعيين الفلاتر"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    إعادة تعيين
                </Button>

                {/* Save View */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveView}
                    className="h-9 text-xs gap-1.5"
                    aria-label="حفظ العرض"
                >
                    <Save className="h-3.5 w-3.5" />
                    حفظ العرض
                </Button>
            </div>
        </div>
    );
}
