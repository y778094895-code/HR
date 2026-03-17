// ============================================================
// Data Quality Hook
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { dataQualityService } from '../services/resources/dataQuality.service';
import type {
    QualityIssue,
    QualitySummary,
    QualitySource,
    QualityIssueFilters,
    QualityScanResult,
    SourceHealth,
    QualityIssueStatus
} from '../types/dataQuality';

interface UseDataQualityReturn {
    // Data
    issues: QualityIssue[];
    summary: QualitySummary | null;
    sources: QualitySource[];
    sourceHealth: SourceHealth[];
    
    // State
    isLoading: boolean;
    isRefreshing: boolean;
    isScanning: boolean;
    error: string | null;
    scanResult: QualityScanResult | null;
    
    // Filters
    filters: QualityIssueFilters;
    setFilters: (filters: Partial<QualityIssueFilters>) => void;
    clearFilters: () => void;
    
    // Actions
    refresh: () => Promise<void>;
    triggerScan: () => Promise<void>;
    updateIssueStatus: (issueId: string, status: QualityIssueStatus) => Promise<void>;
    fetchSources: () => Promise<void>;
    fetchSourceHealth: (sourceId?: string) => Promise<void>;
}

const defaultFilters: QualityIssueFilters = {
    severity: 'all',
    status: 'all',
    category: 'all',
    sourceId: 'all',
    search: '',
    sortBy: 'severity',
    sortOrder: 'desc'
};

export function useDataQuality(): UseDataQualityReturn {
    const [issues, setIssues] = useState<QualityIssue[]>([]);
    const [summary, setSummary] = useState<QualitySummary | null>(null);
    const [sources, setSources] = useState<QualitySource[]>([]);
    const [sourceHealth, setSourceHealth] = useState<SourceHealth[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<QualityScanResult | null>(null);
    
    const [filters, setFiltersState] = useState<QualityIssueFilters>(defaultFilters);

    // Fetch quality issues
    const fetchIssues = useCallback(async () => {
        try {
            const data = await dataQualityService.getQualityIssues(filters);
            setIssues(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch quality issues:', err);
            setIssues([]);
        }
    }, [filters]);

    // Fetch summary
    const fetchSummary = useCallback(async () => {
        try {
            const data = await dataQualityService.getQualitySummary();
            setSummary(data);
        } catch (err) {
            console.error('Failed to fetch quality summary:', err);
            setSummary(null);
        }
    }, []);

    // Fetch sources
    const fetchSources = useCallback(async () => {
        try {
            const data = await dataQualityService.getQualitySources();
            setSources(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch sources:', err);
            setSources([]);
        }
    }, []);

    // Fetch source health
    const fetchSourceHealth = useCallback(async (sourceId?: string) => {
        try {
            const data = await dataQualityService.getSourceHealth(sourceId);
            setSourceHealth(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch source health:', err);
            setSourceHealth([]);
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([
                fetchIssues(),
                fetchSummary(),
                fetchSources()
            ]);
            setIsLoading(false);
        };
        
        loadData();
    }, [fetchIssues, fetchSummary, fetchSources]);

    // Refresh all data
    const refresh = useCallback(async () => {
        setIsRefreshing(true);
        await Promise.all([
            fetchIssues(),
            fetchSummary(),
            fetchSources()
        ]);
        setIsRefreshing(false);
    }, [fetchIssues, fetchSummary, fetchSources]);

    // Trigger scan
    const triggerScan = useCallback(async () => {
        setIsScanning(true);
        try {
            const result = await dataQualityService.triggerScan();
            setScanResult(result);
            // Refresh data after scan
            if (result) {
                await refresh();
            }
        } catch (err) {
            console.error('Failed to trigger scan:', err);
        } finally {
            setIsScanning(false);
        }
    }, [refresh]);

    // Update issue status
    const updateIssueStatus = useCallback(async (
        issueId: string, 
        status: QualityIssueStatus
    ) => {
        try {
            await dataQualityService.updateIssueStatus(issueId, status);
            // Update local state
            setIssues(prev => 
                prev.map(issue => 
                    issue.id === issueId 
                        ? { ...issue, status, updatedAt: new Date().toISOString() }
                        : issue
                )
            );
            // Refresh summary
            await fetchSummary();
        } catch (err) {
            console.error('Failed to update issue status:', err);
            throw err;
        }
    }, [fetchSummary]);

    // Set filters
    const setFilters = useCallback((newFilters: Partial<QualityIssueFilters>) => {
        setFiltersState(prev => ({ ...prev, ...newFilters }));
    }, []);

    // Clear filters
    const clearFilters = useCallback(() => {
        setFiltersState(defaultFilters);
    }, []);

    return {
        // Data
        issues,
        summary,
        sources,
        sourceHealth,
        
        // State
        isLoading,
        isRefreshing,
        isScanning,
        error,
        scanResult,
        
        // Filters
        filters,
        setFilters,
        clearFilters,
        
        // Actions
        refresh,
        triggerScan,
        updateIssueStatus,
        fetchSources,
        fetchSourceHealth
    };
}

export default useDataQuality;

