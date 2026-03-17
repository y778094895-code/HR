import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthStore } from '@/stores/business/auth.store';
import { useTranslation } from 'react-i18next';
import './Login.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

    const { isAuthenticated } = useAuthStore();
    const { login: contextLogin } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token || isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate, isAuthenticated]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await contextLogin(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            const message = err.response?.data?.message || t('auth.failed');
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <div className="w-full max-w-md bg-card text-card-foreground rounded-2xl shadow-xl border border-border/50 p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8 space-y-2">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-4">
                        <span className="text-xl font-bold text-primary leading-none tracking-tight">HR</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
                    <p className="text-sm text-muted-foreground font-medium">Please sign in to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-sm font-semibold text-foreground">
                            {t('auth.email')}
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@smart-hr.com"
                            autoComplete="email"
                            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all duration-200"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-sm font-semibold text-foreground">
                            {t('auth.password')}
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all duration-200"
                        />
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-lg border border-destructive shadow-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center px-4 py-3 mt-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 border-2 border-primary-foreground border-r-transparent rounded-full animate-spin"></span>
                                {t('auth.loggingIn')}
                            </span>
                        ) : (
                            t('auth.login')
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-border/60 text-center">
                    <p className="text-xs text-muted-foreground font-medium">
                        {t('auth.defaultCredentials')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
