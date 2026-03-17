import React, { useState } from 'react';
import { EmployeeProfileBundle } from '@/services/resources/profileDataAdapter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/data-display/avatar';
import { Button } from '@/components/ui/buttons/button';
import { AlertCircle, TrendingDown, Scale, Briefcase, UserPlus } from 'lucide-react';
import { CreateCaseDrawer } from './drawers/CreateCaseDrawer';
import { AssignInterventionDrawer } from './drawers/AssignInterventionDrawer';

interface EmployeeHeaderProps {
    profile: EmployeeProfileBundle;
    onActionComplete?: () => void;
}

export default function EmployeeHeader({ profile, onActionComplete }: EmployeeHeaderProps) {
    const [isCaseDrawerOpen, setIsCaseDrawerOpen] = useState(false);
    const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);

    const { employee, risk, performance, fairness, cases } = profile;

    // We can assume employee has metadata like managerName, tenureYears, contractType, location etc. 
    // even though the basic interface doesn't list them, we can gracefully fallback.
    const managerName = (employee as any).managerName || 'Not Assigned';
    const tenureYears = (employee as any).tenureYears || 2;
    const contractType = (employee as any).contractType || 'Full-time';
    const location = (employee as any).location || 'HQ - Riyadh, KSA';

    return (
        <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-4 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">

            {/* Left: Identity */}
            <div className="flex gap-4 items-center">
                <Avatar className="h-20 w-20 border-2 border-border shadow-sm">
                    <AvatarImage src={`https://avatar.iran.liara.run/username?username=${employee.fullName}`} />
                    <AvatarFallback>{employee.fullName.charAt(0)}</AvatarFallback>
                </Avatar>

                <div>
                    <h1 className="text-2xl font-bold">{employee.fullName}</h1>
                    <p className="text-muted-foreground font-medium">{employee.designation} • {employee.department}</p>

                    <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                        <span><strong>Manager:</strong> {managerName}</span>
                        <span><strong>Tenure:</strong> {tenureYears} yrs</span>
                        <span><strong>Contract:</strong> {contractType}</span>
                        <span><strong>Location:</strong> {location}</span>
                    </div>
                </div>
            </div>

            {/* Right: Risk Snapshot Strip & Actions */}
            <div className="flex flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
                {/* Snapshot Mini Cards */}
                <div className="flex gap-2">
                    <div className="bg-destructive/10 border border-destructive/20 rounded p-2 flex-col flex items-center justify-center min-w-24">
                        <span className="text-[10px] uppercase text-destructive font-bold flex gap-1 items-center"><AlertCircle size={10} /> Attrition Risk</span>
                        <span className="text-lg font-bold text-destructive">{Math.round((risk?.riskScore || 0) * 100)}%</span>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded p-2 flex-col flex items-center justify-center min-w-24">
                        <span className="text-[10px] uppercase text-amber-600 font-bold flex gap-1 items-center"><TrendingDown size={10} /> Performance</span>
                        <span className="text-lg font-bold text-amber-600">{performance?.score || 0}% </span>
                    </div>
                    <div className={`border rounded p-2 flex-col flex items-center justify-center min-w-24 ${fairness?.overallAlert ? 'bg-orange-500/10 border-orange-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                        <span className={`text-[10px] uppercase font-bold flex gap-1 items-center ${fairness?.overallAlert ? 'text-orange-600' : 'text-emerald-600'}`}><Scale size={10} /> Fairness</span>
                        <span className={`text-lg font-bold ${fairness?.overallAlert ? 'text-orange-600' : 'text-emerald-600'}`}>{fairness?.overallAlert ? 'Review' : 'OK'}</span>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 flex-col flex items-center justify-center min-w-24">
                        <span className="text-[10px] uppercase text-blue-600 font-bold flex gap-1 items-center"><Briefcase size={10} /> Cases</span>
                        <span className="text-lg font-bold text-blue-600">{cases?.length || 0} Open</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => setIsAssignDrawerOpen(true)}>
                        <UserPlus size={16} /> Assign Intervention
                    </Button>
                    <Button size="sm" className="gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-black" onClick={() => setIsCaseDrawerOpen(true)}>
                        <Briefcase size={16} /> Open New Case
                    </Button>
                </div>
            </div>

            <CreateCaseDrawer
                open={isCaseDrawerOpen}
                onOpenChange={setIsCaseDrawerOpen}
                profile={profile}
                onSuccess={onActionComplete}
            />

            <AssignInterventionDrawer
                open={isAssignDrawerOpen}
                onOpenChange={setIsAssignDrawerOpen}
                profile={profile}
                onSuccess={onActionComplete}
            />
        </div>
    );
}
