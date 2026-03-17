import React, { useState } from 'react';
import { FiltersBar } from '@/components/ui/data-display/FiltersBar';
import { Button } from '@/components/ui/buttons/button';
import { CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/ui/data-display/DataTable';
import { SideDrawer } from '@/components/ui/overlays/SideDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { trainingService } from '@/services/resources/training.service';

interface TrainingProgram {
    id: string;
    courseName: string;
    provider: string;
    duration: string;
    enrolled: number;
    status: 'Active' | 'Pending Approval' | 'Completed';
    requester?: string;
}

export function TrainingProgramList() {
    const { hasRole } = useAuth();
    const canApprove = hasRole('admin') || hasRole('manager');

    const [programs, setPrograms] = useState<TrainingProgram[]>([]);
    const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [filters, setFilters] = useState<Record<string, any>>({});

    React.useEffect(() => {
        trainingService.getTrainingEffectiveness()
            .then(res => {
                const mapped = (res || []).map((p: any) => ({
                    id: p.programId,
                    courseName: p.programTitle || 'Unknown Course',
                    provider: 'Internal',
                    duration: 'Varies',
                    enrolled: Math.round((p.completionRate || 0) * 100) || 0, // Using completionRate as enrollment proxy for UI mapping
                    status: 'Active' as const
                }));
                // If DB had no training effectiveness metrics, offer a graceful UI instead of crashing
                setPrograms(mapped);
            })
            .catch(err => console.error('Failed to fetch training programs:', err));
    }, []);

    const filteredPrograms = React.useMemo(() => {
        let result = [...programs];
        if (filters.search) {
            const s = filters.search.toLowerCase();
            result = result.filter(p => p.courseName.toLowerCase().includes(s) || p.provider.toLowerCase().includes(s));
        }
        return result;
    }, [filters, programs]);

    const handleApprove = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        console.log(`Approved program ${id}`);
    };

    const handleReject = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        console.log(`Rejected program ${id}`);
    };

    const columns: ColumnDef<TrainingProgram>[] = [
        {
            accessorKey: 'courseName',
            header: 'Course',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium flex items-center gap-2">
                        <BookOpen className="h-3 w-3 text-indigo-500" />
                        {row.original.courseName}
                    </div>
                    {row.original.requester && <div className="text-xs text-muted-foreground">Requested by: {row.original.requester}</div>}
                </div>
            )
        },
        { accessorKey: 'provider', header: 'Provider' },
        { accessorKey: 'duration', header: 'Duration' },
        { accessorKey: 'enrolled', header: 'Enrolled' },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${row.original.status === 'Active' ? 'bg-green-100 text-green-700' :
                        row.original.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                    {row.original.status}
                </span>
            )
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                if (row.original.status === 'Pending Approval' && canApprove) {
                    return (
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-green-600" onClick={(e) => handleApprove(row.original.id, e)}>
                                <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-600" onClick={(e) => handleReject(row.original.id, e)}>
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                }
                return null;
            }
        }
    ];

    return (
        <div className="space-y-4">
            <FiltersBar showSearch onFilterChange={setFilters} />

            <DataTable
                data={filteredPrograms}
                columns={columns}
                onRowClick={(row) => { setSelectedProgram(row); setIsDrawerOpen(true); }}
            />

            <SideDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                title={selectedProgram?.courseName || 'Course Details'}
                description={`Provider: ${selectedProgram?.provider}`}
            >
                {selectedProgram && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-muted rounded">
                                <span className="text-xs block text-muted-foreground">Duration</span>
                                <span className="font-medium">{selectedProgram.duration}</span>
                            </div>
                            <div className="p-3 bg-muted rounded">
                                <span className="text-xs block text-muted-foreground">Enrollments</span>
                                <span className="font-medium">{selectedProgram.enrolled}</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground">
                                Detailed course curriculum and objectives would appear here.
                            </p>
                        </div>

                        {selectedProgram.status === 'Pending Approval' && canApprove && (
                            <div className="pt-4 border-t flex gap-3">
                                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={(e) => handleApprove(selectedProgram.id, e as any)}>
                                    Approve Request
                                </Button>
                                <Button className="w-full" variant="destructive" onClick={(e) => handleReject(selectedProgram.id, e as any)}>
                                    Reject
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </SideDrawer>
        </div>
    );
}
