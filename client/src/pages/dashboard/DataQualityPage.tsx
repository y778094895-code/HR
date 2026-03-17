import React from 'react';
import { DataQualityDashboard } from '@/components/features/data-quality/DataQualityDashboard';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTranslation } from 'react-i18next';

export default function DataQualityPage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('nav.dataQuality', 'Data Quality Center')}
                description={t('dataQuality.description', 'Monitor and ensure the integrity and accuracy of organizational data.')}
            />

            <DataQualityDashboard />
        </div>
    );
}
