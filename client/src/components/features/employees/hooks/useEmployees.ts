import { useEffect } from 'react';
import { useEmployeeStore } from '@/stores/business/employee.store';
import { useToast } from '@/hooks/use-toast';
import { ApiParams } from '@/services/api/types';

export const useEmployees = (initialParams: ApiParams = { page: 1, pageSize: 10 }) => {
    const {
        employees,
        total,
        loading,
        error,
        params,
        fetchEmployees,
        updateParams,
        deleteEmployee: deleteAction
    } = useEmployeeStore();

    const { toast } = useToast();

    useEffect(() => {
        // Initial fetch if empty or params mismatch
        // Note: The store might have data from previous navigation. 
        // We might want to force fetch or check if we need to.
        // For now, let's fetch if we don't have employees or if we want to ensure freshness.
        // Or better, let the store handle it. The store action updates state.
        fetchEmployees(initialParams);
    }, []); // Run once on mount

    // Sync error with toast
    useEffect(() => {
        if (error) {
            toast({
                title: 'Error',
                description: error,
                variant: 'destructive',
            });
        }
    }, [error, toast]);

    const handleDelete = async (id: string) => {
        try {
            await deleteAction(id);
            toast({ title: 'Success', description: 'Employee deleted successfully' });
        } catch (err: any) {
            // Error is already set in store and handled by useEffect above for error display
            // But we might want specific toast here if needed.
            // The store sets error string.
        }
    };

    return {
        employees,
        total,
        loading,
        error,
        params,
        updateParams,
        refresh: fetchEmployees,
        deleteEmployee: handleDelete,
    };
};

export default useEmployees;
