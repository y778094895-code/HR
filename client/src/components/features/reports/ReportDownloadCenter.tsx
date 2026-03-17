import React from 'react';
import { DataTable, ColumnDef } from '@/components/ui/data-display/DataTable';
import { Button } from '@/components/ui/buttons/button';
import { Download, RefreshCw, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { useReportJobs, ReportJobDisplay } from '@/hooks/useReportJobs';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/ui/feedback/EmptyState';
import { reportsService } from '@/services/resources/reports.service';
import { formatDateTime, getStatusDisplay } from '@/lib/reports';

// Add id to job for DataTable compatibility
interface ReportJobWithId extends ReportJobDisplay {
    id: string;
}

export function ReportDownloadCenter() {
    const { t } = useTranslation();
    const { 
        jobs, 
        isLoading, 
        error, 
        isPolling,
        refreshJob, 
        removeJob,
        refreshAll 
    } = useReportJobs();

    // Add id field for DataTable - with defensive checks for malformed data
    const jobsWithId: ReportJobWithId[] = jobs.map(job => {
        if (!job || !job.jobId) {
            return null;
        }
        return {
            ...job,
            id: job.jobId,
            templateName: job.templateName || 'Unknown Report',
            format: job.format || 'pdf',
            status: job.status || 'pending',
            requestedAt: job.requestedAt || new Date().toISOString(),
            displayName: job.displayName || `${job.templateName || 'Unknown Report'} (${(job.format || 'pdf').toUpperCase()})`,
        };
    }).filter((j): j is ReportJobWithId => j !== null);

    // Handle download
    const handleDownload = async (job: ReportJobDisplay) => {
        if (job.status !== 'completed') return;
        
        try {
            const filename = `${job.templateName.replace(/\s+/g, '_')}_${job.jobId.slice(0, 8)}.${job.format.toLowerCase()}`;
            await reportsService.downloadReport(job.jobId, filename);
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    // Render status cell
    const renderStatus = (status: string) => {
        const { label, variant } = getStatusDisplay(status);
        
        const styles: Record<string, string> = {
            success: 'text-green-600',
            warning: 'text-blue-600', 
            error: 'text-red-600',
            default: 'text-gray-600',
        };
        
        const icons: Record<string, React.ReactNode> = {
            success: <span className="h-2 w-2 rounded-full bg-green-600" />,
            warning: <RefreshCw className="h-3 w-3 animate-spin" />,
            error: <AlertCircle className="h-3 w-3" />,
            default: <span className="h-2 w-2 rounded-full bg-gray-400" />,
        };
        
        return (
            <span className={`flex items-center gap-1 ${styles[variant] || styles.default}`}>
                {icons[variant] || icons.default}
                {label}
            </span>
        );
    };

    const columns: ColumnDef<ReportJobWithId>[] = [
        { 
            accessorKey: 'displayName', 
            header: t('reports.downloads.reportName', 'Report Name'),
        },
        { 
            accessorKey: 'format', 
            header: t('reports.downloads.format', 'Format'),
            cell: ({ row }) => (
                <span className="uppercase">{row.original.format}</span>
            ),
        },
        { 
            accessorKey: 'requestedAt', 
            header: t('reports.downloads.requestedAt', 'Requested At'),
            cell: ({ row }) => formatDateTime(row.original.requestedAt),
        },
        {
            accessorKey: 'status',
            header: t('reports.downloads.status', 'Status'),
            cell: ({ row }) => renderStatus(row.original.status),
        },
        {
            id: 'actions',
            header: t('reports.downloads.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={row.original.status !== 'completed'}
                        onClick={() => handleDownload(row.original)}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        {t('reports.downloads.download', 'Download')}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refreshJob(row.original.jobId)}
                        title={t('reports.downloads.refresh', 'Refresh status')}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeJob(row.original.jobId)}
                        title={t('reports.downloads.remove', 'Remove')}
                    >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                    </Button>
                </div>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span className="text-muted-foreground">{t('reports.downloads.loading', 'Loading jobs...')}</span>
            </div>
        );
    }

    if (error) {
        return (
            <EmptyState
                icon={AlertCircle}
                title={t('reports.errors.loadFailed', 'Failed to load jobs')}
                description={error}
                actionLabel={t('common.retry', 'Retry')}
                onAction={refreshAll}
            />
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in">
            {/* Info Banner */}
            <div className="rounded-md border bg-muted/30 p-4 text-sm flex items-start gap-3">
                <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                    <p className="font-semibold">{t('reports.downloads.asyncActive', 'Async Generation Active')}</p>
                    <p className="text-muted-foreground">
                        {t('reports.downloads.asyncDesc', 'Large reports are generated in the background. You can navigate away and come back here to download them.')}
                    </p>
                </div>
            </div>

            {/* Polling Indicator */}
            {isPolling && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    {t('reports.downloads.updating', 'Updating job statuses...')}
                </div>
            )}

            {/* Jobs Table or Empty State */}
            {jobsWithId.length === 0 ? (
                <EmptyState
                    icon={Clock}
                    title={t('reports.downloads.empty.title', 'No Report Jobs')}
                    description={t('reports.downloads.empty.desc', 'Generate a report from the Templates or Builder tab to see it here.')}
                />
            ) : (
                <DataTable
                    data={jobsWithId}
                    columns={columns}
                />
            )}
        </div>
    );
}

