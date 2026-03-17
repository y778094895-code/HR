import React from 'react';
import { Button } from '@/components/ui/buttons/button';
import { FileBarChart, Users, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/ui/feedback/EmptyState';
import { Spinner } from '@/components/ui/feedback/spinner';

interface Props {
    onRun: (templateId: string, templateName: string) => void;
}

// Map template types to icons and colors
const getTemplateIcon = (type: string) => {
    switch (type) {
        case 'performance':
            return { icon: TrendingUp, color: 'text-blue-600 bg-blue-100' };
        case 'turnover':
        case 'attrition':
            return { icon: AlertTriangle, color: 'text-red-600 bg-red-100' };
        case 'fairness':
            return { icon: Users, color: 'text-purple-600 bg-purple-100' };
        case 'training':
            return { icon: FileBarChart, color: 'text-green-600 bg-green-100' };
        default:
            return { icon: FileBarChart, color: 'text-gray-600 bg-gray-100' };
    }
};

export function ReportTemplatesGrid({ onRun }: Props) {
    const { t } = useTranslation();
    const { templates, isLoading, error, refetch } = useReports();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner className="h-8 w-8" />
                <span className="ml-3 text-muted-foreground">{t('reports.loading', 'Loading templates...')}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <EmptyState
                    icon={AlertTriangle}
                    title={t('reports.errors.loadFailed', 'Failed to load templates')}
                    description={error}
                />
                <Button variant="outline" onClick={refetch} className="mx-auto flex">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('common.retry', 'Retry')}
                </Button>
            </div>
        );
    }

    // Only show templates from backend - no fallback synthetic templates
    if (!templates || templates.length === 0) {
        return (
            <EmptyState
                icon={FileBarChart}
                title={t('reports.templates.empty.title', 'No Templates Available')}
                description={t('reports.templates.empty.description', 'No report templates are currently available from the server.')}
            />
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {templates.map((template) => {
                // Defensive: skip templates with missing critical fields
                if (!template || !template.id || !template.name) {
                    return null;
                }
                
                const { icon: Icon, color } = getTemplateIcon(template.type || 'performance');
                
                return (
                    <div key={template.id} className="flex flex-col justify-between p-6 bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div>
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${color}`}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mb-6">{template.description}</p>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => onRun(template.id, template.name)}
                        >
                            {t('reports.actions.runNow', 'Run Now')}
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}

