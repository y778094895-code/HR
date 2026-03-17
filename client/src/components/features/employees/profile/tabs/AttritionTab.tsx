import React, { useState } from 'react';
import { EmployeeProfileBundle, RiskDriver } from '@/services/resources/profileDataAdapter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/cards/card';
import { TurnoverRisk, RiskFactor } from '@/types/risk';
import { Button } from '@/components/ui/buttons/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-display/table';
import { ArrowUpRight, ArrowDownRight, Briefcase, Zap, Info, Eye } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useProfileDrawer } from '../drawers/ProfileActionDrawer';

interface AttritionTabProps {
    profile: EmployeeProfileBundle;
}

export default function AttritionTab({ profile }: AttritionTabProps) {
    const { risk } = profile;
    const { canViewXaiDrivers, canCreateCase } = usePermissions();
    const { openDrawer } = useProfileDrawer();

    const handleConvertCase = () => {
        openDrawer('CREATE_CASE');
    };

    const handleOpenXAI = (driver: RiskDriver) => {
        openDrawer('XAI_EXPLANATION', { driver });
    };

    return (
        <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Score Card */}
                <Card className="bg-destructive/5 border-destructive/20 shadow-sm col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl text-destructive font-bold flex items-center gap-2">
                            <Zap size={20} /> Attrition Risk Score
                        </CardTitle>
                        <CardDescription>Machine Learning Model v{risk?.mlModelVersion || '1.0'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2 my-4">
                            <span className="text-6xl font-black text-destructive leading-none">{Math.round((risk?.riskScore || 0) * 100)}%</span>
                        </div>
                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Confidence Level</span>
                                <span className="font-semibold">{Math.round((risk?.confidenceScore || 0) * 100)}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Last Computed</span>
                                <span className="font-semibold">Today</span>
                            </div>
                        </div>

                        {canCreateCase && (
                            <div className="mt-8">
                                <Button
                                    className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
                                    onClick={handleConvertCase}
                                >
                                    <Briefcase size={16} />
                                    Convert to Case
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Risk Drivers */}
                {canViewXaiDrivers ? (
                    <Card className="bg-card shadow-sm border-border/60 col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                Explainable AI Drivers <Info size={16} className="text-muted-foreground" />
                            </CardTitle>
                            <CardDescription>Top factors contributing to this employee's risk score.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Risk Factor</TableHead>
                                        <TableHead>Impact Weight</TableHead>
                                        <TableHead className="text-right">Direction</TableHead>
                                        <TableHead className="text-right w-16"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {risk?.contributingFactors.map((driver, index) => (
                                        <TableRow key={index} className="group">
                                            <TableCell className="font-medium">{driver.factor}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary"
                                                            style={{ width: `${driver.impact * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{(driver.impact * 100).toFixed(1)}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {driver.direction === 'UP' ? (
                                                    <span className="inline-flex items-center gap-1 text-destructive font-semibold text-sm">
                                                        <ArrowUpRight size={14} /> Risk Up
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold text-sm">
                                                        <ArrowDownRight size={14} /> Risk Down
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleOpenXAI(driver)}
                                                >
                                                    <Eye size={14} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!risk?.contributingFactors || risk.contributingFactors.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                                No explicit drivers generated.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="col-span-1 lg:col-span-2">
                        <div className="h-full w-full rounded-xl border-2 border-dashed bg-muted/20 flex flex-col items-center justify-center p-6 text-center text-muted-foreground space-y-4">
                            <Info size={32} className="opacity-50" />
                            <div>
                                <h4 className="font-semibold text-foreground">تفاصيل XAI مقيدة</h4>
                                <p className="text-sm mt-1">تتطلب دراسة العوامل المؤثرة صلاحيات وصول أعلى وفقاً لسياسة الخصوصية.</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
