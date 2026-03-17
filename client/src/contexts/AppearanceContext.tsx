import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'light' | 'dark' | 'midnight' | 'sand' | 'system';
export type AccentType = 'default' | 'blue' | 'green' | 'purple' | 'orange';

export interface AppearanceSettings {
    theme: ThemeType;
    accent: AccentType;
}

export interface AppearanceContextType extends AppearanceSettings {
    setTheme: (theme: ThemeType) => void;
    setAccent: (accent: AccentType) => void;
}

const DEFAULT_SETTINGS: AppearanceSettings = {
    theme: 'system',
    accent: 'default',
};

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AppearanceSettings>(() => {
        try {
            const stored = localStorage.getItem('settings_appearance_v1');
            return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
        } catch {
            return DEFAULT_SETTINGS;
        }
    });

    const updateSettings = (updates: Partial<AppearanceSettings>) => {
        setSettings(current => {
            const next = { ...current, ...updates };
            localStorage.setItem('settings_appearance_v1', JSON.stringify(next));
            return next;
        });
    };

    const setTheme = (theme: ThemeType) => updateSettings({ theme });
    const setAccent = (accent: AccentType) => updateSettings({ accent });

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = (theme: ThemeType) => {
            root.removeAttribute('data-theme');
            root.classList.remove('light', 'dark', 'midnight', 'sand');

            if (theme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
                root.setAttribute('data-theme', systemTheme);
                // Keeping class as a fallback for 3rd party libraries if needed, though data-theme is priority
                root.classList.add(systemTheme);
                return;
            }

            root.setAttribute('data-theme', theme);
            root.classList.add(theme); // fallback
        };

        applyTheme(settings.theme);

        // Listen for system preference changes if 'system' is selected
        if (settings.theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => {
                applyTheme('system');
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [settings.theme]);

    useEffect(() => {
        const root = window.document.documentElement;

        if (settings.accent === 'default') {
            root.removeAttribute('data-accent');
        } else {
            root.setAttribute('data-accent', settings.accent);
        }
    }, [settings.accent]);

    return (
        <AppearanceContext.Provider value={{ ...settings, setTheme, setAccent }}>
            {children}
        </AppearanceContext.Provider>
    );
}

export function useAppearance() {
    const context = useContext(AppearanceContext);
    if (context === undefined) {
        throw new Error('useAppearance must be used within an AppearanceProvider');
    }
    return context;
}
