import { useUsers, User } from '@/components/features/users/hooks/useUsers';
import UserTable from '../UserTable';
import { UserEditDialog } from '../UserEditDialog';
import { useState } from 'react';
import { Button } from '@/components/ui/buttons/button';
import { RefreshCw, UserX } from 'lucide-react';

interface InactiveUsersTabProps {
    users?: User[];
    loading?: boolean;
    onRefresh?: () => void;
    onDelete?: (id: string) => void;
    onUpdate?: (id: string, data: Partial<User>) => Promise<void>;
    onToggleStatus?: (id: string, isActive: boolean) => void;
}

export function InactiveUsersTab({ 
    users: propUsers, 
    loading: propLoading, 
    onRefresh,
    onDelete,
    onUpdate,
    onToggleStatus 
}: InactiveUsersTabProps) {
    const { 
        inactiveUsers, 
        loading: hookLoading, 
        refresh, 
        deleteUser, 
        updateUser,
        toggleUserStatus 
    } = useUsers();
    
    const [editUser, setEditUser] = useState<User | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const users = propUsers || inactiveUsers;
    const loading = propLoading ?? hookLoading;

    const handleEdit = (user: User) => {
        setEditUser(user);
        setEditDialogOpen(true);
    };

    const handleSaveEdit = async (id: string, data: Partial<User>) => {
        try {
            if (onUpdate) {
                await onUpdate(id, data);
            } else {
                await updateUser(id, data);
            }
            setEditDialogOpen(false);
            setEditUser(null);
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleDelete = async (id: string) => {
        try {
            if (onDelete) {
                await onDelete(id);
            } else {
                await deleteUser(id);
            }
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleToggleStatus = async (id: string, isActive: boolean) => {
        try {
            if (onToggleStatus) {
                onToggleStatus(id, isActive);
            } else {
                await toggleUserStatus(id, isActive);
            }
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh();
        } else {
            refresh();
        }
    };

    // Defensive: ensure users is always an array
    const safeUsers = Array.isArray(users) ? users : [];

    // Show empty state if no inactive users
    if (!users || users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-slate-100 p-4 mb-4">
                    <UserX className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Inactive Users</h3>
                <p className="text-slate-500 max-w-sm">
                    There are currently no inactive users in the system. Deactivated users will appear here.
                </p>
                <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-sm text-slate-500">
                    {users?.length || 0} inactive user{users?.length !== 1 ? 's' : ''}
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Users Table */}
            <UserTable
                users={users || []}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
            />

            {/* Edit Dialog */}
            <UserEditDialog
                user={editUser}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSave={handleSaveEdit}
                loading={loading}
            />
        </div>
    );
}

