import React, { useState } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/data-display/DataTable';
import { FiltersBar } from '@/components/ui/data-display/FiltersBar';
import { SideDrawer } from '@/components/ui/overlays/SideDrawer';
import { Button } from '@/components/ui/buttons/button';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, FileText, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '@/stores/business/case.store';


import { performanceService } from '@/services/resources/performance.service';

// Defined Type
interface EmployeePerformance {
    id: string;
    name: string;
    department: string;
    role: string;
    score: number;
    rating: 'Outstanding' | 'Exceeds' | 'Meets' | 'Below';
    lastReview: string;
    status: 'Active' | 'On Leave' | 'PIP';
}

export function EmployeePerformanceList() {
    const { hasRole } = useAuth();
    const canManagePIP = hasRole(['admin', 'manager', 'hr']);
    const navigate = useNavigate();
    const { addCase } = useCaseStore();

    // State
    const [employees, setEmployees] = useState<EmployeePerformance[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeePerformance | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [filters, setFilters] = useState<Record<string, any>>({});

    React.useEffect(() => {
        performanceService.getEmployeesPerformance().then(res => {
            const items = res.data || [];
            setEmployees(items.map(item => ({
                id: item.id,
                name: item.fullName || 'Unknown',
                role: item.designation || 'Employee',
                department: item.department || 'Unknown',
                score: item.performanceScore ? parseFloat(Number(item.performanceScore).toFixed(1)) : 0,
                rating: (item.performanceScore || 0) >= 4.5 ? 'Outstanding' : (item.performanceScore || 0) >= 3.5 ? 'Exceeds' : (item.performanceScore || 0) >= 2.5 ? 'Meets' : 'Below',
                lastReview: new Date().toISOString().split('T')[0],
                status: (item.employmentStatus === 'active' ? 'Active' : item.employmentStatus === 'inactive' ? 'On Leave' : 'Active') as any
            })));
        }).catch(err => console.error('Failed to fetch employee performance list:', err));
    }, []);

    const filteredEmployees = React.useMemo(() => {
        let result = [...employees];
        if (filters.search) {
            const lowerSearch = filters.search.toLowerCase();
            result = result.filter(e => e.name.toLowerCase().includes(lowerSearch) || e.role.toLowerCase().includes(lowerSearch));
        }
        if (filters.department && Array.isArray(filters.department) ? filters.department.length > 0 : filters.department) {
            result = result.filter(e => e.department === filters.department || filters.department === 'all');
        }
        return result;
    }, [filters]);

    // Columns
    const columns: ColumnDef<EmployeePerformance>[] = [
        {
            accessorKey: 'name',
            header: 'Employee',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.name}</div>
                    <div className="text-xs text-muted-foreground">{row.original.role}</div>
                </div>
            )
        },
        { accessorKey: 'department', header: 'Department' },
        {
            accessorKey: 'score',
            header: 'Score',
            cell: ({ row }) => {
                const score = row.original.score;
                let colorClass = "text-yellow-600";
                if (score >= 4.5) colorClass = "text-green-600 font-bold";
                else if (score < 3) colorClass = "text-red-600 font-bold";
                return <span className={colorClass}>{score} / 5.0</span>
            }
        },
        {
            accessorKey: 'rating',
            header: 'Rating',
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${row.original.rating === 'Outstanding' ? 'bg-green-100 text-green-700' :
                        row.original.rating === 'Below' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                    {row.original.rating}
                </span>
            )
        },
        { accessorKey: 'lastReview', header: 'Last Review' },
        { accessorKey: 'status', header: 'Status' }
    ];

    const handleRowClick = (employee: EmployeePerformance) => {
        setSelectedEmployee(employee);
        setIsDrawerOpen(true);
    };

    const handleAction = (action: string) => {
        if (!selectedEmployee) return;

        const isPip = action === 'PIP';

        addCase({
            title: isPip ? `خطة تحسين أداء (PIP) - ${selectedEmployee.name}` : `مراجعة أداء - ${selectedEmployee.name}`,
            description: isPip
                ? `تم تصنيف الموظف كضعيف الأداء بدرجة ${selectedEmployee.score} ويحتاج لخطة تحسين PIP.`
                : `مراجعة دورية للأداء، التقييم الحالي: ${selectedEmployee.rating}`,
            priority: isPip ? 'high' : 'medium',
            employeeId: selectedEmployee.id,
            employeeName: selectedEmployee.name,
        });

        setIsDrawerOpen(false);
        navigate('/dashboard/cases');
    };

    return (
        <div className="space-y-4">
            <FiltersBar
                showSearch
                showDepartment
                onFilterChange={setFilters}
            />

            <DataTable
                data={filteredEmployees}
                columns={columns}
                onRowClick={handleRowClick}
            />

            <SideDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                title={selectedEmployee?.name || 'Employee Details'}
                description={`${selectedEmployee?.role} - ${selectedEmployee?.department}`}
                footer={
                    <div className="flex gap-2 w-full">
                        {/* Always show Start Review */}
                        <Button
                            className="w-full"
                            onClick={() => handleAction('Review')}
                        >
                            <FileText className="mr-2 h-4 ml-2 w-4" />
                            فتح حالة مراجعة

                        </Button>

                        {/* Only Admin/Manager can Initiate PIP */}
                        {canManagePIP && selectedEmployee?.score && selectedEmployee.score < 3 && (
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => handleAction('PIP')}
                            >
                                <Briefcase className="mr-2 ml-2 h-4 w-4" />
                                فتح حالة PIP

                            </Button>
                        )}
                    </div>
                }
            >
                {selectedEmployee && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <span className="text-xs text-muted-foreground block">Current Score</span>
                                <span className="text-2xl font-bold">{selectedEmployee.score}</span>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <span className="text-xs text-muted-foreground block">Status</span>
                                <span className="text-2xl font-bold">{selectedEmployee.status}</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">History</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm p-2 border rounded">
                                    <span>Q4 2023 Review</span>
                                    <span className="font-medium text-green-600">4.5</span>
                                </div>
                                <div className="flex justify-between items-center text-sm p-2 border rounded">
                                    <span>Q3 2023 Review</span>
                                    <span className="font-medium">4.1</span>
                                </div>
                            </div>
                        </div>

                        {selectedEmployee.score < 3 && (
                            <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm flex items-start">
                                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold">Performance Alert</p>
                                    <p>Score is below threshold (3.0). Recommended to initiate Performance Improvement Plan (PIP).</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </SideDrawer>
        </div>
    );
}
