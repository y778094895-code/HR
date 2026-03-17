import React from 'react';
import { EmployeeProfileBundle } from '@/services/resources/profileDataAdapter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { TurnoverRisk, RiskFactor } from '@/types/risk';
import { Badge } from '@/components/ui/data-display/badge';
import { AlertCircle, TrendingDown, Lightbulb, Briefcase } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { usePermissions } from '@/hooks/usePermissions';

interface OverviewTabProps {
    profile: EmployeeProfileBundle;
}

export default function OverviewTab({ profile }: OverviewTabProps) {
    const { risk, performance, recommendations, cases, alerts } = profile;
    const { canViewRiskFull } = usePermissions();

    return (
        <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card shadow-sm border-border/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground font-medium flex gap-2 items-center">
                            <ActivityIcon /> Performance Rating
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(performance?.score || 0)}%</div>
                        <p className="text-xs text-muted-foreground mt-1">{performance?.rating}</p>
                    </CardContent>
                </Card>

                {canViewRiskFull && (
                    <Card className="bg-card shadow-sm border-border/60">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground font-medium flex gap-2 items-center">
                                <AlertCircle size={16} className="text-destructive" /> Risk Level
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{Math.round((risk?.riskScore || 0) * 100)}%</div>
                            <p className="text-xs text-muted-foreground mt-1">Confidence: {Math.round((risk?.confidenceScore || 0) * 100)}%</p>
                        </CardContent>
                    </Card>
                )}

                <Card className="bg-card shadow-sm border-border/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground font-medium flex gap-2 items-center">
                            <Briefcase size={16} className="text-blue-500" /> Open Cases
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{cases?.length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Active HR incidents</p>
                    </CardContent>
                </Card>

                <Card className="bg-card shadow-sm border-border/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground font-medium flex gap-2 items-center">
                            <Lightbulb size={16} className="text-amber-500" /> Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recommendations?.length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Pending actions</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {canViewRiskFull && (
                    <Card className="lg:col-span-2 bg-card shadow-sm border-border/60">
                        <CardHeader>
                            <CardTitle className="text-lg">Risk Trend Snapshot (6 mo)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={risk?.trend || []}>
                                    <XAxis dataKey="at" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis hide domain={[0, 1]} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(val: number) => [`${Math.round(val * 100)}%`, 'Risk Score']}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="hsl(var(--destructive))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-6">
                    <Card className="bg-card shadow-sm border-border/60">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <AlertCircle size={16} className="text-orange-500" /> Latest Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {alerts?.length ? alerts.slice(0, 5).map((alert: any) => (
                                <div key={alert.id} className="text-sm border-l-2 border-orange-500 pl-3">
                                    <p className="font-medium">{alert.title || alert.message || alert.description || 'Alert'}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleDateString() : 
                                         alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            )) : (
                                <p className="text-xs text-muted-foreground">No recent alerts.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-card shadow-sm border-border/60">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Lightbulb size={16} className="text-emerald-500" /> Top Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recommendations?.length ? recommendations.slice(0, 5).map((rec: any) => (
                                <div key={rec.id} className="text-sm border-l-2 border-emerald-500 pl-3 flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{rec.title || rec.recommendationType || 'Recommendation'}</p>
                                        <p className="text-xs text-muted-foreground capitalize mt-1">
                                            {rec.recommendationType || rec.type || 'general'}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className={
                                        (rec.confidenceScore > 0.7) ? 'text-destructive border-destructive' : ''
                                    }>
                                        {(typeof rec.confidenceScore === 'number') ? 
                                            `${(rec.confidenceScore * 100).toFixed(0)}%` : 'N/A'}
                                    </Badge>
                                </div>
                            )) : (
                                <p className="text-xs text-muted-foreground">No recommendations.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ActivityIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
    )
}
