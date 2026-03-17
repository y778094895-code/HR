// ============================================================
// Reports Hook - Template Management
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { reportsService, ReportTemplateSummary } from '@/services/resources/reports.service';

interface UseReportsState {
    templates: ReportTemplateSummary[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useReports(): UseReportsState {
    const [templates, setTemplates] = useState<ReportTemplateSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await reportsService.getTemplates();
            setTemplates(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load templates');
            // Fallback to empty array if backend unavailable
            setTemplates([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    return {
        templates,
        isLoading,
        error,
        refetch: fetchTemplates,
    };
}

