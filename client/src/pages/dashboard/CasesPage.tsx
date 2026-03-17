import React from 'react';
import { CasesList } from '@/components/features/cases/CasesList';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TabsContainer, TabItem } from '@/components/ui/navigation/TabsContainer';
import { PageHeader } from '@/components/layout/PageHeader';

export default function CasesPage() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const view = searchParams.get('view') || 'open';

    const getTitle = () => {
        switch (view) {
            case 'open': return t('nav.openCases', 'Open Cases');
            case 'progress': return t('nav.inProgressCases', 'In Progress Cases');
            case 'review': return t('nav.underReviewCases', 'Under Review Cases');
            case 'closed': return t('nav.closedCases', 'Closed Cases');
            default: return t('nav.cases', 'Cases Management');
        }
    };

    const tabs: TabItem[] = [
        {
            value: 'open',
            label: t('nav.openCases', 'Open Cases'),
            content: <CasesList viewFilter="open" />
        },
        {
            value: 'progress',
            label: t('nav.inProgressCases', 'In Progress'),
            content: <CasesList viewFilter="progress" />
        },
        {
            value: 'review',
            label: t('nav.underReviewCases', 'Under Review'),
            content: <CasesList viewFilter="review" />
        },
        {
            value: 'closed',
            label: t('nav.closedCases', 'Closed Cases'),
            content: <CasesList viewFilter="closed" />
        }
    ];
    return (
        <div className="space-y-6">
            <PageHeader
                title={getTitle()}
                description={t('cases.description', 'Manage open cases, assign responsibilities, and execute interventions.')}
            />

            <TabsContainer
                tabs={tabs}
                defaultValue="open"
                syncWithUrl="view"
            />
        </div>
    );
}
