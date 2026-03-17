import { useState } from 'react';
import UserTable from '../UserTable';
import { UserEditDialog } from '../UserEditDialog';
import AddUserForm from '@/components/features/users/UserForm/UserForm';
import { useUsers, User } from '@/components/features/users/hooks/useUsers';
import { Button } from '@/components/ui/buttons/button';
import { Plus, RefreshCw } from 'lucide-react';

interface ActiveUsersTabProps {
    users?: User[];
    loading?: boolean;
    onRefresh?: () => void;
    onDelete?: (id: string) => void;
    onUpdate?: (id: string, data: Partial<User>) => Promise<void>;
    onToggleStatus?: (id: string, isActive: boolean) => void;
}

export function ActiveUsersTab({ 
    users: propUsers, 
    loading: propLoading, 
    onRefresh,
    onDelete,
    onUpdate,
    onToggleStatus 
}: ActiveUsersTabProps) {
    const { 
        activeUsers, 
        loading: hookLoading, 
        refresh, 
        deleteUser, 
        updateUser,
        toggleUserStatus 
    } = useUsers();
    
    const [editUser, setEditUser] = useState<User | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const users = propUsers || activeUsers;
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

    return (
        <div className="space-y-6">
            {/* Header with actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-sm text-slate-500">
                    {safeUsers.length} active user{safeUsers.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button 
                        size="sm" 
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                </div>
            </div>

            {/* Add User Form */}
            {isEditing && (
                <div className="bg-white rounded-xl border border-border/60 p-6 shadow-sm">
                    <AddUserForm 
                        onSuccess={() => {
                            setIsEditing(false);
                            handleRefresh();
                        }}
                        onCancel={() => setIsEditing(false)}
                    />
                </div>
            )}

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

