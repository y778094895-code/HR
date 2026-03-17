import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

// Initialize language from local storage, defaulting to Arabic
const storedLang = localStorage.getItem('app_lang') || 'ar';

// Apply DOM Direction and Language immediately to prevent flicker
document.documentElement.dir = storedLang === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = storedLang;

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslations },
            ar: { translation: arTranslations }
        },
        lng: storedLang,
        fallbackLng: 'ar',

        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
