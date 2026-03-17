import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { TabsContainer, TabItem } from '@/components/ui/navigation/TabsContainer';
import { ReportTemplatesGrid } from '@/components/features/reports/ReportTemplatesGrid';
import { ReportBuilder } from '@/components/features/reports/ReportBuilder';
import { ReportDownloadCenter } from '@/components/features/reports/ReportDownloadCenter';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { useReportJobs } from '@/hooks/useReportJobs';
import { ReportConfig } from '@/types/reports';

export default function ReportsPage() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const validViews = ['library', 'builder', 'exports'];
    const rawView = searchParams.get('view');
    const view = rawView && validViews.includes(rawView) ? rawView : 'library';
    const { submitReport } = useReportJobs();

    const getTitle = () => {
        switch (view) {
            case 'library': return t('nav.reportLibrary', 'Report Library');
            case 'builder': return t('nav.reportBuilder', 'Report Builder');
            case 'exports': return t('nav.exports', 'Exports & Downloads');
            default: return t('reports.title', 'Reports & Analytics');
        }
    };

    // Handle running a template from the templates grid
    const handleRunTemplate = async (templateId: string, templateName: string) => {
        try {
            const config: ReportConfig = {
                templateId,
                format: 'pdf',
                parameters: {},
            };
            await submitReport(config, templateName);
            // Switch to downloads tab to show the job
            setSearchParams({ view: 'exports' });
        } catch (err) {
            console.error('Failed to run template:', err);
        }
    };

    // Handle generating a custom report from the builder
    const handleGenerateCustom = async (config: ReportConfig, templateName: string) => {
        try {
            await submitReport(config, templateName);
            // Switch to downloads tab to show the job
            setSearchParams({ view: 'exports' });
        } catch (err) {
            console.error('Failed to generate report:', err);
        }
    };

    const renderTabs = (): TabItem[] => {
        switch (view) {
            case 'library':
                return [
                    {
                        value: 'templates',
                        label: t('reports.tabs.templates', 'Templates'),
                        content: <ReportTemplatesGrid onRun={handleRunTemplate} />
                    }
                ];
            case 'builder':
                return [
                    {
                        value: 'request',
                        label: t('reports.tabs.request', 'Request Report'),
                        content: <ReportBuilder onGenerate={handleGenerateCustom} />
                    }
                ];
            case 'exports':
                return [
                    {
                        value: 'jobs',
                        label: t('reports.tabs.jobs', 'Report Jobs'),
                        content: <ReportDownloadCenter />
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
                description={t('reports.description', 'Generate, customize, and download HR analytics reports.')}
            />

            <TabsContainer
                tabs={renderTabs()}
                syncWithUrl="tab"
            />
        </div>
    );
}

