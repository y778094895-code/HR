import { apiGet } from '../api';

export const impactApi = {
    getOverview: async (params?: any) => {
        const query = params ? `?${new URLSearchParams(params).toString()}` : '';
        return apiGet<any>(`/impact/overview${query}`);
    },
    getEmployeeImpact: async (employeeId: string, params?: any) => {
        const query = params ? `?${new URLSearchParams(params).toString()}` : '';
        return apiGet<any>(`/impact/employee/${employeeId}${query}`);
    },
    getDepartmentImpact: async (department: string, params?: any) => {
        const query = params ? `?${new URLSearchParams(params).toString()}` : '';
        return apiGet<any>(`/impact/department/${department}${query}`);
    }
};
