import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// ── Namespace imports (eagerly bundled; swap to i18next-http-backend for code-split) ──
import enCommon from '../locales/en/common.json';
import enGoals from '../locales/en/goals.json';
import enReviews from '../locales/en/reviews.json';
import enRisk from '../locales/en/risk.json';
import enRecommendations from '../locales/en/recommendations.json';
import enDashboard from '../locales/en/dashboard.json';
import enFairness from '../locales/en/fairness.json';
import enSettings from '../locales/en/settings.json';
import enErrors from '../locales/en/errors.json';

import arCommon from '../locales/ar/common.json';
import arGoals from '../locales/ar/goals.json';
import arReviews from '../locales/ar/reviews.json';
import arRisk from '../locales/ar/risk.json';
import arRecommendations from '../locales/ar/recommendations.json';
import arDashboard from '../locales/ar/dashboard.json';
import arFairness from '../locales/ar/fairness.json';
import arSettings from '../locales/ar/settings.json';
import arErrors from '../locales/ar/errors.json';

const storedLang = (localStorage.getItem('app_lang') as 'en' | 'ar') || 'ar';

// Apply dir/lang immediately to prevent layout flash
document.documentElement.dir = storedLang === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = storedLang;

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                common: enCommon,
                goals: enGoals,
                reviews: enReviews,
                risk: enRisk,
                recommendations: enRecommendations,
                dashboard: enDashboard,
                fairness: enFairness,
                settings: enSettings,
                errors: enErrors,
            },
            ar: {
                common: arCommon,
                goals: arGoals,
                reviews: arReviews,
                risk: arRisk,
                recommendations: arRecommendations,
                dashboard: arDashboard,
                fairness: arFairness,
                settings: arSettings,
                errors: arErrors,
            },
        },
        lng: storedLang,
        fallbackLng: 'en',
        defaultNS: 'common',
        ns: ['common', 'goals', 'reviews', 'risk', 'recommendations', 'dashboard', 'fairness', 'settings', 'errors'],
        interpolation: { escapeValue: false },
    });

export default i18n;
