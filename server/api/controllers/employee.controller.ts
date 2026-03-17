import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { inject } from 'inversify';
import { eq, ilike, or, and, desc, count, SQL } from 'drizzle-orm';
import { db } from '../../data/database/connection';
import { employeesLocal } from '../../data/models/employees-local.schema';
import { hrDepartments, hrDesignations } from '../../data/models/hr-master.schema';
import { turnoverRisk } from '../../data/models/turnover-risk.schema';
import { perfAssessments, perfCycles, perfKpiScores } from '../../data/models/performance.schema';
import { ApiResponse } from '../../shared/api-response';
import { requireRole } from '../middleware/rbac.middleware';
import { OutboxService } from '../../shared/infrastructure/outbox.service';

@controller('/employees')
export class EmployeeController {
    constructor(
        @inject('OutboxService') private outboxService: OutboxService
    ) {}

    // ─── GET /employees ───────────────────────────────────────────────────────

    @httpGet('/', requireRole('EMPLOYEE'))
    async getAllEmployees(req: Request, res: Response, next: NextFunction) {
        try {
            const correlationId = (req as any).correlationId;
            const { search, department, status } = req.query as Record<string, string>;
            const page     = Math.max(1,   parseInt(req.query.page     as string) || 1);
            const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 10));
            const offset   = (page - 1) * pageSize;

            // Dynamic WHERE conditions
            const conditions: SQL[] = [];
            if (search) {
                conditions.push(
                    or(
                        ilike(employeesLocal.fullName,     `%${search}%`),
                        ilike(employeesLocal.email,        `%${search}%`),
                        ilike(employeesLocal.employeeCode, `%${search}%`),
                    )!,
                );
            }
            if (department) conditions.push(eq(employeesLocal.department, department));
            if (status)     conditions.push(eq(employeesLocal.employmentStatus, status));

            const where = conditions.length > 0 ? and(...conditions) : undefined;

            // Count (no limit/offset)
            const [{ total }] = await db
                .select({ total: count() })
                .from(employeesLocal)
                .where(where);

            // Data with JOINs
            const rows = await db
                .select({
                    id:               employeesLocal.id,
                    employeeCode:     employeesLocal.employeeCode,
                    fullName:         employeesLocal.fullName,
                    email:            employeesLocal.email,
                    phone:            employeesLocal.phone,
                    department:       employeesLocal.department,
                    designation:      employeesLocal.designation,
                    departmentId:     employeesLocal.departmentId,
                    designationId:    employeesLocal.designationId,
                    managerId:        employeesLocal.managerId,
                    dateOfJoining:    employeesLocal.dateOfJoining,
                    gender:           employeesLocal.gender,
                    employmentType:   employeesLocal.employmentType,
                    employmentStatus: employeesLocal.employmentStatus,
                    salary:           employeesLocal.salary,
                    location:         employeesLocal.location,
                })
                .from(employeesLocal)
                .leftJoin(hrDepartments,  eq(employeesLocal.departmentId,  hrDepartments.id))
                .leftJoin(hrDesignations, eq(employeesLocal.designationId, hrDesignations.id))
                .where(where)
                .orderBy(employeesLocal.fullName)
                .limit(pageSize)
                .offset(offset);

            const totalNum = Number(total);
            const data = rows.map(row => ({ ...row, riskScore: 0 }));

