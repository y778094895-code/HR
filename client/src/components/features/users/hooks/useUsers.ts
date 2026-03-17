import { useEffect } from 'react';
import { useUserStore } from '@/stores/business/user.store';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types/users';
import { normalizeUsers } from '@/lib/users-normalizer';

export type { User };

export const useUsers = () => {
    const {
        users,
        loading,
        error,
        fetchUsers,
        deleteUser: deleteAction,
        updateUser: updateAction,
        toggleUserStatus: toggleStatusAction,
    } = useUserStore();

    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (error) {
            toast({
                title: 'Error',
                description: error,
                variant: 'destructive',
            });
        }
    }, [error, toast]);

    const handleDelete = async (id: string) => {
        try {
            await deleteAction(id);
            toast({ title: 'Success', description: 'User deleted successfully' });
        } catch (err: any) {
            // Error handled by store
        }
    };

    const handleUpdate = async (id: string, data: Partial<User>) => {
        try {
            await updateAction(id, data);
            toast({ title: 'Success', description: 'User updated successfully' });
        } catch (err: any) {
            // Error handled by store
        }
    };

    const handleToggleStatus = async (id: string, isActive: boolean) => {
        try {
            await toggleStatusAction(id, isActive);
            toast({ 
                title: 'Success', 
                description: isActive ? 'User activated successfully' : 'User deactivated successfully' 
            });
        } catch (err: any) {
            // Error handled by store
        }
    };

    // Normalize users to ensure it's always an array
    const normalizedUsers = normalizeUsers(users);

    // Filter users by status - safe with normalized array
    const activeUsers = normalizedUsers.filter((user: User) => (user as any).isActive !== false);
    const inactiveUsers = normalizedUsers.filter((user: User) => (user as any).isActive === false);

    return {
        users: normalizedUsers,
        activeUsers,
        inactiveUsers,
        loading,
        error,
        refresh: fetchUsers,
        deleteUser: handleDelete,
        updateUser: handleUpdate,
        toggleUserStatus: handleToggleStatus,
    };
};

export default useUsers;

