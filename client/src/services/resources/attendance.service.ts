import { apiClient } from '../api/client';
import { normalizeKeys } from '../api/normalizers';

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeName?: string;
    department?: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    workMinutes?: number;
    absenceType?: string;
    reason?: string;
    source: string;
    createdAt: string;
}

export interface AttendanceListResponse {
    items: AttendanceRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

class AttendanceService {
    async getAttendanceRecords(params?: Record<string, any>): Promise<AttendanceListResponse> {
        const raw = await apiClient.get<unknown>('/attendance', { params });
        return normalizeKeys<AttendanceListResponse>(raw);
    }

    async getAttendanceById(id: string): Promise<AttendanceRecord> {
        const raw = await apiClient.get<unknown>(`/attendance/${id}`);
        return normalizeKeys<AttendanceRecord>(raw);
    }

    async getEmployeeAttendance(employeeId: string): Promise<AttendanceRecord[]> {
        const raw = await apiClient.get<unknown>(`/attendance/employee/${employeeId}`);
        return normalizeKeys<AttendanceRecord[]>(raw);
    }

    async createAttendance(data: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
        const raw = await apiClient.post<unknown>('/attendance', data);
        return normalizeKeys<AttendanceRecord>(raw);
    }

    async updateAttendance(id: string, data: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
        const raw = await apiClient.put<unknown>(`/attendance/${id}`, data);
        return normalizeKeys<AttendanceRecord>(raw);
    }

    async deleteAttendance(id: string): Promise<void> {
        return apiClient.delete(`/attendance/${id}`);
    }
}

export const attendanceService = new AttendanceService();
export default attendanceService;
