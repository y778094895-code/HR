import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/data-display/table';
import { Button } from '@/components/ui/buttons/button';
import { EmptyState } from '@/components/ui/feedback/EmptyState';
import { LoadingSkeleton } from '@/components/ui/feedback/LoadingSkeleton';
import { ErrorState } from '@/components/ui/feedback/ErrorState';
import { ChevronDown, ChevronUp, ChevronsUpDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export interface ColumnDef<T> {
    id?: string; // Optional ID for the column (e.g. actions)
    accessorKey?: keyof T | string; // Key to access data
    header: string | React.ReactNode; // Header label or component
    cell?: (props: { row: { original: T } }) => React.ReactNode; // Cell renderer matching react-table pattern
    sortable?: boolean;
}

export interface PaginationState {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
}

export interface SortingState {
    column: string | null;
    direction: 'asc' | 'desc' | null;
    onSort: (column: string) => void;
}

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    isLoading?: boolean;
    error?: string;
    onRetry?: () => void;
    onRowClick?: (item: T) => void;
    pagination?: PaginationState;
    sorting?: SortingState;
    emptyMessage?: string;
    className?: string;
}

export function DataTable<T extends { id?: string | number }>({
    data,
    columns,
    isLoading = false,
    error,
    onRetry,
    onRowClick,
    pagination,
    sorting,
    emptyMessage,
    className,
}: DataTableProps<T>) {
    const { t } = useTranslation();
    const finalEmptyMessage = emptyMessage || t('common.noData');

    // Internal sorting helper icon
    const getSortIcon = (columnKey: string) => {
        if (!sorting || sorting.column !== columnKey) return <ChevronsUpDown className="ml-2 h-4 w-4" />;
        if (sorting.direction === 'asc') return <ChevronUp className="ml-2 h-4 w-4" />;
        return <ChevronDown className="ml-2 h-4 w-4" />;
    };

    if (error) {
        return (
            <div className={cn("space-y-4", className)}>
                <ErrorState message={error} onRetry={onRetry} />
            </div>
        );
    }

    return (
        <div className={cn("space-y-4 animate-in fade-in duration-300", className)}>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col, index) => {
                                const key = col.id || String(col.accessorKey) || index;
                                return (
                                    <TableHead
                                        key={key}
                                        className={cn("text-start rtl:text-right", col.sortable ? "cursor-pointer select-none" : "")}
                                        onClick={() => col.sortable && col.accessorKey && sorting?.onSort(String(col.accessorKey))}
                                    >
                                        <div className="flex items-center">
                                            {col.header}
                                            {col.sortable && col.accessorKey && getSortIcon(String(col.accessorKey))}
                                        </div>
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 p-4">
                                    <LoadingSkeleton rows={5} height="3rem" />
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 p-0">
                                    <EmptyState description={finalEmptyMessage} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item, rowIndex) => (
                                <TableRow
                                    key={item.id || rowIndex}
                                    className={cn(
                                        "transition-colors hover:bg-muted/50",
                                        onRowClick ? "cursor-pointer" : ""
                                    )}
                                    onClick={() => onRowClick && onRowClick(item)}
                                >
                                    {columns.map((col, colIndex) => {
                                        const key = col.id || String(col.accessorKey) || colIndex;
                                        return (
                                            <TableCell key={key} className="text-start rtl:text-right">
                                                {col.cell
                                                    ? col.cell({ row: { original: item } })
                                                    : (col.accessorKey ? String((item as any)[col.accessorKey]) : null)}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {pagination && !isLoading && data.length > 0 && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-muted-foreground mr-auto rtl:mr-0 rtl:ml-auto">
                        Page {pagination.currentPage} of {pagination.totalPages || 1}
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                            disabled={!pagination.hasPreviousPage && pagination.currentPage <= 1}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2 rtl:hidden" />
                            <ArrowRight className="h-4 w-4 mr-2 hidden rtl:block" />
                            <span className="rtl:hidden">Previous</span>
                            <span className="hidden rtl:block">السابق</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasNextPage && pagination.currentPage >= pagination.totalPages}
                        >
                            <span className="rtl:hidden">Next</span>
                            <span className="hidden rtl:block">التالي</span>
                            <ArrowRight className="h-4 w-4 ml-2 rtl:hidden" />
                            <ArrowLeft className="h-4 w-4 ml-2 hidden rtl:block" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
