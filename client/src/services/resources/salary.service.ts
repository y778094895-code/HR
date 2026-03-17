import { apiClient } from '../api/client';
import { normalizeKeys } from '../api/normalizers';

export interface SalaryRecord {
    id: string;
    employeeId: string;
    employeeName?: string;
    department?: string;
    salaryMonth: string;
    salaryStructure?: string;
    basicSalary: string;
    houseRentAllowance: string;
    conveyanceAllowance: string;
    medicalAllowance: string;
    specialAllowance: string;
    otherAllowances: string;
    professionalTax: string;
    providentFund: string;
    incomeTax: string;
    otherDeductions: string;
    bonus: string;
    overtimePay: string;
    incentives: string;
    totalAllowances?: string;
    totalDeductions?: string;
    netSalary?: string;
    totalEarnings?: string;
    paymentDate?: string;
    paymentStatus: string;
    paymentReference?: string;
    remarks?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SalaryListResponse {
    items: SalaryRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

class SalaryService {
    async getSalaries(params?: Record<string, any>): Promise<SalaryListResponse> {
        const raw = await apiClient.get<unknown>('/salaries', { params });
        return normalizeKeys<SalaryListResponse>(raw);
    }

    async getSalaryById(id: string): Promise<SalaryRecord> {
        const raw = await apiClient.get<unknown>(`/salaries/${id}`);
        return normalizeKeys<SalaryRecord>(raw);
    }

    async getEmployeeSalaryHistory(employeeId: string): Promise<SalaryRecord[]> {
        const raw = await apiClient.get<unknown>(`/salaries/employee/${employeeId}`);
        return normalizeKeys<SalaryRecord[]>(raw);
    }

    async createSalary(data: Partial<SalaryRecord>): Promise<SalaryRecord> {
        const raw = await apiClient.post<unknown>('/salaries', data);
        return normalizeKeys<SalaryRecord>(raw);
    }

    async updateSalary(id: string, data: Partial<SalaryRecord>): Promise<SalaryRecord> {
        const raw = await apiClient.put<unknown>(`/salaries/${id}`, data);
        return normalizeKeys<SalaryRecord>(raw);
    }

    async deleteSalary(id: string): Promise<void> {
        return apiClient.delete(`/salaries/${id}`);
    }
}

export const salaryService = new SalaryService();
export default salaryService;
