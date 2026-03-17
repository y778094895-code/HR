// ============================================================
// Data Quality Dashboard - Main Component
// ============================================================

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QualityOverview } from './QualityOverview';
import { QualityIssuesList } from './QualityIssuesList';
import type { QualityIssueCategory } from '@/types/dataQuality';

export function DataQualityDashboard() {
    const { t } = useTranslation();
    const [activeView, setActiveView] = useState<'overview' | 'missing' | 'invalid' | 'inconsistent'>('overview');

    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                return <QualityOverview />;
            case 'missing':
                return <QualityIssuesList category="missing_data" showFilters={true} />;
            case 'invalid':
                return <QualityIssuesList category="invalid_data" showFilters={true} />;
            case 'inconsistent':
                return <QualityIssuesList category="inconsistent_data" showFilters={true} />;
            default:
                return <QualityOverview />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b pb-2">
                <button
                    onClick={() => setActiveView('overview')}
                    className={`px-4 py-2 rounded-t-lg transition-colors ${
                        activeView === 'overview'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                    }`}
                >
                    {t('dataQuality.tabs.overview', 'Overview')}
                </button>
                <button
                    onClick={() => setActiveView('missing')}
                    className={`px-4 py-2 rounded-t-lg transition-colors ${
                        activeView === 'missing'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                    }`}
                >
                    {t('dataQuality.tabs.missingRecords', 'Missing Records')}
                </button>
                <button
                    onClick={() => setActiveView('invalid')}
                    className={`px-4 py-2 rounded-t-lg transition-colors ${
                        activeView === 'invalid'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                    }`}
                >
                    {t('dataQuality.tabs.invalidData', 'Invalid Data')}
                </button>
                <button
                    onClick={() => setActiveView('inconsistent')}
                    className={`px-4 py-2 rounded-t-lg transition-colors ${
                        activeView === 'inconsistent'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                    }`}
                >
                    {t('dataQuality.tabs.inconsistentData', 'Inconsistent Data')}
                </button>
            </div>

            {/* Content */}
            {renderContent()}
        </div>
    );
}

export default DataQualityDashboard;

