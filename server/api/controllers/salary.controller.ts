import { Request, Response } from 'express';
import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { inject } from 'inversify';
import { ISalaryService } from '../../services/interfaces/i-salary.service';
import { ApiResponse } from '../../shared/api-response';

@controller('/salaries')
export class SalaryController {
    constructor(@inject('ISalaryService') private salaryService: ISalaryService) { }

    @httpGet('/')
    async getSalaries(req: Request, res: Response) {
        try {
            const result = await this.salaryService.getSalaries(req.query);
            res.json(ApiResponse.success(result));
        } catch (err: any) {
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }

    @httpGet('/:id')
    async getSalaryById(req: Request, res: Response) {
        try {
            const result = await this.salaryService.getSalaryById(req.params.id);
            if (!result) {
                return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Salary record not found'));
            }
            res.json(ApiResponse.success(result));
        } catch (err: any) {
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }

    @httpGet('/employee/:employeeId')
    async getEmployeeSalaryHistory(req: Request, res: Response) {
        try {
            const result = await this.salaryService.getEmployeeSalaryHistory(req.params.employeeId);
            res.json(ApiResponse.success(result));
        } catch (err: any) {
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }

    @httpPost('/')
    async createSalary(req: Request, res: Response) {
        try {
            // Validate required fields
            const { employeeId, salaryMonth, basicSalary } = req.body;
            if (!employeeId || !salaryMonth || basicSalary === undefined) {
                return res.status(400).json(ApiResponse.error(
                    'VALIDATION_ERROR',
                    'employeeId, salaryMonth, and basicSalary are required'
                ));
            }
            if (isNaN(parseFloat(basicSalary)) || parseFloat(basicSalary) < 0) {
                return res.status(400).json(ApiResponse.error(
                    'VALIDATION_ERROR',
                    'basicSalary must be a non-negative number'
                ));
            }

            const result = await this.salaryService.createSalary(req.body);
            res.status(201).json(ApiResponse.success(result, 'Salary record created'));
        } catch (err: any) {
            if (err.message?.includes('already exists')) {
                return res.status(409).json(ApiResponse.error('CONFLICT', err.message));
            }
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }

    @httpPut('/:id')
    async updateSalary(req: Request, res: Response) {
        try {
            const result = await this.salaryService.updateSalary(req.params.id, req.body);
            if (!result) {
                return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Salary record not found'));
            }
            res.json(ApiResponse.success(result, 'Salary record updated'));
        } catch (err: any) {
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }

    @httpDelete('/:id')
    async deleteSalary(req: Request, res: Response) {
        try {
            const result = await this.salaryService.deleteSalary(req.params.id);
            if (!result) {
                return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Salary record not found'));
            }
            res.json(ApiResponse.success(result, 'Salary record deleted'));
        } catch (err: any) {
            res.status(500).json(ApiResponse.error('INTERNAL_ERROR', err.message));
        }
    }
}
