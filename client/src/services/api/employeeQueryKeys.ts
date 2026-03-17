export const employeeKeys = {
    all: ['employee'] as const,
    detail: (id: string) => [...employeeKeys.all, id] as const,
    header: (id: string) => [...employeeKeys.detail(id), 'header'] as const,

    // Tab level queries - separate cache entries per tab
    tabOverview: (id: string) => [...employeeKeys.detail(id), 'overview'] as const,
    tabRisk: (id: string) => [...employeeKeys.detail(id), 'risk'] as const,
    tabPerformance: (id: string, period?: string) => [...employeeKeys.detail(id), 'performance', period || 'current'] as const,
    tabFairness: (id: string) => [...employeeKeys.detail(id), 'fairness'] as const,
    tabTraining: (id: string) => [...employeeKeys.detail(id), 'training'] as const,
    tabCases: (id: string) => [...employeeKeys.detail(id), 'cases'] as const,
    tabImpact: (id: string) => [...employeeKeys.detail(id), 'impact'] as const,
    tabTimeline: (id: string, page: number) => [...employeeKeys.detail(id), 'timeline', page] as const,
};
