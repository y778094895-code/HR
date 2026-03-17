import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/forms/select';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

// --- Types ---
export type FilterType = 'search' | 'select' | 'date-range' | 'number';

export interface FilterOption {
    label: string;
    value: string | number;
}

export interface FilterConfig {
    key: string;
    type: FilterType;
    label?: string; // Placeholder or Label
    placeholder?: string;
    options?: FilterOption[]; // For 'select'
    defaultValue?: any;
}

interface FiltersBarProps {
    filters?: FilterConfig[]; // made optional to support using only convenience props
    onFilterChange: (values: Record<string, any>) => void;
    onReset?: () => void;
    className?: string;
    /**
     * If true, debounces the search input
     */
    debounceMs?: number;
    // Convenience Props
    showSearch?: boolean;
    showDepartment?: boolean;
    showPeriod?: boolean;
    showStatus?: boolean;
}

export function FiltersBar({
    filters = [],
    onFilterChange,
    onReset,
    className,
    debounceMs = 500,
    showSearch,
    showDepartment,
    showPeriod,
    showStatus,
}: FiltersBarProps) {
    const { t } = useTranslation();
    const [, setSearchParams] = useSearchParams();

    // Combine explicit filters with convenience ones
    const activeFilters = [...filters];
    if (showSearch) activeFilters.unshift({ key: 'search', type: 'search', label: t('common.searchPlaceholder') });
    if (showDepartment) activeFilters.push({
        key: 'department',
        type: 'select',
        label: t('common.department'),
        options: [
            { label: t('common.engineering'), value: 'Engineering' },
            { label: t('common.sales'), value: 'Sales' },
            { label: t('common.marketing'), value: 'Marketing' },
            { label: t('common.hr'), value: 'HR' },
            { label: t('common.product'), value: 'Product' }
        ]
    });
    if (showStatus) activeFilters.push({
        key: 'status',
        type: 'select',
        label: t('common.status'),
        options: [
            { label: t('common.active'), value: 'active' },
            { label: t('common.inactive'), value: 'inactive' },
            { label: t('common.pending'), value: 'pending' }
        ]
    });
    if (showPeriod) activeFilters.push({ key: 'period', type: 'date-range', label: t('common.period') });

    // Store current filter values
    const [values, setValues] = useState<Record<string, any>>(() => {
        const initials: Record<string, any> = {};
        activeFilters.forEach((f) => {
            if (f.defaultValue !== undefined) initials[f.key] = f.defaultValue;
        });
        return initials;
    });

    // Handle immediate changes (Select, Date)
    const handleChange = (key: string, value: any) => {
        const newValues = { ...values, [key]: value };
        setValues(newValues);

        // For non-text inputs, trigger immediately
        const config = activeFilters.find(f => f.key === key);
        if (config?.type !== 'search') {
            onFilterChange(newValues);
        }
    };

    // Handle Debounced Text Inputs
    useEffect(() => {
        const handler = setTimeout(() => {
            // Check if there are any search fields
            const hasSearch = activeFilters.some(f => f.type === 'search');
            if (hasSearch) {
                onFilterChange(values);
            }
        }, debounceMs);

        return () => clearTimeout(handler);
    }, [values, debounceMs]); // Dependency on 'values' catches text changes

    const handleReset = () => {
        const resetValues: Record<string, any> = {};
        activeFilters.forEach((f) => {
            if (f.defaultValue !== undefined) resetValues[f.key] = f.defaultValue;
            else resetValues[f.key] = '';
        });
        setValues(resetValues);
        onFilterChange(resetValues);
        setSearchParams(new URLSearchParams(), { replace: true });
        if (onReset) onReset();
    };

    return (
        <div className={cn("flex flex-wrap items-center gap-3 p-2 bg-background/50 rounded-lg border", className)}>
            {activeFilters.map((filter) => {
                switch (filter.type) {
                    case 'search':
                        return (
                            <div key={filter.key} className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground rtl:right-2.5 rtl:left-auto" />
                                <Input
                                    placeholder={filter.placeholder || filter.label || t('common.searchPlaceholder')}
                                    value={values[filter.key] || ''}
                                    onChange={(e) => handleChange(filter.key, e.target.value)}
                                    className="pl-8 rtl:pr-8 rtl:pl-3"
                                />
                            </div>
                        );

                    case 'select':
                        return (
                            <Select
                                key={filter.key}
                                value={values[filter.key] ? String(values[filter.key]) : undefined}
                                onValueChange={(val) => handleChange(filter.key, val)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder={filter.label || filter.placeholder || t('common.select')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filter.options?.map((opt) => (
                                        <SelectItem key={opt.value} value={String(opt.value)}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        );

                    // TODO: Implement actual DateRangePicker if available, using placeholder for now
                    case 'date-range':
                        return (
                            <div key={filter.key} className="flex items-center border rounded-md px-3 py-2 text-sm text-muted-foreground w-[200px]">
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>{filter.label || t('common.period')}</span>
                            </div>
                        );

                    default:
                        return null;
                }
            })}

            <div className="ml-auto flex items-center">
                <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t('common.reset')}
                </Button>
            </div>
        </div>
    );
}
