import React from 'react';
import { Building, Briefcase, Mail, Hash, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmployeeHeaderDTO {
    id: string;
    fullName: string;
    department: string;
    designation: string;
    email: string;
    employeeCode: string;
    overallRiskScore: number;
    status: 'active' | 'on_boarding' | 'inactive';
}

interface EmployeeHeaderStickyProps {
    data: EmployeeHeaderDTO;
    isLoading?: boolean;
}

// ── Defensive helpers for safe string operations ──

/**
 * Safely get first character uppercase, or default to 'E'
 */
function safeInitials(name: string | undefined | null): string {
    if (!name || typeof name !== 'string') return 'E';
    const first = name.trim().charAt(0);
    return first ? first.toUpperCase() : 'E';
}

/**
 * Safely get display name, default to localized "Employee"
 */
function safeDisplayName(name: string | undefined | null): string {
    if (!name || typeof name !== 'string' || !name.trim()) return 'Employee';
    return name.trim();
}

/**
 * Safely get email, default to "—"
 */
function safeEmail(email: string | undefined | null): string {
    if (!email || typeof email !== 'string' || !email.trim()) return '—';
    return email.trim();
}

/**
 * Safely get role/designation, default to "Not available"
 */
function safeDesignation(designation: string | undefined | null): string {
    if (!designation || typeof designation !== 'string' || !designation.trim()) return 'Not available';
    return designation.trim();
}

/**
 * Safely get department, default to "Not available"
 */
function safeDepartment(department: string | undefined | null): string {
    if (!department || typeof department !== 'string' || !department.trim()) return 'Not available';
    return department.trim();
}

/**
 * Safely get employee code, default to "—"
 */
function safeEmployeeCode(code: string | undefined | null): string {
    if (!code || typeof code !== 'string' || !code.trim()) return '—';
    return code.trim();
}

/**
 * Safely get status, default to 'active'
 */
function safeStatus(status: string | undefined | null): 'active' | 'on_boarding' | 'inactive' {
    if (!status || typeof status !== 'string') return 'active';
    if (status === 'on_boarding') return 'on_boarding';
    if (status === 'inactive') return 'inactive';
    return 'active';
}

/**
 * Safely get numeric risk score, default to 0
 */
function safeRiskScore(score: number | undefined | null): number {
    if (typeof score !== 'number' || isNaN(score)) return 0;
    return Math.max(0, Math.min(100, score));
}

export function EmployeeHeaderSticky({ data, isLoading }: EmployeeHeaderStickyProps) {
    if (isLoading) {
        return (
            <div className="bg-card/80 backdrop-blur-md border border-border/60 rounded-xl p-6 shadow-sm mb-6 animate-pulse">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-muted"></div>
                        <div className="space-y-2">
                            <div className="h-6 w-48 bg-muted rounded"></div>
                            <div className="flex gap-2">
                                <div className="h-4 w-24 bg-muted rounded"></div>
                                <div className="h-4 w-24 bg-muted rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Defensive extraction of all fields
    const fullName = safeDisplayName(data?.fullName);
    const department = safeDepartment(data?.department);
    const designation = safeDesignation(data?.designation);
    const email = safeEmail(data?.email);
    const employeeCode = safeEmployeeCode(data?.employeeCode);
    const status = safeStatus(data?.status);
    const overallRiskScore = safeRiskScore(data?.overallRiskScore);

    const getRiskColor = (score: number) => {
        if (score >= 70) return 'text-destructive bg-destructive/10 border-destructive/20';
        if (score >= 40) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    };

    const riskColorClass = getRiskColor(overallRiskScore);
    const isHighRisk = overallRiskScore >= 70;

    return (
        <div className="bg-card/80 backdrop-blur-md border border-border/60 rounded-xl p-6 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sticky top-[72px] z-10">
            {/* Identity Group */}
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border border-primary/20 shrink-0">
                    {safeInitials(fullName)}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl font-bold tracking-tight text-foreground">{fullName}</h1>
                        <span className={cn(
                            "px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider",
                            status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                                status === 'on_boarding' ? 'bg-blue-500/10 text-blue-500' : 'bg-muted text-muted-foreground'
                        )}>
                            {status.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {designation}</span>
                        <span className="flex items-center gap-1.5"><Building className="h-3.5 w-3.5" /> {department}</span>
                        <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {email}</span>
                        <span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" /> {employeeCode}</span>
                    </div>
                </div>
            </div>

            {/* Risk Snapshot Strip */}
            <div className={cn(
                "flex flex-col items-end px-4 py-3 rounded-lg border min-w-[200px] transition-colors",
                riskColorClass
            )}>
                <div className="flex items-center gap-2 mb-1">
                    {isHighRisk ? <AlertTriangle className="h-5 w-5 animate-pulse" /> : <ShieldCheck className="h-5 w-5" />}
                    <span className="text-sm font-semibold">مؤشر الخطر المدمج</span>
                </div>
                <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold leading-none">{overallRiskScore}</span>
                    <span className="text-sm font-medium opacity-70 mb-0.5">/ 100</span>
                </div>
                {isHighRisk && (
                    <div className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-80">
                        High Flight Risk
                    </div>
                )}
            </div>
        </div>
    );
}
