import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

type Locale = 'en' | 'ar';

interface LocaleContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => Promise<void>;
    isRtl: boolean;
}

const LocaleContext = createContext<LocaleContextValue>({
    locale: 'ar',
    setLocale: async () => {},
    isRtl: true,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const { i18n } = useTranslation();
    const [locale, setLocaleState] = useState<Locale>(
        () => (localStorage.getItem('app_lang') as Locale) ?? 'ar',
    );

    const applyLocale = useCallback((loc: Locale) => {
        document.documentElement.lang = loc;
        document.documentElement.dir = loc === 'ar' ? 'rtl' : 'ltr';
    }, []);

    // Apply on mount
    useEffect(() => { applyLocale(locale); }, [locale, applyLocale]);

    const setLocale = useCallback(async (loc: Locale) => {
        setLocaleState(loc);
        applyLocale(loc);
        localStorage.setItem('app_lang', loc);
        await i18n.changeLanguage(loc);

        // Persist to backend (best-effort — localStorage is the primary source)
        try {
            await axios.patch('/api/auth/me/locale', { locale: loc });
        } catch {
            // Network error is non-fatal; localStorage already updated
        }
    }, [applyLocale, i18n]);

    return (
        <LocaleContext.Provider value={{ locale, setLocale, isRtl: locale === 'ar' }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    return useContext(LocaleContext);
}
