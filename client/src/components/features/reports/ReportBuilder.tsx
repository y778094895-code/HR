import React, { useState } from 'react';
import { Button } from '@/components/ui/buttons/button';
import { Calendar as CalendarIcon, FileSpreadsheet, FileText, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { buildReportConfig } from '@/lib/reports';
import { ReportConfig } from '@/types/reports';

interface Props {
    onGenerate: (config: ReportConfig, templateName: string) => void;
}

export function ReportBuilder({ onGenerate }: Props) {
    const { t } = useTranslation();
    const [config, setConfig] = useState({
        type: 'performance',
        format: 'pdf' as 'pdf' | 'csv' | 'xlsx',
        dateRange: 'last90'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const reportConfig = buildReportConfig(
                config.type,
                config.format,
                config.dateRange
            );
            
            const templateName = getTemplateName(config.type);
            onGenerate(reportConfig, templateName);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTemplateName = (type: string): string => {
        const names: Record<string, string> = {
            'performance': 'Employee Performance Report',
            'attrition': 'Attrition Analysis Report',
            'turnover': 'Turnover Risk Report',
            'training': 'Training Effectiveness Report',
            'fairness': 'Fairness & Diversity Audit',
        };
        return names[type] || 'Custom Report';
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-card border rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-6">{t('reports.builder.title', 'Custom Report Builder')}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Data Source */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">{t('reports.builder.dataSource', 'Data Source')}</label>
                    <select
                        className="w-full p-2 border rounded-md bg-transparent"
                        value={config.type}
                        onChange={(e) => setConfig({ ...config, type: e.target.value })}
                    >
                        <option value="performance">{t('reports.types.performance', 'Employee Performance')}</option>
                        <option value="attrition">{t('reports.types.attrition', 'Attrition & Retention')}</option>
                        <option value="training">{t('reports.types.training', 'Training & Skills')}</option>
                        <option value="fairness">{t('reports.types.fairness', 'Demographics & Fairness')}</option>
                    </select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">{t('reports.builder.timePeriod', 'Time Period')}</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { value: 'last30', label: t('reports.dateRange.last30', 'Last 30 Days') },
                            { value: 'last90', label: t('reports.dateRange.last90', 'Last Quarter') },
                            { value: 'ytd', label: t('reports.dateRange.ytd', 'Year to Date') },
                        ].map((range) => (
                            <button
                                key={range.value}
                                type="button"
                                className={`p-2 text-sm border rounded-md flex items-center justify-center gap-2 transition-colors ${
                                    config.dateRange === range.value 
                                        ? 'bg-primary text-primary-foreground border-primary' 
                                        : 'hover:bg-accent'
                                }`}
                                onClick={() => setConfig({ ...config, dateRange: range.value })}
                            >
                                <CalendarIcon className="h-3 w-3" />
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Format */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">{t('reports.builder.exportFormat', 'Export Format')}</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div
                            className={`cursor-pointer p-4 border rounded-lg flex items-center gap-3 transition-colors ${
                                config.format === 'pdf' 
                                    ? 'border-primary bg-primary/5' 
                                    : 'hover:border-primary/50'
                            }`}
                            onClick={() => setConfig({ ...config, format: 'pdf' })}
                        >
                            <div className="p-2 rounded bg-red-100 text-red-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-medium">{t('reports.format.pdf', 'PDF Document')}</div>
                                <div className="text-xs text-muted-foreground">{t('reports.format.pdf.desc', 'Best for printing / sharing')}</div>
                            </div>
                        </div>

                        <div
                            className={`cursor-pointer p-4 border rounded-lg flex items-center gap-3 transition-colors ${
                                config.format === 'xlsx' || config.format === 'csv'
                                    ? 'border-primary bg-primary/5' 
                                    : 'hover:border-primary/50'
                            }`}
                            onClick={() => setConfig({ ...config, format: 'xlsx' })}
                        >
                            <div className="p-2 rounded bg-green-100 text-green-600">
                                <FileSpreadsheet className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-medium">{t('reports.format.excel', 'Excel / CSV')}</div>
                                <div className="text-xs text-muted-foreground">{t('reports.format.excel.desc', 'Best for data analysis')}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="rounded-md border bg-muted/30 p-4 text-sm flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">{t('reports.builder.asyncGeneration', 'Async Generation')}</p>
                        <p className="text-muted-foreground">
                            {t('reports.builder.asyncDesc', 'Large reports are generated in the background. You will receive a notification when ready for download.')}
                        </p>
                    </div>
                </div>

                <div className="pt-4">
                    <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? t('reports.builder.generating', 'Generating...') : t('reports.builder.generate', 'Generate Report')}
                    </Button>
                </div>
            </form>
        </div>
    );
}

