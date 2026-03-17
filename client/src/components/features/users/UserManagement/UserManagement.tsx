import React from 'react';
import UserTable from '../components/UserTable';
import { Button } from '@/components/ui/buttons/button';
import { User } from '../hooks/useUsers';
import { Plus } from 'lucide-react';

interface UserManagementProps {
    users: User[];
    loading?: boolean;
    onAdd: () => void;
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
    onToggleStatus?: (id: string, isActive: boolean) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
    users,
    loading,
    onAdd,
    onEdit,
    onDelete,
    onToggleStatus
}) => {
    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
                    <p className="text-slate-500 mt-1">Manage application users, roles, and platform permissions.</p>
                </div>
                <Button onClick={onAdd} className="gap-2 shadow-sm">
                    <Plus size={18} /> Add User
                </Button>
            </div>

            <UserTable
                users={users}
                loading={loading}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus || (() => {})}
            />
        </div>
    );
};

export default UserManagement;
