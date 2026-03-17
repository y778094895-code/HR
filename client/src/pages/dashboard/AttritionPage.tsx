import React, { useState } from 'react';
import { TabsContainer, TabItem } from '@/components/ui/navigation/TabsContainer';
import { AttritionOverview } from '@/components/features/attrition/AttritionOverview';
import { RiskList } from '@/components/features/attrition/RiskList';
import { ExportButtons } from '@/components/features/exports/ExportButtons';
import { downloadBlob } from '@/lib/download';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/feedback/EmptyState';
import { Activity, ShieldAlert, Cpu, Banknote, HelpCircle, Target } from 'lucide-react';

export default function AttritionPage() {
    const { t } = useTranslation();
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (type: 'pdf' | 'excel') => {
        setIsExporting(true);
        // TODO: Integrate with reportsService.downloadReport when the attrition report job is available
        await new Promise(resolve => setTimeout(resolve, 800));
        console.info(`Export requested for ${type}. Backend integration pending.`);
        setIsExporting(false);
    };

    const [searchParams] = useSearchParams();
    const view = searchParams.get('view') || 'risk';

    const getTitle = () => {
        switch (view) {
            case 'risk': return t('nav.riskPrediction', 'Attrition Risk Prediction');
            case 'drivers': return t('nav.riskDrivers', 'Drivers');
            case 'cost': return t('nav.attritionCost', 'Attrition Cost');
            default: return t('attrition.title', 'Attrition & Turnover');
        }
    };

    const renderTabs = (): TabItem[] => {
        switch (view) {
            case 'risk':
                return [
                    {
                        value: 'dashboard',
                        label: t('attrition.tabs.riskDashboard', 'Risk Dashboard'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={Activity} title={t('common.comingSoon', 'Coming Soon')} description="Global risk dashboard metrics are compiling." />
                            </div>
                        )
                    },
                    {
                        value: 'list',
                        label: t('attrition.tabs.highRiskList', 'High Risk List'),
                        content: <RiskList />
                    },
                    {
                        value: 'thresholds',
                        label: t('attrition.tabs.riskThreshold', 'Risk Threshold (70% + ranges)'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={Target} title={t('common.comingSoon', 'Coming Soon')} description="Risk thresholds configuration is currently offline." />
                            </div>
                        )
                    }
                ];
            case 'drivers':
                return [
                    {
                        value: 'features',
                        label: t('attrition.tabs.features', 'Features'),
                        content: <AttritionOverview />
                    },
                    {
                        value: 'xai',
                        label: t('attrition.tabs.xaiDetails', 'XAI Details'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={Cpu} title={t('common.comingSoon', 'Coming Soon')} description="Explainable AI insights are generating." />
                            </div>
                        )
                    }
                ];
            case 'cost':
                return [
                    {
                        value: 'direct',
                        label: t('attrition.tabs.directCost', 'Direct Cost'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={Banknote} title={t('common.comingSoon', 'Coming Soon')} description="Direct cost formulas are being applied." />
                            </div>
                        )
                    },
                    {
                        value: 'indirect',
                        label: t('attrition.tabs.indirectCost', 'Indirect Cost'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={HelpCircle} title={t('common.comingSoon', 'Coming Soon')} description="Indirect cost estimations require further data inputs." />
                            </div>
                        )
                    },
                    {
                        value: 'total',
                        label: t('attrition.tabs.totalImpact', 'Total Financial Impact'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={ShieldAlert} title={t('common.comingSoon', 'Coming Soon')} description="Total financial impact aggregation is pending." />
                            </div>
                        )
                    }
                ];
            default:
                return [];
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={getTitle()}
                description={t('attrition.description', 'Predict, analyze, and mitigate employee turnover risks.')}
                actions={<ExportButtons onExport={handleExport} isLoading={isExporting} />}
            />

            <TabsContainer
                tabs={renderTabs()}
                syncWithUrl="tab"
            />
        </div>
    );
}
