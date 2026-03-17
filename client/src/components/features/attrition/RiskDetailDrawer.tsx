import React from 'react';
import { SideDrawer } from '@/components/ui/overlays/SideDrawer';
import { Button } from '@/components/ui/buttons/button';
import { AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '@/stores/business/case.store';


interface RiskDetailProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    employee: any;
    onIntervention: (employeeId: string) => void;
}

export function RiskDetailDrawer({ isOpen, onClose, employee, onIntervention }: RiskDetailProps) {
    const { hasRole } = useAuth();
    const navigate = useNavigate();
    const { addCase } = useCaseStore();

    // Only Admin, Manager, or HR can create cases
    const canLogIntervention = hasRole(['admin', 'manager', 'hr']);

    if (!employee) return null;

    const handleOpenCase = () => {
        addCase({
            title: `معالجة خطر استقالة - ${employee.name}`,
            description: `تم تصنيف الموظف بخطر استقالة ${employee.riskScore}% بسبب: ${employee.mainFactor}`,
            priority: employee.riskScore > 80 ? 'critical' : 'high',
            employeeId: employee.id,
            employeeName: employee.name,
        });
        onClose(false);
        navigate('/dashboard/cases');
    };


    const riskLevelColor = employee.riskScore > 80 ? 'text-red-600' : 'text-yellow-600';

    return (
        <SideDrawer
            open={isOpen}
            onOpenChange={onClose}
            title={`${employee.name} - Risk Analysis`}
            description={`Risk assessment and drivers for ${employee.role}`}
            footer={
                canLogIntervention && (
                    <Button
                        variant="default"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold"
                        onClick={handleOpenCase}
                    >
                        <Lightbulb className="mr-2 h-4 w-4" />
                        فتح حالة (Open Case)
                    </Button>
                )
            }
        >
            <div className="space-y-6">
                {/* Score Header */}
                <div className="p-4 bg-muted/30 rounded-lg border flex items-center justify-between">
                    <div>
                        <span className="text-sm text-muted-foreground block">Attrition Risk Probability</span>
                        <div className={`text-3xl font-bold ${riskLevelColor} flex items-center gap-2`}>
                            {employee.riskScore}%
                            {employee.riskScore > 80 && <AlertTriangle className="h-6 w-6" />}
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-sm text-muted-foreground block">Prediction Confidence</span>
                        <span className="text-lg font-semibold">High (92%)</span>
                    </div>
                </div>

                {/* XAI Drivers */}
                <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        Top Risk Drivers
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-red-50 rounded-md border border-red-100">
                            <div className="flex justify-between mb-1">
                                <span className="font-medium text-red-900">Salary Competitiveness</span>
                                <span className="text-xs font-bold text-red-700">High Impact</span>
                            </div>
                            <p className="text-sm text-red-800">
                                Salary is 15% below market average for this role.
                            </p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-md border border-orange-100">
                            <div className="flex justify-between mb-1">
                                <span className="font-medium text-orange-900">Commute Time</span>
                                <span className="text-xs font-bold text-orange-700">Medium Impact</span>
                            </div>
                            <p className="text-sm text-orange-800">
                                Recent office move increased commute by 45 mins.
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                            <div className="flex justify-between mb-1">
                                <span className="font-medium text-blue-900">Lack of Promotion</span>
                                <span className="text-xs font-bold text-blue-700">Low Impact</span>
                            </div>
                            <p className="text-sm text-blue-800">
                                2.5 years in current role without role change.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Historical Context */}
                <div>
                    <h3 className="font-semibold mb-2">Engagement History</h3>
                    <div className="h-32 bg-muted/20 rounded border-dashed border-2 flex items-center justify-center text-xs text-muted-foreground">
                        Engagement Trend Chart
                    </div>
                </div>

                {/* Recommended Actions */}
                <div>
                    <h3 className="font-semibold mb-2">Recommended Actions</h3>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                        <li>Schedule a stay interview within 7 days.</li>
                        <li>Review compensation adjustment options.</li>
                        <li>Discuss flexible work arrangements.</li>
                    </ul>
                </div>
            </div>
        </SideDrawer>
    );
}
