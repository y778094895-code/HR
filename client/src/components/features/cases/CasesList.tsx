import React, { useState, useEffect } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/data-display/DataTable';
import { useCaseStore, HRCase } from '@/stores/business/case.store';
import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/buttons/button';
import { CaseDetailsDrawer } from './CaseDetailsDrawer';
import { LoadingSkeleton } from '@/components/ui/feedback/LoadingSkeleton';

interface CasesListProps {
    viewFilter?: 'all' | 'open' | 'progress' | 'review' | 'closed';
}

export function CasesList({ viewFilter = 'all' }: CasesListProps) {
    const { cases, fetchCases, isLoading } = useCaseStore();
    const [selectedCase, setSelectedCase] = useState<HRCase | null>(null);

    useEffect(() => {
        fetchCases();
    }, [fetchCases]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'destructive';
            case 'high': return 'secondary';
            case 'medium': return 'secondary';
            default: return 'outline';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return 'مفتوحة';
            case 'in_progress': return 'قيد التنفيذ';
            case 'under_review': return 'تحت المراجعة';
            case 'closed': return 'مغلقة';
            default: return status;
        }
    };

    const columns: ColumnDef<HRCase>[] = [
        {
            accessorKey: 'id',
            header: 'رقم الحالة',
            sortable: true,
        },
        {
            accessorKey: 'title',
            header: 'عنوان الحالة',
        },
        {
            accessorKey: 'employeeName',
            header: 'الموظف',
            cell: ({ row }) => row.original.employeeName || '-'
        },
        {
            accessorKey: 'priority',
            header: 'الأهمية',
            cell: ({ row }) => (
                <Badge variant={getPriorityColor(row.original.priority) as any}>
                    {row.original.priority === 'critical' ? 'حرج' : row.original.priority === 'high' ? 'عالي' : row.original.priority === 'medium' ? 'متوسط' : 'منخفض'}
                </Badge>
            )
        },
        {
            accessorKey: 'status',
            header: 'الحالة',
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'open' ? 'default' : row.original.status === 'closed' ? 'outline' : 'secondary'}>
                    {getStatusLabel(row.original.status)}
                </Badge>
            )
        },
        {
            accessorKey: 'createdAt',
            header: 'تاريخ الفتح',
            sortable: true,
            cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('ar-SA')
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <Button variant="ghost" size="sm" onClick={() => setSelectedCase(row.original)}>
                    إدارة الحالة
                </Button>
            )
        }
    ];

    const filterCasesByStatus = () => {
        if (viewFilter === 'all') return cases;
        const statusMap: Record<string, string> = {
            'progress': 'in_progress',
            'review': 'under_review',
        };
        const mappedStatus = statusMap[viewFilter] || viewFilter;
        return cases.filter(c => c.status === mappedStatus);
    };

    if (isLoading) {
        return <div className="p-4"><LoadingSkeleton rows={5} height="3rem" /></div>;
    }

    return (
        <div className="space-y-4">
            <DataTable data={filterCasesByStatus()} columns={columns} onRowClick={setSelectedCase} />

            {selectedCase && (
                <CaseDetailsDrawer
                    hrCase={selectedCase}
                    isOpen={!!selectedCase}
                    onClose={() => setSelectedCase(null)}
                />
            )}
        </div>
    );
}
