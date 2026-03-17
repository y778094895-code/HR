import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthStore } from '../stores/business/auth.store';
import { authService } from '@/services/resources/auth.service';
import { UserProfile } from '@/types/auth';

console.log("AuthContext module loaded:", import.meta.url); // Debug: Check for duplicate modules


export const clearAuthStorage = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_v1');
};

interface AuthContextType {
    user: UserProfile | null;
    token: string | null;
    role: string | null;
    permissions: string[];
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
    hasRole: (role: string | string[]) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
    hasPermission: (permission: string) => boolean;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load token from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            try {
                if (storedUser === 'undefined') {
                    throw new Error('Invalid user data in localStorage');
                }
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setToken(storedToken);

                // Sync with global store (critical for ProtectedRoute)
                useAuthStore.getState().loginSuccess(parsedUser, storedToken);
            } catch (error) {
                console.error('Failed to parse (or found invalid) user from localStorage', error);
                clearAuthStorage();
                useAuthStore.getState().logout();
            }
        } else {
            // If no local storage, ensure store is cleared
            useAuthStore.getState().logout();
        }

        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            console.log("Attempting login for:", email);
            const response = await authService.login({ email, password });

            const { user, access_token } = response;

            // Store token and user info
            localStorage.setItem('auth_token', access_token);
            localStorage.setItem('auth_user', JSON.stringify(user));

            setToken(access_token);
            setUser(user);

            // Sync with global store
            useAuthStore.getState().loginSuccess(user, access_token);
        } catch (error: any) {
            console.error('AuthContext Login Error:', error);
            throw error;
        }
    };

    const logout = () => {
        // Clear local state completely
        clearAuthStorage();
        setToken(null);
        setUser(null);

        // Notify store and server
        useAuthStore.getState().logout();
    };

    const refreshProfile = async () => {
        await useAuthStore.getState().checkAuth();
        // Sync local state with store after refresh
        const { user: updatedUser, token: updatedToken } = useAuthStore.getState();
        setUser(updatedUser);
        setToken(updatedToken);
        if (updatedUser) {
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        }
    };

    const hasRole = (roleToCheck: string | string[]) => {
        if (Array.isArray(roleToCheck)) {
            return !!user?.role && roleToCheck.includes(user.role);
        }
        return user?.role === roleToCheck;
    };

    const hasAnyRole = (rolesToCheck: string[]) => {
        return !!user?.role && rolesToCheck.includes(user.role);
    };

    const hasPermission = (permission: string) => {
        // Placeholder for future RBAC logic where permissions are fetched
        return false;
    };

    const value = React.useMemo(() => ({
        user,
        token,
        role: user?.role || null,
        permissions: [],
        login,
        logout,
        refreshProfile,
        hasRole,
        hasAnyRole,
        hasPermission,
        isAuthenticated: !!token,
        isLoading,
        error: null,
    }), [user, token, isLoading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
