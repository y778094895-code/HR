import React from 'react';
import { KPICard } from '@/components/ui/data-display/KPICard';
import { AlertTriangle, BookOpen, Brain, TrendingUp } from 'lucide-react';

export function SkillGapAnalysis() {
    // Mock Data
    const topGaps = [
        { skill: 'Python Programming', department: 'Engineering', gap: 45, priority: 'High' },
        { skill: 'Strategic Leadership', department: 'Management', gap: 30, priority: 'Medium' },
        { skill: 'Data Analysis', department: 'Sales', gap: 25, priority: 'Medium' },
        { skill: 'Cloud Architecture', department: 'IT', gap: 60, priority: 'Critical' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard title="Total Skill Gaps" value={128} change={5.2} icon={AlertTriangle} variant="warning" />
                <KPICard title="Avg Skill Level" value={3.8} change={0.4} icon={Brain} variant="default" />
                <KPICard title="Training Enrollment" value={215} change={12.0} icon={BookOpen} variant="success" />
                <KPICard title="Upskilling ROI" value={150} change={2.5} icon={TrendingUp} variant="success" valueSuffix="%" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Visuals Placeholder */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Skill Capability Heatmap</h3>
                    <div className="h-64 flex items-center justify-center bg-muted/20 border-2 border-dashed rounded-lg text-muted-foreground">
                        Heatmap Component Available Soon
                    </div>
                </div>

                {/* Top Gaps List */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Critical Skill Gaps</h3>
                    <div className="space-y-4">
                        {topGaps.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                                <div>
                                    <div className="font-medium">{item.skill}</div>
                                    <div className="text-xs text-muted-foreground">{item.department}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold ${item.priority === 'Critical' ? 'text-red-600' : 'text-orange-600'}`}>
                                        {item.gap}% Gap
                                    </div>
                                    <div className="text-xs text-muted-foreground">{item.priority} Priority</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
