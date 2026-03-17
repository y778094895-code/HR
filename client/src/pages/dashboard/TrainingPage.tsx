import React, { useState } from 'react';
import { TabsContainer, TabItem } from '@/components/ui/navigation/TabsContainer';
import { SkillGapAnalysis } from '@/components/features/training/SkillGapAnalysis';
import { TrainingProgramList } from '@/components/features/training/TrainingProgramList';
import { ExportButtons } from '@/components/features/exports/ExportButtons';
import { downloadBlob } from '@/lib/download';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/feedback/EmptyState';
import { Users, TrendingDown, BookOpen, Target, AlertTriangle } from 'lucide-react';

export default function TrainingPage() {
    const { t } = useTranslation();
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (type: 'pdf' | 'excel') => {
        setIsExporting(true);
        // TODO: Integrate with reportsService for training needs reports
        await new Promise(resolve => setTimeout(resolve, 800));
        console.info(`Training export requested for ${type}. Backend integration pending.`);
        setIsExporting(false);
    };

    const [searchParams] = useSearchParams();
    const view = searchParams.get('view') || 'needs';

    const getTitle = () => {
        switch (view) {
            case 'needs': return t('nav.trainingNeedPrediction', 'Training Need Prediction');
            case 'programs': return t('nav.programMatching', 'Program Matching');
            case 'impact': return t('nav.trainingImpact', 'Training Impact');
            default: return t('training.title', 'Training Needs');
        }
    };

    const renderTabs = (): TabItem[] => {
        switch (view) {
            case 'needs':
                return [
                    {
                        value: 'individual',
                        label: t('training.tabs.individualRecs', 'Individual Recommendations'),
                        content: <SkillGapAnalysis />
                    },
                    {
                        value: 'department',
                        label: t('training.tabs.deptRecs', 'Department/Group Recommendations'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={Users} title={t('common.comingSoon', 'Coming Soon')} description="Departmental training predictions are not yet available." />
                            </div>
                        )
                    },
                    {
                        value: 'decline',
                        label: t('training.tabs.areasOfDecline', 'Areas of Decline'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={TrendingDown} title={t('common.comingSoon', 'Coming Soon')} description="Identifying descending skill areas across groups is under construction." />
                            </div>
                        )
                    }
                ];
            case 'programs':
                return [
                    {
                        value: 'mapping',
                        label: t('training.tabs.weaknessMapping', 'Weakness-to-Program Mapping'),
                        content: <TrainingProgramList />
                    },
                    {
                        value: 'catalog',
                        label: t('training.tabs.catalog', 'Catalog'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={BookOpen} title={t('common.comingSoon', 'Coming Soon')} description="Global training catalog sync in progress." />
                            </div>
                        )
                    }
                ];
            case 'impact':
                return [
                    {
                        value: 'performance',
                        label: t('training.tabs.impactPerformance', 'Impact on Performance'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={Target} title={t('common.comingSoon', 'Coming Soon')} description="Post-training performance tracking metrics are pending." />
                            </div>
                        )
                    },
                    {
                        value: 'risk',
                        label: t('training.tabs.impactRisk', 'Impact on Risk'),
                        content: (
                            <div className="mt-4">
                                <EmptyState icon={AlertTriangle} title={t('common.comingSoon', 'Coming Soon')} description="Correlating training with flight risk reduction." />
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
                description={t('training.description', 'Identify skill gaps and provide targeted capability building.')}
                actions={<ExportButtons onExport={handleExport} isLoading={isExporting} />}
            />

            <TabsContainer
                tabs={renderTabs()}
                syncWithUrl="tab"
            />
        </div>
    );
}
