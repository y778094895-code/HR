import React from 'react';
import { EmployeeProfileBundle } from '@/services/resources/profileDataAdapter';
import { TabsContainer } from '@/components/ui/navigation/TabsContainer';
import { Skeleton } from '@/components/ui/feedback/skeleton';

// Lazy load tabs for code splitting
const OverviewTab = React.lazy(() => import('./tabs/OverviewTab'));
const PerformanceTab = React.lazy(() => import('./tabs/PerformanceTab'));
const AttritionTab = React.lazy(() => import('./tabs/AttritionTab'));
const TrainingTab = React.lazy(() => import('./tabs/TrainingTab'));
const FairnessTab = React.lazy(() => import('./tabs/FairnessTab'));
const CasesTab = React.lazy(() => import('./tabs/CasesTab'));
const ImpactTab = React.lazy(() => import('./tabs/ImpactTab'));
const TimelineTab = React.lazy(() => import('./tabs/TimelineTab'));

interface ProfileTabsProps {
    profile: EmployeeProfileBundle;
    activeView: string;
}

export default function ProfileTabs({ profile, activeView }: ProfileTabsProps) {
    const TabSuspense = ({ children }: { children: React.ReactNode }) => (
        <React.Suspense fallback={<div className="p-8 space-y-4"><Skeleton className="h-[400px] w-full rounded-xl" /></div>}>
            {children}
        </React.Suspense>
    );

    const tabs = [
        {
            value: 'overview',
            label: 'Overview',
            content: <TabSuspense><OverviewTab profile={profile} /></TabSuspense>,
        },
        {
            value: 'performance',
            label: 'Performance',
            content: <TabSuspense><PerformanceTab profile={profile} /></TabSuspense>,
        },
        {
            value: 'attrition',
            label: 'Attrition Risk',
            content: <TabSuspense><AttritionTab profile={profile} /></TabSuspense>,
        },
        {
            value: 'training',
            label: 'Training & Development',
            content: <TabSuspense><TrainingTab profile={profile} /></TabSuspense>,
        },
        {
            value: 'fairness',
            label: 'Fairness',
            content: <TabSuspense><FairnessTab profile={profile} /></TabSuspense>,
        },
        {
            value: 'cases',
            label: 'Cases & Interventions',
            content: <TabSuspense><CasesTab profile={profile} /></TabSuspense>,
        },
        {
            value: 'impact',
            label: 'Impact Analysis',
            content: <TabSuspense><ImpactTab profile={profile} /></TabSuspense>,
        },
        {
            value: 'timeline',
            label: 'Timeline & Activity Log',
            content: <TabSuspense><TimelineTab profile={profile} /></TabSuspense>,
        }
    ];

    return (
        <TabsContainer
            syncWithUrl="view"
            defaultValue="overview"
            tabs={tabs}
        />
    );
}
