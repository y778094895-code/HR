import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/data-display/table';
import { Badge } from '@/components/ui/data-display/badge';
import { Skeleton } from '@/components/ui/feedback/skeleton';
import { Intervention } from '@/types/intervention';

interface InterventionsListProps {
    interventions: Intervention[];
    loading?: boolean;
}

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

const InterventionsList: React.FC<InterventionsListProps> = ({ interventions, loading = false }) => {
    if (loading && interventions.length === 0) {
        return <Skeleton className="h-64 w-full" />;
    }

    return (
        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-gray-50">
                    <TableRow>
                        <TableHead className="font-bold">Intervention Type</TableHead>
                        <TableHead className="font-bold">Execution Date</TableHead>
                        <TableHead className="font-bold">Expected Impact</TableHead>
                        <TableHead className="font-bold text-center">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {interventions.length > 0 ? (
                        interventions.map((item) => (
                            <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                                <TableCell className="font-medium text-gray-900">{item.type}</TableCell>
                                <TableCell className="text-gray-600">
                                    {new Date(item.dueDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-emerald-600 font-semibold">
                                    {item.expectedOutcome ? `Outcome Set` : 'N/A'}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full capitalize border-none", statusColors[item.status.toLowerCase()] || "bg-gray-100 text-gray-800")}>
                                        {item.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                No interventions found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

// Helper for conditional classes
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default InterventionsList;
