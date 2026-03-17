import { createStore } from '../base/base.store';
import { employeeService } from '../../services/resources/employee.service';
import { Employee } from '../../types/users';
import { ApiParams } from '../../services/api/types';
import { ApiClientError } from '../../services/api/client';

interface EmployeeState {
    employees: Employee[];
    total: number;
    loading: boolean;
    error: string | null;
    params: ApiParams;
    selectedEmployee: Employee | null;
}

const initialState: EmployeeState = {
    employees: [],
    total: 0,
    loading: false,
    error: null,
    params: { page: 1, pageSize: 10 },
    selectedEmployee: null,
};

export const useEmployeeStore = createStore<EmployeeState, any>(
    {
        name: 'employee',
        initial: initialState,
        persist: false,
    },
    (set, get) => ({
        set: (data: Partial<EmployeeState>) => set(data),
        reset: () => set(initialState),

        fetchEmployees: async (params?: ApiParams) => {
            set({ loading: true, error: null });
            try {
                const currentParams = { ...get().params, ...params };
                const response = await employeeService.getEmployees(currentParams);
                set({
                    employees: response.data || [],
                    total: response.pagination?.total || 0,
                    params: currentParams,
                    loading: false,
                });
            } catch (error: any) {
                const apiError = error as ApiClientError;
                set({
                    error: apiError.message || 'Failed to fetch employees',
                    loading: false,
                });
            }
        },

        deleteEmployee: async (id: string) => {
            set({ loading: true, error: null });
            try {
                await employeeService.deleteEmployee(id);
                // Refresh list after delete
                await get().fetchEmployees();
            } catch (error: any) {
                const apiError = error as ApiClientError;
                set({
                    error: apiError.message || 'Failed to delete employee',
                    loading: false,
                });
                throw apiError; // Re-throw to let hook handle UI feedback (toast)
            }
        },

        setSelectedEmployee: (employee: Employee | null) => {
            set({ selectedEmployee: employee });
        },

        updateParams: (newParams: Partial<ApiParams>) => {
            const currentParams = get().params;
            const updatedParams = { ...currentParams, ...newParams };
            // If params explicitly changed, fetch immediately
            if (JSON.stringify(currentParams) !== JSON.stringify(updatedParams)) {
                get().fetchEmployees(newParams);
            }
        }
    })
);
