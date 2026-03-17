import { createStore } from '../base/base.store';

interface ThemeState {
    mode: 'light' | 'dark' | 'system';
    primaryColor: string;
    fontSize: 'small' | 'medium' | 'large';
}

const initialTheme: ThemeState = {
    mode: 'system',
    primaryColor: '#3b82f6', // blue-500
    fontSize: 'medium',
};

interface ThemeActions {
    toggleMode: () => void;
    setPrimaryColor: (color: string) => void;
}

export const useThemeStore = createStore<ThemeState, ThemeActions>(
    {
        name: 'theme',
        initial: initialTheme,
        persist: true,
    },
    (set, get) => ({
        toggleMode: () => {
            const { mode } = get();
            const newMode = mode === 'light' ? 'dark' : 'light';
            set({ mode: newMode });
            // Here you would typically also update document class for dark mode
            if (newMode === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },
        setPrimaryColor: (color: string) => {
            // Apply color to CSS variables
            document.documentElement.style.setProperty('--primary', color);
            set({ primaryColor: color });
        },
    })
);
