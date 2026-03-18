/**
 * Canonical training category enum for the Smart Performance System.
 * Used for TrainingService validation, ML service labels, and ImportWizard selectors.
 */
export enum TrainingCategory {
    Leadership = 'Leadership',
    TechnicalSkills = 'Technical Skills',
    Communication = 'Communication',
    ProjectManagement = 'Project Management',
    DataAnalytics = 'Data & Analytics',
    Compliance = 'Compliance',
}

/** All valid category values as a readonly array — use for Zod `.enum()` or select options. */
export const TRAINING_CATEGORIES = Object.values(TrainingCategory) as [string, ...string[]];

/** Arabic labels keyed by category value — for bilingual UI dropdowns. */
export const TRAINING_CATEGORY_AR: Record<TrainingCategory, string> = {
    [TrainingCategory.Leadership]: 'القيادة',
    [TrainingCategory.TechnicalSkills]: 'المهارات التقنية',
    [TrainingCategory.Communication]: 'التواصل',
    [TrainingCategory.ProjectManagement]: 'إدارة المشاريع',
    [TrainingCategory.DataAnalytics]: 'البيانات والتحليلات',
    [TrainingCategory.Compliance]: 'الامتثال',
};
