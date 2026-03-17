// ============================================================
// Data Quality Overview Component
// ============================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Database, 
    AlertTriangle, 
    CheckCircle2, 
    Clock,
    RefreshCw,
    TrendingUp,
    Activity
} from 'lucide-react';
import { Button } from '@/components/ui/buttons/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/data-display/badge';
import { useDataQuality } from '@/hooks/useDataQuality';
import type { QualitySeverity } from '@/types/dataQuality';

interface QualityOverviewProps {
    onRefresh?: () => void;
}

export function QualityOverview({ onRefresh }: QualityOverviewProps) {
    const { t } = useTranslation();
    const { summary, sources, isLoading, isRefreshing, isScanning, triggerScan } = useDataQuality();

    const getSeverityColor = (severity: QualitySeverity): string => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-50';
            case 'high': return 'text-orange-600 bg-orange-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getHealthColor = (score: number): string => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return t('dataQuality.never', 'Never');
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const hasData = summary && (summary.totalIssues > 0 || summary.sources.length > 0);

    if (!hasData) {
        return (
            <div className="space-y-6">
                {/* Empty state - Limited Data */}
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Database className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                            {t('dataQuality.limitedData.title', 'Limited Data Available')}
                        </h3>
                        <p className="text-muted-foreground text-center max-w-md mb-4">
                            {t('dataQuality.limitedData.description', 
                                'Data quality scanning is available but no issues have been detected yet. Run a scan to check for data quality issues.')}
                        </p>
                        <Button 
                            onClick={triggerScan} 
                            disabled={isScanning}
                            className="flex items-center gap-2"
                        >
                            {isScanning ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Activity className="h-4 w-4" />
                            )}
                            {t('dataQuality.runScan', 'Run Quality Scan')}
                        </Button>
                    </CardContent>
                </Card>

                {/* Default sources display - showing fallback/default state */}
                <div>
                    <h3 className="text-lg font-medium mb-4">
                        {t('dataQuality.dataSources', 'Data Sources')}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        {t('dataQuality.defaultSourcesNote', 'Default configuration. Run a scan to detect actual issues.')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sources.map((source) => (
                            <Card key={source.id}>
                                <CardContent className="pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{source.name}</span>
                                        <Badge variant="outline" className="text-muted-foreground">
                                            {t('dataQuality.default', 'Default')}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('dataQuality.noIssues', 'No issues detected')}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Completion Rate */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            {t('dataQuality.completionRate', 'Data Completion Rate')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${getHealthColor(summary?.completionRate || 0)}`}>
                            {(summary?.completionRate ?? 0).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('dataQuality.lastUpdated', 'Last updated')}: {formatDate(summary?.lastScanDate)}
                        </p>
                    </CardContent>
                </Card>

                {/* Critical Issues */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            {t('dataQuality.criticalIssues', 'Critical Issues')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">
                            {summary.criticalIssues}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('dataQuality.openIssues', 'Open issues requiring attention')}
                        </p>
                    </CardContent>
                </Card>

                {/* Open Issues */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {t('dataQuality.openIssues', 'Open Issues')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">
                            {summary.openIssues}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('dataQuality.awaitingAction', 'Awaiting action')}
                        </p>
                    </CardContent>
                </Card>

                {/* Resolved */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            {t('dataQuality.resolvedIssues', 'Resolved Issues')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            {summary.resolvedIssues}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('dataQuality.issuesFixed', 'Issues fixed')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Severity Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        {t('dataQuality.issuesBySeverity', 'Issues by Severity')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <div className={`px-4 py-2 rounded-lg ${getSeverityColor('critical')}`}>
                            <span className="font-bold">{summary.criticalIssues}</span>
                            <span className="text-sm mr-2">{t('severity.critical', 'Critical')}</span>
                        </div>
                        <div className={`px-4 py-2 rounded-lg ${getSeverityColor('high')}`}>
                            <span className="font-bold">{summary.highIssues}</span>
                            <span className="text-sm mr-2">{t('severity.high', 'High')}</span>
                        </div>
                        <div className={`px-4 py-2 rounded-lg ${getSeverityColor('medium')}`}>
                            <span className="font-bold">{summary.mediumIssues}</span>
                            <span className="text-sm mr-2">{t('severity.medium', 'Medium')}</span>
                        </div>
                        <div className={`px-4 py-2 rounded-lg ${getSeverityColor('low')}`}>
                            <span className="font-bold">{summary.lowIssues}</span>
                            <span className="text-sm mr-2">{t('severity.low', 'Low')}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Sources Health */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">
                        {t('dataQuality.sourceHealth', 'Source Health Status')}
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {t('common.refresh', 'Refresh')}
                        </Button>
                        <Button 
                            size="sm" 
                            onClick={triggerScan}
                            disabled={isScanning}
                        >
                            <Activity className="h-4 w-4 mr-2" />
                            {isScanning ? t('dataQuality.scanning', 'Scanning...') : t('dataQuality.runScan', 'Run Scan')}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(summary?.sources || []).map((source) => (
                            <div 
                                key={source.id} 
                                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Database className="h-5 w-5 text-muted-foreground" />
                                        <span className="font-medium">{source.name}</span>
                                    </div>
                                    <Badge 
                                        variant={
                                            (source.healthScore ?? 100) >= 90 ? 'default' :
                                            (source.healthScore ?? 100) >= 70 ? 'secondary' : 
                                            'destructive'
                                        }
                                    >
                                        {source.healthScore ?? 100}%
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>{source.issueCount ?? 0} {t('dataQuality.issues', 'issues')}</span>
                                    <span>{t('dataQuality.lastCheck', 'Checked')}: {formatDate(source.lastChecked)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
