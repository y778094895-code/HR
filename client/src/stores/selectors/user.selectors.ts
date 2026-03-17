import { useUserStore } from '../business/user.store';

export const useAllUsers = () => useUserStore((state) => state.users);
export const useUserLoading = () => useUserStore((state) => state.loading);
export const useUserError = () => useUserStore((state) => state.error);
