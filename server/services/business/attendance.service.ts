import { injectable, inject } from 'inversify';
import { IAttendanceService } from '../interfaces/i-attendance.service';
import { AttendanceRepository } from '../../data/repositories/attendance.repository';

/**
 * Attendance service — institutional CRUD baseline.
 *
 * Extension points:
 * - Biometric device integration (source='biometric')
 * - Automatic work-minutes calculation from checkIn/checkOut
 * - Integration with leave management systems
 * - Overtime policy rules
 */
@injectable()
export class AttendanceService implements IAttendanceService {
    constructor(
        @inject('AttendanceRepository') private attendanceRepo: AttendanceRepository
    ) { }

    async getAttendanceRecords(filters: any): Promise<any> {
        return this.attendanceRepo.findWithEmployee({
            page: parseInt(filters.page) || 1,
            pageSize: parseInt(filters.pageSize) || 20,
            search: filters.search,
            department: filters.department,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            absenceType: filters.absenceType,
        });
    }

    async getAttendanceById(id: string): Promise<any> {
        return this.attendanceRepo.findById(id);
    }

    async getEmployeeAttendance(employeeId: string): Promise<any> {
        return this.attendanceRepo.findByEmployee(employeeId);
    }

    async createAttendance(data: any): Promise<any> {
        // Validate no duplicate for same employee + date
        const existing = await this.attendanceRepo.findByEmployeeAndDate(
            data.employeeId,
            data.date
        );
        if (existing) {
            throw new Error(`Attendance record already exists for employee ${data.employeeId} on ${data.date}`);
        }

        // Auto-compute workMinutes if checkIn and checkOut provided
        let workMinutes = data.workMinutes;
        if (!workMinutes && data.checkIn && data.checkOut) {
            const [inH, inM] = data.checkIn.split(':').map(Number);
            const [outH, outM] = data.checkOut.split(':').map(Number);
            workMinutes = (outH * 60 + outM) - (inH * 60 + inM);
            if (workMinutes < 0) workMinutes = 0;
        }

        return this.attendanceRepo.create({
            employeeId: data.employeeId,
            date: data.date,
            checkIn: data.checkIn || null,
            checkOut: data.checkOut || null,
            workMinutes: workMinutes || null,
            absenceType: data.absenceType || null,
            reason: data.reason || null,
            source: data.source || 'manual',
        });
    }

    async updateAttendance(id: string, data: any): Promise<any> {
        const updatePayload: any = {};

        const allowedFields = ['checkIn', 'checkOut', 'workMinutes', 'absenceType', 'reason', 'source'];
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updatePayload[field] = data[field] || null;
            }
        }

        // Re-compute workMinutes if check times are updated
        if ((data.checkIn || data.checkOut) && !data.workMinutes) {
            const existing = await this.attendanceRepo.findById(id);
            const checkIn = data.checkIn || existing?.checkIn;
            const checkOut = data.checkOut || existing?.checkOut;
            if (checkIn && checkOut) {
                const [inH, inM] = checkIn.split(':').map(Number);
                const [outH, outM] = checkOut.split(':').map(Number);
                const computed = (outH * 60 + outM) - (inH * 60 + inM);
                updatePayload.workMinutes = computed > 0 ? computed : 0;
            }
        }

        return this.attendanceRepo.update(id, updatePayload);
    }

    async deleteAttendance(id: string): Promise<any> {
        return this.attendanceRepo.delete(id);
    }
}
