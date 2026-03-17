import { createStore } from '../base/base.store';
import { User } from '../../types/users';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
};

interface AuthActions {
    loginSuccess: (user: User, token: string) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
    set: (data: Partial<AuthState>) => void;
    reset: () => void;
}

export const useAuthStore = createStore<AuthState, AuthActions>(
    {
        name: 'auth',
        initial: initialState,
        persist: true,
    },
    (set, get) => ({
        set: (data: Partial<AuthState>) => set(data),
        reset: () => set(initialState),

        loginSuccess: (user: User, token: string) => {
            set({ user, token, error: null, isLoading: false, isAuthenticated: true });
        },

        logout: () => {
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        },

        checkAuth: async () => {
            // Placeholder for token validation against backend
            const token = get().token;
            if (!token) {
                set({ isAuthenticated: false });
                return;
            }
            // In a real app, we'd call an API here. For now, we assume if token exists, we are authenticated
            set({ isAuthenticated: true });
        },

    })
);
