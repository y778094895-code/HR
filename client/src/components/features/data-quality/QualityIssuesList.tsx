// ============================================================
// Quality Issues List Component
// ============================================================

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    AlertTriangle, 
    CheckCircle2, 
    Clock, 
    Eye,
    EyeOff,
    Filter,
    RefreshCw,
    Search,
    XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/buttons/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/data-display/badge';
import { DataTable, ColumnDef } from '@/components/ui/data-display/DataTable';
import { Input } from '@/components/ui/input';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/forms/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/overlays/alert-dialog';
import { useDataQuality } from '@/hooks/useDataQuality';
import { useToast } from '@/hooks/use-toast';
import type { 
    QualityIssue, 
    QualitySeverity, 
    QualityIssueStatus,
    QualityIssueCategory 
} from '@/types/dataQuality';

interface QualityIssuesListProps {
    category?: QualityIssueCategory;
    showFilters?: boolean;
}

export function QualityIssuesList({ category, showFilters = true }: QualityIssuesListProps) {
    const { t } = useTranslation();
    const { 
        issues, 
        sources, 
        isLoading, 
        isRefreshing,
        filters, 
        setFilters, 
        clearFilters, 
        refresh,
        updateIssueStatus 
    } = useDataQuality();
    
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<QualityIssue | null>(null);
    const [actionType, setActionType] = useState<'resolve' | 'ignore' | 'acknowledge'>('resolve');
    const [isProcessing, setIsProcessing] = useState(false);

    // Filter issues by category if provided
    const filteredIssues = useMemo(() => {
        let result = issues;
        
        if (category) {
            result = result.filter(issue => issue.category === category);
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(issue => 
                issue.field.toLowerCase().includes(query) ||
                issue.description.toLowerCase().includes(query) ||
                issue.sourceName?.toLowerCase().includes(query)
            );
        }
        
        // Apply additional filters
        if (filters.severity && filters.severity !== 'all') {
            result = result.filter(issue => issue.severity === filters.severity);
        }
        
        if (filters.status && filters.status !== 'all') {
            result = result.filter(issue => issue.status === filters.status);
        }
        
        if (filters.sourceId && filters.sourceId !== 'all') {
            result = result.filter(issue => issue.sourceId === filters.sourceId);
        }
        
        return result;
    }, [issues, category, searchQuery, filters]);

    const getSeverityBadgeVariant = (severity: QualitySeverity): 'destructive' | 'secondary' | 'outline' | 'default' => {
        switch (severity) {
            case 'critical': return 'destructive';
            case 'high': return 'destructive';
            case 'medium': return 'secondary';
            case 'low': return 'outline';
            default: return 'outline';
        }
    };

    const getStatusBadgeVariant = (status: QualityIssueStatus): 'default' | 'secondary' | 'outline' | 'destructive' => {
        switch (status) {
            case 'open': return 'default';
            case 'acknowledged': return 'secondary';
            case 'resolved': return 'outline';
            case 'ignored': return 'outline';
            default: return 'outline';
        }
    };

    const getCategoryLabel = (cat: QualityIssueCategory): string => {
        const labels: Record<QualityIssueCategory, string> = {
            'missing_data': t('dataQuality.category.missingData', 'Missing Data'),
            'invalid_data': t('dataQuality.category.invalidData', 'Invalid Data'),
            'inconsistent_data': t('dataQuality.category.inconsistentData', 'Inconsistent Data'),
            'schema_mismatch': t('dataQuality.category.schemaMismatch', 'Schema Mismatch'),
            'duplicate': t('dataQuality.category.duplicate', 'Duplicate'),
            'stale_data': t('dataQuality.category.staleData', 'Stale Data')
        };
        return labels[cat] || cat;
    };

    const handleAction = (issue: QualityIssue, action: 'resolve' | 'ignore' | 'acknowledge') => {
        setSelectedIssue(issue);
        setActionType(action);
        setActionDialogOpen(true);
    };

    const confirmAction = async () => {
        if (!selectedIssue) return;
        
        setIsProcessing(true);
        try {
            let newStatus: QualityIssueStatus;
            switch (actionType) {
                case 'resolve': newStatus = 'resolved'; break;
                case 'ignore': newStatus = 'ignored'; break;
                case 'acknowledge': newStatus = 'acknowledged'; break;
            }
            
            await updateIssueStatus(selectedIssue.id, newStatus);
            
            toast({
                title: t('dataQuality.actionSuccess', 'Action Completed'),
                description: t(`dataQuality.statusChanged.${actionType}`, 
                    `Issue has been ${actionType}d successfully.`),
                variant: 'default',
            });
        } catch (error) {
            toast({
                title: t('dataQuality.actionFailed', 'Action Failed'),
                description: t('dataQuality.actionFailedDesc', 'Could not update issue status. Please try again.'),
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
            setActionDialogOpen(false);
            setSelectedIssue(null);
        }
    };

    const columns: ColumnDef<QualityIssue>[] = [
        {
            accessorKey: 'severity',
            header: t('dataQuality.severity', 'Severity'),
            cell: ({ row }) => (
                <Badge variant={getSeverityBadgeVariant(row.original.severity)}>
                    {t(`severity.${row.original.severity}`, row.original.severity)}
                </Badge>
            ),
            sortable: true
        },
        {
            accessorKey: 'field',
            header: t('dataQuality.field', 'Field'),
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.field}</div>
                    {row.original.table && (
                        <div className="text-xs text-muted-foreground">{row.original.table}</div>
                    )}
                </div>
            )
        },
        {
            accessorKey: 'description',
            header: t('dataQuality.description', 'Description'),
            cell: ({ row }) => (
                <div className="max-w-md truncate">{row.original.description}</div>
            )
        },
        {
            accessorKey: 'category',
            header: t('dataQuality.category', 'Category'),
            cell: ({ row }) => (
                <span className="text-sm">
                    {getCategoryLabel(row.original.category)}
                </span>
            )
        },
        {
            accessorKey: 'sourceName',
            header: t('dataQuality.source', 'Source'),
            cell: ({ row }) => (
                <span className="text-sm">{row.original.sourceName || '-'}</span>
            )
        },
        {
            accessorKey: 'affectedRows',
            header: t('dataQuality.affectedRows', 'Affected'),
            cell: ({ row }) => (
                <span className="font-mono">{row.original.affectedRows.toLocaleString()}</span>
            )
        },
        {
            accessorKey: 'status',
            header: t('dataQuality.status', 'Status'),
            cell: ({ row }) => (
                <Badge variant={getStatusBadgeVariant(row.original.status)}>
                    {t(`dataQuality.status.${row.original.status}`, row.original.status)}
                </Badge>
            )
        },
        {
            id: 'actions',
            header: t('dataQuality.actions', 'Actions'),
            cell: ({ row }) => {
                const issue = row.original;
                if (issue.status === 'resolved' || issue.status === 'ignored') {
                    return <span className="text-xs text-muted-foreground">{t('dataQuality.resolved', 'Resolved')}</span>;
                }
                
                return (
                    <div className="flex gap-1">
                        <Button 
                            size="sm" 
                            variant="ghost"
                            title={t('dataQuality.acknowledge', 'Acknowledge')}
                            onClick={() => handleAction(issue, 'acknowledge')}
                        >
                            <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                            size="sm" 
                            variant="ghost"
                            title={t('dataQuality.resolve', 'Resolve')}
                            onClick={() => handleAction(issue, 'resolve')}
                        >
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                        </Button>
                        <Button 
                            size="sm" 
                            variant="ghost"
                            title={t('dataQuality.ignore', 'Ignore')}
                            onClick={() => handleAction(issue, 'ignore')}
                        >
                            <EyeOff className="h-3 w-3 text-gray-500" />
                        </Button>
                    </div>
                );
            }
        }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const hasIssues = filteredIssues.length > 0;

    return (
        <div className="space-y-4">
            {/* Filters */}
            {showFilters && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                {t('dataQuality.filters', 'Filters')}
                            </CardTitle>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={refresh}
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                {t('common.refresh', 'Refresh')}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {/* Search */}
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t('dataQuality.searchPlaceholder', 'Search issues...')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            {/* Severity Filter */}
                            <Select
                                value={filters.severity}
                                onValueChange={(value) => setFilters({ severity: value as any })}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder={t('dataQuality.severity', 'Severity')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                                    <SelectItem value="critical">{t('severity.critical', 'Critical')}</SelectItem>
                                    <SelectItem value="high">{t('severity.high', 'High')}</SelectItem>
                                    <SelectItem value="medium">{t('severity.medium', 'Medium')}</SelectItem>
                                    <SelectItem value="low">{t('severity.low', 'Low')}</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Status Filter */}
                            <Select
                                value={filters.status}
                                onValueChange={(value) => setFilters({ status: value as any })}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder={t('dataQuality.status', 'Status')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                                    <SelectItem value="open">{t('dataQuality.status.open', 'Open')}</SelectItem>
                                    <SelectItem value="acknowledged">{t('dataQuality.status.acknowledged', 'Acknowledged')}</SelectItem>
                                    <SelectItem value="resolved">{t('dataQuality.status.resolved', 'Resolved')}</SelectItem>
                                    <SelectItem value="ignored">{t('dataQuality.status.ignored', 'Ignored')}</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Source Filter */}
                            <Select
                                value={filters.sourceId}
                                onValueChange={(value) => setFilters({ sourceId: value as any })}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder={t('dataQuality.source', 'Source')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                                    {sources.map((source) => (
                                        <SelectItem key={source.id} value={source.id}>
                                            {source.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Clear Filters */}
                            {(filters.severity !== 'all' || filters.status !== 'all' || filters.sourceId !== 'all' || searchQuery) && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => {
                                        clearFilters();
                                        setSearchQuery('');
                                    }}
                                >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    {t('common.clear', 'Clear')}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
                {t('dataQuality.showingResults', 'Showing {{count}} issues', { count: filteredIssues.length })}
            </div>

            {/* Issues Table */}
            {hasIssues ? (
                <Card>
                    <CardContent className="p-0">
                        <DataTable 
                            data={filteredIssues} 
                            columns={columns}
                        />
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                            {t('dataQuality.noIssuesFound.title', 'No Issues Found')}
                        </h3>
                        <p className="text-muted-foreground text-center">
                            {t('dataQuality.noIssuesFound.desc', 
                                category 
                                    ? `No ${getCategoryLabel(category)} issues found matching your criteria.`
                                    : 'No quality issues found. Your data is in good shape!')}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Action Confirmation Dialog */}
            <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {actionType === 'resolve' && t('dataQuality.dialog.resolveTitle', 'Resolve Issue')}
                            {actionType === 'ignore' && t('dataQuality.dialog.ignoreTitle', 'Ignore Issue')}
                            {actionType === 'acknowledge' && t('dataQuality.dialog.acknowledgeTitle', 'Acknowledge Issue')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionType === 'resolve' && t('dataQuality.dialog.resolveDesc', 
                                'Are you sure you want to mark this issue as resolved? This action will update the issue status.')}
                            {actionType === 'ignore' && t('dataQuality.dialog.ignoreDesc', 
                                'Are you sure you want to ignore this issue? It will be marked as ignored.')}
                            {actionType === 'acknowledge' && t('dataQuality.dialog.acknowledgeDesc', 
                                'Are you sure you want to acknowledge this issue?')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {selectedIssue && (
                        <div className="py-3">
                            <p className="font-medium">{selectedIssue.field}</p>
                            <p className="text-sm text-muted-foreground">{selectedIssue.description}</p>
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmAction}
                            disabled={isProcessing}
                            className={
                                actionType === 'resolve' ? 'bg-green-600 hover:bg-green-700' :
                                actionType === 'ignore' ? 'bg-gray-600 hover:bg-gray-700' :
                                'bg-blue-600 hover:bg-blue-700'
                            }
                        >
                            {isProcessing ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                actionType === 'resolve' && t('dataQuality.resolve', 'Resolve') ||
                                actionType === 'ignore' && t('dataQuality.ignore', 'Ignore') ||
                                actionType === 'acknowledge' && t('dataQuality.acknowledge', 'Acknowledge')
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default QualityIssuesList;

