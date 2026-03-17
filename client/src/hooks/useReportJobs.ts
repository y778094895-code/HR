// ============================================================
// Report Jobs Hook - Job Management with Polling
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { reportsService, ReportJob } from '@/services/resources/reports.service';
import { ReportConfig, ReportParameters } from '@/types/reports';

const STORAGE_KEY = 'hr_report_jobs';

interface StoredJob {
    jobId: string;
    templateId: string;
    templateName: string;
    format: string;
    parameters: ReportParameters;
    requestedAt: string;
}

function getStoredJobs(): StoredJob[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        
        const parsed = JSON.parse(stored);
        // Defensive: ensure we always return an array
        if (!Array.isArray(parsed)) return [];
        
        // Filter out malformed entries
        return parsed.filter((job): job is StoredJob => 
            job && typeof job === 'object' && typeof job.jobId === 'string' && typeof job.templateName === 'string'
        );
    } catch {
        return [];
    }
}

function saveJobToStorage(job: StoredJob): void {
    const jobs = getStoredJobs();
    // Keep last 20 jobs
    const updated = [job, ...jobs].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

function removeJobFromStorage(jobId: string): void {
    const jobs = getStoredJobs();
    const filtered = jobs.filter(j => j.jobId !== jobId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export interface ReportJobDisplay {
    jobId: string;
    templateName: string;
    format: string;
    parameters: ReportParameters;
    requestedAt: string;
    status: ReportJob['status'];
    progress?: number;
    error?: string;
    // Computed
    displayName: string;
}

interface UseReportJobsState {
    jobs: ReportJobDisplay[];
    isLoading: boolean;
    error: string | null;
    isPolling: boolean;
    submitReport: (config: ReportConfig, templateName: string) => Promise<string | null>;
    refreshJob: (jobId: string) => Promise<void>;
    removeJob: (jobId: string) => void;
    refreshAll: () => Promise<void>;
}

export function useReportJobs(): UseReportJobsState {
    const [jobs, setJobs] = useState<ReportJobDisplay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const pollingIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            pollingIntervals.current.forEach(interval => clearInterval(interval));
        };
    }, []);

    // Load stored jobs and hydrate statuses
    const loadJobs = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const stored = getStoredJobs();
            
            if (stored.length === 0) {
                setJobs([]);
                setIsLoading(false);
                return;
            }

            // Hydrate each job's status from backend
            const hydratedJobs: ReportJobDisplay[] = await Promise.all(
                stored.map(async (storedJob): Promise<ReportJobDisplay> => {
                    try {
                        const status = await reportsService.getReportStatus(storedJob.jobId);
                        // Defensive: handle malformed status response
                        const validStatuses = ['pending', 'processing', 'completed', 'failed'];
                        const safeStatus = status && validStatuses.includes(status.status) 
                            ? status.status 
                            : 'failed';
                        
                        return {
                            jobId: storedJob.jobId,
                            templateName: storedJob.templateName || 'Unknown Report',
                            format: storedJob.format || 'pdf',
                            parameters: storedJob.parameters || {},
                            requestedAt: storedJob.requestedAt || new Date().toISOString(),
                            status: safeStatus,
                            progress: status?.progress,
                            error: status?.error,
                            displayName: `${storedJob.templateName || 'Unknown Report'} (${(storedJob.format || 'pdf').toUpperCase()})`,
                        };
                    } catch {
                        // Backend unavailable - mark as unknown
                        return {
                            jobId: storedJob.jobId,
                            templateName: storedJob.templateName || 'Unknown Report',
                            format: storedJob.format || 'pdf',
                            parameters: storedJob.parameters || {},
                            requestedAt: storedJob.requestedAt || new Date().toISOString(),
                            status: 'failed' as const,
                            error: 'Unable to verify status',
                            displayName: `${storedJob.templateName || 'Unknown Report'} (${(storedJob.format || 'pdf').toUpperCase()})`,
                        };
                    }
                })
            );

            // Sort by requestedAt descending
            hydratedJobs.sort((a, b) => 
                new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
            );

            setJobs(hydratedJobs);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load jobs');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    // Submit a new report request
    const submitReport = useCallback(async (
        config: ReportConfig,
        templateName: string
    ): Promise<string | null> => {
        try {
            const result = await reportsService.requestReport(config);
            
            const storedJob: StoredJob = {
                jobId: result.jobId,
                templateId: config.templateId,
                templateName,
                format: config.format,
                parameters: config.parameters,
                requestedAt: new Date().toISOString(),
            };
            
            saveJobToStorage(storedJob);
            
            // Add to local state
            const newJob: ReportJobDisplay = {
                jobId: result.jobId,
                templateName,
                format: config.format,
                parameters: config.parameters,
                requestedAt: storedJob.requestedAt,
                status: result.status,
                progress: result.progress,
                displayName: `${templateName} (${config.format.toUpperCase()})`,
            };
            
            setJobs(prev => [newJob, ...prev]);
            
            // Start polling for this job
            startPolling(result.jobId);
            
            return result.jobId;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit report');
            return null;
        }
    }, []);

    // Refresh a single job's status
    const refreshJob = useCallback(async (jobId: string) => {
        try {
            const status = await reportsService.getReportStatus(jobId);
            
            // Defensive: validate status before using
            const validStatuses = ['pending', 'processing', 'completed', 'failed'];
            const safeStatus = status && validStatuses.includes(status.status) ? status.status : 'failed';
            
            setJobs(prev => prev.map(job => {
                if (job.jobId === jobId) {
                    return {
                        ...job,
                        status: safeStatus,
                        progress: status?.progress,
                        error: status?.error,
                    };
                }
                return job;
            }));

            // Stop polling if completed or failed
            if (safeStatus === 'completed' || safeStatus === 'failed') {
                stopPolling(jobId);
            }
        } catch (err) {
            console.error('Failed to refresh job:', jobId, err);
        }
    }, []);

    // Remove a job from storage
    const removeJob = useCallback((jobId: string) => {
        stopPolling(jobId);
        removeJobFromStorage(jobId);
        setJobs(prev => prev.filter(j => j.jobId !== jobId));
    }, []);

    // Refresh all jobs
    const refreshAll = useCallback(async () => {
        setIsPolling(true);
        await Promise.all(jobs.map(job => refreshJob(job.jobId)));
        setIsPolling(false);
    }, [jobs, refreshJob]);

    // Start polling for a specific job
    const startPolling = useCallback((jobId: string) => {
        // Clear existing interval if any
        if (pollingIntervals.current.has(jobId)) {
            clearInterval(pollingIntervals.current.get(jobId)!);
        }

        const interval = setInterval(() => {
            refreshJob(jobId);
        }, 3000); // Poll every 3 seconds

        pollingIntervals.current.set(jobId, interval);
        setIsPolling(true);
    }, [refreshJob]);

    // Stop polling for a specific job
    const stopPolling = useCallback((jobId: string) => {
        const interval = pollingIntervals.current.get(jobId);
        if (interval) {
            clearInterval(interval);
            pollingIntervals.current.delete(jobId);
        }
        
        // Check if any other jobs are still being polled
        if (pollingIntervals.current.size === 0) {
            setIsPolling(false);
        }
    }, []);

    return {
        jobs,
        isLoading,
        error,
        isPolling,
        submitReport,
        refreshJob,
        removeJob,
        refreshAll,
    };
}

