import React, { useState } from 'react';
import { EmployeeProfileBundle } from '@/services/resources/profileDataAdapter';
import { BiasMetric, FairnessReport } from '@/types/fairness';
import { useAuthStore } from '@/stores/business/auth.store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/cards/card';
import { Button } from '@/components/ui/buttons/button';
import { Lock, Scale, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useProfileDrawer } from '../drawers/ProfileActionDrawer';

interface FairnessTabProps {
    profile: EmployeeProfileBundle;
}

export default function FairnessTab({ profile }: FairnessTabProps) {
    const { fairness } = profile;
    const { user } = useAuthStore();
    const { canViewSalary, canCreateCase } = usePermissions();
    const { openDrawer } = useProfileDrawer();
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateCase = () => {
        if (!canCreateCase) return;
        const employeeId = profile.employee?.id;
        if (employeeId) {
            openDrawer('CREATE_CASE', { employeeId });
        }
    };

    // Helper to determine status from BiasMetric status string
    const isFlagged = (metric: any) => metric?.status === 'warning' || metric?.status === 'critical';

    return (
        <div className="space-y-6 mt-4">
            {!canViewSalary && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 p-4 rounded-xl flex items-start gap-3">
                    <Lock size={20} className="mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-semibold">Confidential Data Masked</h4>
                        <p className="text-sm mt-1">Due to your role ({user?.role}), specific financial figures like salary and equity gaps have been masked. You are viewing aggregate pattern flags only.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={`shadow-sm border-border/60 ${isFlagged(fairness?.salaryGap) ? 'ring-1 ring-orange-500' : ''}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground font-medium flex justify-between">
                            Salary Position vs Peers
                            {isFlagged(fairness?.salaryGap) ? <AlertTriangle size={16} className="text-orange-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {canViewSalary ? (
                            <div className={`text-2xl font-bold ${isFlagged(fairness?.salaryGap) ? 'text-orange-500' : ''}`}>
                                {fairness?.salaryGap?.value > 0 ? '+' : ''}{fairness?.salaryGap?.value}%
                            </div>
                        ) : (
                            <div className="text-2xl font-bold tracking-widest text-muted-foreground">••••••</div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            Compared to similar roles.
                        </p>
                    </CardContent>
                </Card>

                <Card className={`shadow-sm border-border/60 ${isFlagged(fairness?.evaluationBias) ? 'ring-1 ring-destructive' : ''}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground font-medium flex justify-between">
                            Evaluation Bias Indicator
                            {isFlagged(fairness?.evaluationBias) ? <AlertTriangle size={16} className="text-destructive" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${isFlagged(fairness?.evaluationBias) ? 'text-destructive' : ''}`}>
                            {canViewSalary ? (fairness?.evaluationBias?.value * 100).toFixed(1) : 'Normal'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Deviation from department average.
                        </p>
                    </CardContent>
                </Card>

                <Card className={`shadow-sm border-border/60 ${isFlagged(fairness?.promotionEquity) ? 'ring-1 ring-orange-500' : ''}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground font-medium flex justify-between">
                            Promotion Pattern Equity
                            {isFlagged(fairness?.promotionEquity) ? <AlertTriangle size={16} className="text-orange-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${isFlagged(fairness?.promotionEquity) ? 'text-orange-500' : ''}`}>
                            {canViewSalary ? `${(fairness?.promotionEquity?.value * 100).toFixed(1)}%` : 'Flagged'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Historical velocity tracking.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {fairness?.overallAlert && canCreateCase && (
                <div className="flex justify-end mt-4">
                    <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                        onClick={handleCreateCase}
                        disabled={isCreating}
                    >
                        <Scale size={16} />
                        {isCreating ? 'Creating Review...' : 'Create Fairness Review Case'}
                    </Button>
                </div>
            )}
        </div>
    );
}
