import React from 'react';
import { SideDrawer } from '@/components/ui/overlays/SideDrawer';
import { RiskDriver } from '@/services/resources/profileDataAdapter';
import { ExplainabilityDriver } from '@/types/xai';
import { RiskFactor } from '@/types/risk';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

// Profile XAI Detail Drawer
// Consumes RiskDriver from profileDataAdapter (normalized via PR-01 contracts)
interface XAIDetailDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    driver: RiskDriver | null;
}

export function XAIDetailDrawer({ open, onOpenChange, driver }: XAIDetailDrawerProps) {
    return (
        <SideDrawer
            open={open}
            onOpenChange={onOpenChange}
            title="Driver Explanation (XAI)"
            description="Detailed breakdown of how this factor influences the risk prediction."
        >
            {driver ? (
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Factor Name</h4>
                        <p className="font-semibold text-lg">{driver.factor}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-xl bg-card">
                            <h4 className="text-sm font-medium text-muted-foreground">Impact Weight</h4>
                            <p className="text-xl font-bold mt-1">{(driver.impact * 100).toFixed(1)}%</p>
                        </div>
                        <div className="p-4 border rounded-xl bg-card">
                            <h4 className="text-sm font-medium text-muted-foreground">Force Direction</h4>
                            <div className="mt-1">
                                {driver.direction === 'UP' ? (
                                    <span className="inline-flex items-center gap-1 text-destructive font-semibold text-lg">
                                        <ArrowUpRight size={18} /> Push Up
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold text-lg">
                                        <ArrowDownRight size={18} /> Pull Down
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-muted/40 rounded-xl space-y-3">
                        <h4 className="font-semibold flex items-center gap-2"><Info size={16} /> Context & Analysis</h4>
                        <p className="text-sm text-foreground leading-relaxed">
                            Machine learning interpretability indicates that <strong>{driver.factor}</strong> contributes approximately <strong>{(driver.impact * 100).toFixed(1)}%</strong> to the overall computed risk score.
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                            {driver.direction === 'UP'
                                ? "This feature is actively increasing the employee's flight risk compared to the standard retention baseline."
                                : "This feature acts as an anchor, significantly buffering against attrition risk and keeping the score lower than it otherwise would be."
                            }
                        </p>
                    </div>
                </div>
            ) : (
                <div className="p-8 text-center text-muted-foreground">
                    No active driver selected.
                </div>
            )}
        </SideDrawer>
    );
}
