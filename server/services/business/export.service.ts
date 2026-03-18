import { injectable } from 'inversify';
import { Response } from 'express';
import { db } from '../../data/database/connection';
import { employeesLocal } from '../../data/models/employees-local.schema';
import { goals } from '../../data/models/goals.schema';
import { eq } from 'drizzle-orm';

type ExportFormat = 'csv' | 'xlsx';

@injectable()
export class ExportService {

    /**
     * Stream employee + goals export to the HTTP response (T112).
     * For CSV: pure Node.js string formatting (no external dep).
     * For XLSX: requires `exceljs` — add `"exceljs": "^4.4.0"` to package.json when needed.
     */
    async exportEmployees(res: Response, format: ExportFormat = 'csv'): Promise<void> {
        const rows = await db
            .select({
                id: employeesLocal.id,
                fullName: employeesLocal.fullName,
                department: employeesLocal.department,
                designation: employeesLocal.designation,
                employmentStatus: employeesLocal.employmentStatus,
                dateOfJoining: employeesLocal.dateOfJoining,
            })
            .from(employeesLocal);

        if (format === 'csv') {
            return this._streamCsv(res, 'employees', rows);
        }
        return this._streamXlsx(res, 'employees', rows);
    }

    async exportGoals(res: Response, employeeId?: string, format: ExportFormat = 'csv'): Promise<void> {
        const query = db
            .select({
                id: goals.id,
                employeeId: goals.employeeId,
                title: goals.title,
                category: goals.category,
                weight: goals.weight,
                status: goals.status,
                dueDate: goals.dueDate,
            })
            .from(goals);

        const rows = employeeId
            ? await query.where(eq(goals.employeeId, employeeId))
            : await query;

        if (format === 'csv') {
            return this._streamCsv(res, 'goals', rows);
        }
        return this._streamXlsx(res, 'goals', rows);
    }

    // ── Stream helpers ────────────────────────────────────────────────────────

    private _streamCsv(res: Response, filename: string, rows: Record<string, any>[]): void {
        if (!rows.length) {
            res.status(204).end();
            return;
        }
        const headers = Object.keys(rows[0]);
        const escape = (v: any) => {
            const s = v == null ? '' : String(v);
            return s.includes(',') || s.includes('"') || s.includes('\n')
                ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const csvLines = [
            headers.join(','),
            ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
        ];

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        // Stream for large datasets: write in chunks of 500 rows
        const CHUNK = 500;
        for (let i = 0; i < csvLines.length; i += CHUNK) {
            res.write(csvLines.slice(i, i + CHUNK).join('\n') + '\n');
        }
        res.end();
    }

    private async _streamXlsx(res: Response, filename: string, rows: Record<string, any>[]): Promise<void> {
        let ExcelJS: any;
        try {
            ExcelJS = require('exceljs');
        } catch {
            // exceljs not installed — fall back to CSV
            return this._streamCsv(res, filename, rows);
        }

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(filename);

        if (rows.length) {
            sheet.columns = Object.keys(rows[0]).map((k) => ({ header: k, key: k }));
            sheet.addRows(rows);
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
        await workbook.xlsx.write(res);
        res.end();
    }
}
