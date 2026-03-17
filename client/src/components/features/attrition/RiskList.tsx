import React, { useState } from 'react';
import { FiltersBar } from '@/components/ui/data-display/FiltersBar';
import { Button } from '@/components/ui/buttons/button';
import { RiskDetailDrawer } from './RiskDetailDrawer';
import { BrainCircuit, Activity } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/ui/data-display/DataTable';

import { turnoverService } from '@/services/resources/turnover.service';

// Defined Type
interface RiskProfile {
    id: string;
    employeeName?: string;
    name: string;
    department: string;
    role: string;
    riskScore: number;
    mainFactor?: string;
    lastEvaluation?: string;
}

export function RiskList() {
    const [risks, setRisks] = useState<RiskProfile[]>([]);
    const [selectedRisk, setSelectedRisk] = useState<RiskProfile | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [filters, setFilters] = useState<Record<string, any>>({});

    React.useEffect(() => {
        turnoverService.getRiskList().then(res => {
            const items = res.data || [];
            // Map the API response format back roughly to the UI's expected RiskProfile interface
            setRisks(items.map(item => ({
                id: item.employeeId,
                name: item.employeeId, // TurnoverRisk currently lacks employeeName in the core type
                role: 'Employee',
                department: 'Unknown',
                riskScore: Math.round((item.riskScore || 0) * 100),
                mainFactor: item.contributingFactors?.length > 0 ? item.contributingFactors[0].factor : 'Various Data',
                lastEvaluation: item.predictionDate ? new Date(item.predictionDate).toISOString().split('T')[0] : 'Recent'
            })));
        }).catch(err => console.error('Failed to fetch risk list:', err));
    }, []);

    const filteredRisks = React.useMemo(() => {
        let result = [...risks];
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(r => r.name.toLowerCase().includes(searchLower) || r.role.toLowerCase().includes(searchLower));
        }
        if (filters.department && filters.department !== 'all') {
            result = result.filter(r => r.department === filters.department);
        }
        return result;
    }, [filters]);

    const columns: ColumnDef<RiskProfile>[] = [
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
            accessorKey: 'riskScore',
            header: 'Risk Probability',
            cell: ({ row }) => {
                const score = row.original.riskScore;
                const colorClass = score > 80 ? 'text-red-600 bg-red-50' : 'text-orange-600 bg-orange-50';
                return (
                    <span className={`px-2 py-1 rounded font-bold text-xs ${colorClass}`}>
                        {score}%
                    </span>
                );
            }
        },
        {
            accessorKey: 'mainFactor',
            header: 'Primary Driver',
            cell: ({ row }) => (
                <div className="flex items-center gap-1 text-sm">
                    <BrainCircuit className="h-3 w-3 text-indigo-500" />
                    {row.original.mainFactor}
                </div>
            )
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(row.original);
                    }}
                >
                    Analyze
                </Button>
            )
        }
    ];

    const handleViewDetails = (risk: RiskProfile) => {
        setSelectedRisk(risk);
        setIsDrawerOpen(true);
    };

    const handleIntervention = (id: string) => {
        console.log(`Log intervention for ${id}`);
        // Integration with intervention service would go here
        setIsDrawerOpen(false);
    };

    return (
        <div className="space-y-4">
            <FiltersBar
                showSearch
                showDepartment
                onFilterChange={setFilters}
            />

            <div className="rounded-md border bg-yellow-50/50 p-4 text-sm text-yellow-800 flex items-start gap-3">
                <Activity className="h-5 w-5 shrink-0" />
                <div>
                    <p className="font-semibold">AI Prediction Engine Active</p>
                    <p>Risk scores are updated daily based on 15+ behavioral and demographic factors. Scores above 70% require immediate attention.</p>
                </div>
            </div>

            <DataTable
                data={filteredRisks}
                columns={columns}
                onRowClick={handleViewDetails}
            />

            <RiskDetailDrawer
                isOpen={isDrawerOpen}
                onClose={setIsDrawerOpen}
                employee={selectedRisk}
                onIntervention={handleIntervention}
            />
        </div>
    );
}
