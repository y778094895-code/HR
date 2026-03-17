import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/data-display/table';
import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/buttons/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/data-display/avatar';
import { Skeleton } from '@/components/ui/feedback/skeleton';
import { Employee } from '@/services/resources/employee.service';
import { cn } from '@/lib/utils';

interface EmployeeTableProps {
    employees: Employee[];
    loading?: boolean;
    onViewProfile?: (id: string) => void;
    onDelete?: (id: string) => void;
}

const statusStyles = {
    active: 'bg-emerald-50 text-emerald-600 border-emerald-200/50',
    inactive: 'bg-slate-50 text-slate-500 border-slate-200/50',
    on_boarding: 'bg-blue-50 text-blue-600 border-blue-200/50',
};

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
    employees,
    loading = false,
    onViewProfile,
    onDelete
}) => {
    if (loading && employees.length === 0) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border/60 bg-white/50 backdrop-blur-sm shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-b-border/60">
                        <TableHead className="py-4 font-semibold text-slate-900">Employee</TableHead>
                        <TableHead className="py-4 font-semibold text-slate-900">Department</TableHead>
                        <TableHead className="py-4 font-semibold text-slate-900">Position</TableHead>
                        <TableHead className="py-4 font-semibold text-slate-900">Status</TableHead>
                        <TableHead className="py-4 font-semibold text-slate-900 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map((employee) => (
                        <TableRow key={employee.id} className="group hover:bg-slate-50/50 transition-colors border-b-border/40 last:border-0">
                            <TableCell className="py-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="size-10 ring-2 ring-white shadow-sm transition-transform group-hover:scale-105">
                                        <AvatarImage src={`https://avatar.iran.liara.run/username?username=${employee.fullName}`} />
                                        <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
                                            {employee.fullName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-900 leading-none">{employee.fullName}</span>
                                        <span className="text-sm text-slate-500 mt-1">{employee.email}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="py-4 text-slate-600 font-medium">{employee.department}</TableCell>
                            <TableCell className="py-4 text-slate-600">{employee.designation}</TableCell>
                            <TableCell className="py-4">
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "px-2.5 py-0.5 rounded-full capitalize text-[11px] font-semibold tracking-wide border transition-colors",
                                        statusStyles[employee.employmentStatus] || 'bg-slate-50 text-slate-600 border-slate-200'
                                    )}
                                >
                                    {employee.employmentStatus.replace('_', ' ')}
                                </Badge>
                            </TableCell>
                            <TableCell className="py-4 text-right">
                                <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-slate-600 hover:text-primary hover:bg-primary/5 font-medium"
                                        onClick={() => onViewProfile?.(employee.id)}
                                        aria-label={`View ${employee.fullName} profile`}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-slate-400 hover:text-red-600 hover:bg-red-50 font-medium"
                                        onClick={() => onDelete?.(employee.id)}
                                        aria-label={`Delete ${employee.fullName}`}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {employees.length === 0 && !loading && (
                <div className="py-20 text-center">
                    <p className="text-slate-500 font-medium">No employees found.</p>
                </div>
            )}
        </div>
    );
};

export default EmployeeTable;
