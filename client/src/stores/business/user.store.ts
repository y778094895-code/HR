import { createStore } from '../base/base.store';
import { userService } from '@/services/resources/user.service';
import { User } from '@/services/resources/types';

interface UserState {
    users: User[];
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    users: [],
    loading: false,
    error: null,
};

export const useUserStore = createStore<UserState, any>(
    {
        name: 'user',
        initial: initialState,
        persist: false,
    },
    (set, get) => ({
        set: (data: Partial<UserState>) => set(data),
        reset: () => set(initialState),

        fetchUsers: async () => {
            set({ loading: true, error: null });
            try {
                const users = await userService.getUsers();
                set({
                    users,
                    loading: false,
                });
            } catch (error: any) {
                set({
                    error: error.message || 'Failed to fetch users',
                    loading: false,
                });
            }
        },

        deleteUser: async (id: string) => {
            set({ loading: true, error: null });
            try {
                await userService.deleteUser(id);
                // Refresh list after delete calling the store's fetchUsers
                await get().fetchUsers();
            } catch (error: any) {
                set({
                    error: error.message || 'Failed to delete user',
                    loading: false,
                });
                throw error;
            }
        },

        updateUser: async (id: string, data: Partial<User>) => {
            set({ loading: true, error: null });
            try {
                await userService.updateUser(id, data);
                await get().fetchUsers();
            } catch (error: any) {
                set({
                    error: error.message || 'Failed to update user',
                    loading: false,
                });
                throw error;
            }
        },

        toggleUserStatus: async (id: string, isActive: boolean) => {
            set({ loading: true, error: null });
            try {
                await userService.updateUserStatus(id, isActive);
                await get().fetchUsers();
            } catch (error: any) {
                set({
                    error: error.message || 'Failed to update user status',
                    loading: false,
                });
                throw error;
            }
        },
    })
);

