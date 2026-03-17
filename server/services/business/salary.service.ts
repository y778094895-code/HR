import { injectable, inject } from 'inversify';
import { ISalaryService } from '../interfaces/i-salary.service';
import { SalaryRepository } from '../../data/repositories/salary.repository';

/**
 * Salary service — institutional CRUD baseline.
 *
 * Computed fields (totalAllowances, totalDeductions, netSalary, totalEarnings)
 * are calculated at the service layer because Drizzle ORM does not support
 * DB-level GENERATED ALWAYS AS columns.
 *
 * Extension points:
 * - Payroll batch processing
 * - Salary structure templates
 * - Tax calculation rules by jurisdiction
 * - Integration with external payroll systems
 */
@injectable()
export class SalaryService implements ISalaryService {
    constructor(
        @inject('SalaryRepository') private salaryRepo: SalaryRepository
    ) { }

    async getSalaries(filters: any): Promise<any> {
        return this.salaryRepo.findWithEmployee({
            page: parseInt(filters.page) || 1,
            pageSize: parseInt(filters.pageSize) || 20,
            search: filters.search,
            department: filters.department,
            paymentStatus: filters.paymentStatus,
            salaryMonth: filters.salaryMonth,
        });
    }

    async getSalaryById(id: string): Promise<any> {
        const record = await this.salaryRepo.findById(id);
        if (!record) return null;
        return this.enrichWithComputed(record);
    }

    async getEmployeeSalaryHistory(employeeId: string): Promise<any> {
        const records = await this.salaryRepo.findByEmployee(employeeId);
        return records.map((r: any) => this.enrichWithComputed(r));
    }

    async createSalary(data: any): Promise<any> {
        // Validate uniqueness: one record per employee per month
        const existing = await this.salaryRepo.findByEmployeeAndMonth(
            data.employeeId,
            data.salaryMonth
        );
        if (existing) {
            throw new Error(`Salary record already exists for employee ${data.employeeId} for month ${data.salaryMonth}`);
        }

        const record = await this.salaryRepo.create({
            employeeId: data.employeeId,
            salaryMonth: data.salaryMonth,
            salaryStructure: data.salaryStructure || null,
            basicSalary: String(data.basicSalary),
            houseRentAllowance: String(data.houseRentAllowance || 0),
            conveyanceAllowance: String(data.conveyanceAllowance || 0),
            medicalAllowance: String(data.medicalAllowance || 0),
            specialAllowance: String(data.specialAllowance || 0),
            otherAllowances: String(data.otherAllowances || 0),
            professionalTax: String(data.professionalTax || 0),
            providentFund: String(data.providentFund || 0),
            incomeTax: String(data.incomeTax || 0),
            otherDeductions: String(data.otherDeductions || 0),
            bonus: String(data.bonus || 0),
            overtimePay: String(data.overtimePay || 0),
            incentives: String(data.incentives || 0),
            paymentDate: data.paymentDate || null,
            paymentStatus: data.paymentStatus || 'pending',
            paymentReference: data.paymentReference || null,
            remarks: data.remarks || null,
        });

        return this.enrichWithComputed(record);
    }

    async updateSalary(id: string, data: any): Promise<any> {
        const updatePayload: any = { updatedAt: new Date() };

        const allowedFields = [
            'salaryStructure', 'basicSalary', 'houseRentAllowance', 'conveyanceAllowance',
            'medicalAllowance', 'specialAllowance', 'otherAllowances', 'professionalTax',
            'providentFund', 'incomeTax', 'otherDeductions', 'bonus', 'overtimePay',
            'incentives', 'paymentDate', 'paymentStatus', 'paymentReference', 'remarks',
        ];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                // Numeric fields stored as strings in decimal columns
                const numericFields = [
                    'basicSalary', 'houseRentAllowance', 'conveyanceAllowance',
                    'medicalAllowance', 'specialAllowance', 'otherAllowances',
                    'professionalTax', 'providentFund', 'incomeTax', 'otherDeductions',
                    'bonus', 'overtimePay', 'incentives',
                ];
                updatePayload[field] = numericFields.includes(field) ? String(data[field]) : data[field];
            }
        }

        const record = await this.salaryRepo.update(id, updatePayload);
        return this.enrichWithComputed(record);
    }

    async deleteSalary(id: string): Promise<any> {
        return this.salaryRepo.delete(id);
    }

    /**
     * Computes derived fields that ARCHITECTURE.md specifies as GENERATED ALWAYS AS columns.
     * Implemented at service layer since Drizzle doesn't support generated columns.
     */
    private enrichWithComputed(record: any): any {
        if (!record) return record;

        const num = (v: any) => parseFloat(v) || 0;

        const totalAllowances = num(record.houseRentAllowance) + num(record.conveyanceAllowance) +
            num(record.medicalAllowance) + num(record.specialAllowance) + num(record.otherAllowances);

        const totalDeductions = num(record.professionalTax) + num(record.providentFund) +
            num(record.incomeTax) + num(record.otherDeductions);

        const netSalary = num(record.basicSalary) + totalAllowances - totalDeductions;

        const totalEarnings = netSalary + num(record.bonus) + num(record.overtimePay) + num(record.incentives);

        return {
            ...record,
            totalAllowances: totalAllowances.toFixed(2),
            totalDeductions: totalDeductions.toFixed(2),
            netSalary: netSalary.toFixed(2),
            totalEarnings: totalEarnings.toFixed(2),
        };
    }
}
