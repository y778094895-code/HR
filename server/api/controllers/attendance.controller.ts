import { Request, Response } from 'express';
import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { inject } from 'inversify';
import { IAttendanceService } from '../../services/interfaces/i-attendance.service';
import { ApiResponse } from '../../shared/api-response';

@controller('/attendance')
export class AttendanceController {
    constructor(@inject('IAttendanceService') private attendanceService: IAttendanceService) { }

    @httpGet('/')
    async getAttendanceRecords(req: Request, res: Response) {
        try {
            const result = await this.attendanceService.getAttendanceRecords(req.query);
            res.json(ApiResponse.success(result));
        } catch (err: any) {
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }

    @httpGet('/:id')
    async getAttendanceById(req: Request, res: Response) {
        try {
            const result = await this.attendanceService.getAttendanceById(req.params.id);
            if (!result) {
                return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Attendance record not found'));
            }
            res.json(ApiResponse.success(result));
        } catch (err: any) {
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }

    @httpGet('/employee/:employeeId')
    async getEmployeeAttendance(req: Request, res: Response) {
        try {
            const result = await this.attendanceService.getEmployeeAttendance(req.params.employeeId);
            res.json(ApiResponse.success(result));
        } catch (err: any) {
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }

    @httpPost('/')
    async createAttendance(req: Request, res: Response) {
        try {
            const { employeeId, date } = req.body;
            if (!employeeId || !date) {
                return res.status(400).json(ApiResponse.error(
                    'VALIDATION_ERROR',
                    'employeeId and date are required'
                ));
            }

            const result = await this.attendanceService.createAttendance(req.body);
            res.status(201).json(ApiResponse.success(result, 'Attendance record created'));
        } catch (err: any) {
            if (err.message?.includes('already exists')) {
                return res.status(409).json(ApiResponse.error('CONFLICT', err.message));
            }
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }

    @httpPut('/:id')
    async updateAttendance(req: Request, res: Response) {
        try {
            const result = await this.attendanceService.updateAttendance(req.params.id, req.body);
            if (!result) {
                return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Attendance record not found'));
            }
            res.json(ApiResponse.success(result, 'Attendance record updated'));
        } catch (err: any) {
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }

    @httpDelete('/:id')
    async deleteAttendance(req: Request, res: Response) {
        try {
            const result = await this.attendanceService.deleteAttendance(req.params.id);
            if (!result) {
                return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Attendance record not found'));
            }
            res.json(ApiResponse.success(result, 'Attendance record deleted'));
        } catch (err: any) {
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }
}
