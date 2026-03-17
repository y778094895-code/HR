import React from 'react';
import { EmployeeTable } from './EmployeeTable';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import { Search, Plus } from 'lucide-react';
import { Employee } from '@/services/resources/employee.service';

interface EmployeeListPageProps {
    employees: Employee[];
    loading?: boolean;
    onSearch: (term: string) => void;
    onAdd: () => void;
    onDelete: (id: string) => void;
    onViewProfile: (id: string) => void;
}

const EmployeeListPage: React.FC<EmployeeListPageProps> = ({
    employees,
    loading,
    onSearch,
    onAdd,
    onDelete,
    onViewProfile
}) => {
    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Employees</h1>
                    <p className="text-gray-500">Manage your workforce and performance metrics.</p>
                </div>
                <Button onClick={onAdd} className="gap-2">
                    <Plus size={18} /> Add Employee
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search employees..."
                        className="pl-10 h-10 border-gray-200 focus-visible:ring-primary/20 transition-all"
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
            </div>

            <EmployeeTable
                employees={employees}
                loading={loading}
                onDelete={onDelete}
                onViewProfile={onViewProfile}
            />
        </div>
    );
};

export default EmployeeListPage;