            res.json(ApiResponse.success(data, 'Success', {
                pagination: {
                    total:      totalNum,
                    page,
                    pageSize,
                    totalPages: Math.ceil(totalNum / pageSize),
                },
                correlationId,
            }));
        } catch (error) {
            next(error);
        }
    }

    // ─── GET /employees/:id/performance ───────────────────────────────────────
    // Must be declared before /:id to avoid ambiguity in some frameworks.

    @httpGet('/:id/performance', requireRole('EMPLOYEE'))
    async getEmployeePerformance(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const correlationId = (req as any).correlationId;

            // Verify employee exists
            const [employee] = await db
                .select({ id: employeesLocal.id })
                .from(employeesLocal)
                .where(eq(employeesLocal.id, id))
                .limit(1);

            if (!employee) {
                return res.status(404).json(
                    ApiResponse.error('NOT_FOUND', 'Employee not found', undefined, { correlationId }),
                );
            }

            // All assessments joined with their cycle
            const assessments = await db
                .select({
                    id:              perfAssessments.id,
                    cycleId:         perfAssessments.cycleId,
                    score:           perfAssessments.score,
                    measurementType: perfAssessments.measurementType,
                    submittedBy:     perfAssessments.submittedBy,
                    submittedAt:     perfAssessments.submittedAt,
                    createdAt:       perfAssessments.createdAt,
                    cycle: {
                        name:        perfCycles.name,
                        periodStart: perfCycles.periodStart,
                        periodEnd:   perfCycles.periodEnd,
                        status:      perfCycles.status,
                    },
                })
                .from(perfAssessments)
                .leftJoin(perfCycles, eq(perfAssessments.cycleId, perfCycles.id))
                .where(eq(perfAssessments.employeeId, id))
                .orderBy(desc(perfAssessments.createdAt));

            // Attach KPI scores per assessment
            const data = await Promise.all(
                assessments.map(async (assessment) => {
                    const kpiScores = await db
                        .select({
                            id:        perfKpiScores.id,
                            kpiCode:   perfKpiScores.kpiCode,
                            value:     perfKpiScores.value,
                            weight:    perfKpiScores.weight,
                            metadata:  perfKpiScores.metadata,
                            createdAt: perfKpiScores.createdAt,
                        })
                        .from(perfKpiScores)
                        .where(eq(perfKpiScores.assessmentId, assessment.id));

                    return { ...assessment, kpiScores };
                }),
            );

            res.json(ApiResponse.success(data, 'Success', { correlationId }));
        } catch (error) {
            next(error);
        }
    }

    // ─── GET /employees/:id ───────────────────────────────────────────────────

    @httpGet('/:id', requireRole('EMPLOYEE'))
    async getEmployeeById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const correlationId = (req as any).correlationId;

            const [employee] = await db
                .select()
                .from(employeesLocal)
                .where(eq(employeesLocal.id, id))
                .limit(1);

            if (!employee) {
                return res.status(404).json(
                    ApiResponse.error('NOT_FOUND', 'Employee not found', undefined, { correlationId }),
                );
            }

            // Latest turnover risk record
            const [latestRisk] = await db
                .select()
                .from(turnoverRisk)
                .where(eq(turnoverRisk.employeeId, id))
                .orderBy(desc(turnoverRisk.createdAt))
                .limit(1);

            // Latest perf assessment score
            const [latestAssessment] = await db
                .select({ score: perfAssessments.score })
                .from(perfAssessments)
                .where(eq(perfAssessments.employeeId, id))
                .orderBy(desc(perfAssessments.createdAt))
                .limit(1);

            const data = {
                ...employee,
                riskScore:          latestRisk ? Number(latestRisk.riskScore) : 0,
                latestTurnoverRisk: latestRisk  ?? null,
                latestPerfScore:    latestAssessment ? Number(latestAssessment.score) : null,
            };

            res.json(ApiResponse.success(data, 'Success', { correlationId }));
        } catch (error) {
            next(error);
        }
    }

    // ─── POST /employees ──────────────────────────────────────────────────────

    @httpPost('/', requireRole('MANAGER'))
    async createEmployee(req: Request, res: Response, next: NextFunction) {
        try {
            const correlationId = (req as any).correlationId;
            const {
                employeeCode, fullName, email, phone,
                department, designation, dateOfJoining,
                gender, employmentType, salary, location,
                erpnextId,
            } = req.body ?? {};

            if (!employeeCode || !fullName || !email || !dateOfJoining) {
                return res.status(400).json(ApiResponse.error(
                    'VALIDATION_ERROR',
                    'employeeCode, fullName, email, and dateOfJoining are required',
                    undefined,
                    { correlationId },
                ));
            }

            // Resolve department FK
            let departmentId: string | null = null;
            if (department) {
                const [dept] = await db
                    .select({ id: hrDepartments.id })
                    .from(hrDepartments)
                    .where(eq(hrDepartments.name, department))
                    .limit(1);
                departmentId = dept?.id ?? null;
            }

            // Resolve designation FK
            let designationId: string | null = null;
            if (designation) {
                const [desig] = await db
                    .select({ id: hrDesignations.id })
                    .from(hrDesignations)
                    .where(eq(hrDesignations.name, designation))
                    .limit(1);
                designationId = desig?.id ?? null;
            }

            const [created] = await db.insert(employeesLocal).values({
                erpnextId:        erpnextId ?? `LOCAL-${employeeCode}`,
                employeeCode,
                fullName,
                email,
                phone:            phone ?? null,
                department:       department ?? null,
                designation:      designation ?? null,
                departmentId,
                designationId,
                dateOfJoining,
                gender:           gender ?? null,
                employmentType:   employmentType ?? null,
                salary:           salary ?? null,
                location:         location ?? null,
                employmentStatus: 'active',
                syncStatus:       'local',
            }).returning();

            // Fire outbox event (non-blocking)
            this.outboxService.storeEvent('employee', 'employee.created', {
                employeeId: created.id,
                ...created,
            }).catch(() => { /* outbox failures are non-fatal */ });

            return res.status(201).json(
                ApiResponse.success(created, 'Employee created successfully', { correlationId }),
            );
        } catch (error: any) {
            // Unique constraint violation (employee_code or email duplicate)
            if (error?.code === '23505') {
                return res.status(409).json(ApiResponse.error(
                    'CONFLICT',
                    'An employee with this code or email already exists',
                    undefined,
                    { correlationId: (req as any).correlationId },
                ));
            }
            next(error);
        }
    }

    // ─── PUT /employees/:id ───────────────────────────────────────────────────

    @httpPut('/:id', requireRole('MANAGER'))
    async updateEmployee(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const correlationId = (req as any).correlationId;

            const [existing] = await db
                .select({
                    id:          employeesLocal.id,
                    department:  employeesLocal.department,
                    designation: employeesLocal.designation,
                })
                .from(employeesLocal)
                .where(eq(employeesLocal.id, id))
                .limit(1);

            if (!existing) {
                return res.status(404).json(
                    ApiResponse.error('NOT_FOUND', 'Employee not found', undefined, { correlationId }),
                );
            }

            // Build update payload from allowed fields only
            const ALLOWED = [
                'fullName', 'email', 'phone',
                'department', 'designation', 'managerId',
                'dateOfJoining', 'dateOfBirth',
                'gender', 'maritalStatus',
                'employmentType', 'employmentStatus',
                'salary', 'costCenter', 'location',
            ] as const;

            const updates: Record<string, any> = {};
            for (const field of ALLOWED) {
                if (req.body[field] !== undefined) updates[field] = req.body[field];
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json(
                    ApiResponse.error('VALIDATION_ERROR', 'No updatable fields provided', undefined, { correlationId }),
                );
            }

            // Re-link departmentId when department name changes
            if (updates.department !== undefined && updates.department !== existing.department) {
                if (updates.department) {
                    const [dept] = await db
                        .select({ id: hrDepartments.id })
                        .from(hrDepartments)
                        .where(eq(hrDepartments.name, updates.department))
                        .limit(1);
                    updates.departmentId = dept?.id ?? null;
                } else {
                    updates.departmentId = null;
                }
            }

            // Re-link designationId when designation name changes
            if (updates.designation !== undefined && updates.designation !== existing.designation) {
                if (updates.designation) {
                    const [desig] = await db
                        .select({ id: hrDesignations.id })
                        .from(hrDesignations)
                        .where(eq(hrDesignations.name, updates.designation))
                        .limit(1);
                    updates.designationId = desig?.id ?? null;
                } else {
                    updates.designationId = null;
                }
            }

            updates.updatedAt = new Date();

            const [updated] = await db
                .update(employeesLocal)
                .set(updates)
                .where(eq(employeesLocal.id, id))
                .returning();

            this.outboxService.storeEvent('employee', 'employee.updated', {
                employeeId: id,
                changes:    req.body,
            }).catch(() => { /* outbox failures are non-fatal */ });

            res.json(ApiResponse.success(updated, 'Employee updated successfully', { correlationId }));
        } catch (error) {
            next(error);
        }
    }

    // ─── DELETE /employees/:id ────────────────────────────────────────────────

    @httpDelete('/:id', requireRole('MANAGER'))
    async deleteEmployee(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const correlationId = (req as any).correlationId;

            const [existing] = await db
                .select({ id: employeesLocal.id })
                .from(employeesLocal)
                .where(eq(employeesLocal.id, id))
                .limit(1);

            if (!existing) {
                return res.status(404).json(
                    ApiResponse.error('NOT_FOUND', 'Employee not found', undefined, { correlationId }),
                );
            }

            // Soft delete: mark as terminated
            await db
                .update(employeesLocal)
                .set({ employmentStatus: 'terminated', updatedAt: new Date() })
                .where(eq(employeesLocal.id, id));

            this.outboxService.storeEvent('employee', 'employee.terminated', {
                employeeId: id,
            }).catch(() => { /* outbox failures are non-fatal */ });

            res.json(ApiResponse.success(null, 'Employee terminated successfully', { correlationId }));
        } catch (error) {
            next(error);
        }
    }
}
