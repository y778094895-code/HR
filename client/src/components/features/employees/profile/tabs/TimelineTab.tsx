import React from 'react';
import { EmployeeProfileBundle } from '@/services/resources/profileDataAdapter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { AlertCircle, FileText, CheckCircle2, GraduationCap, PenTool, Edit3 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { RestrictedView } from '@/components/shared/RestrictedView';

interface TimelineTabProps {
    profile: EmployeeProfileBundle;
}

export default function TimelineTab({ profile }: TimelineTabProps) {
    const { timeline } = profile;
    const { canViewExecutiveDashboards } = usePermissions();

    // Sort timeline latest first
    const sortedTimeline = [...(timeline || [])].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'ALERT': return <AlertCircle size={16} className="text-orange-500" />;
            case 'CASE_CREATED': return <FileText size={16} className="text-blue-500" />;
            case 'STATUS_CHANGED': return <CheckCircle2 size={16} className="text-emerald-500" />;
            case 'INTERVENTION_ASSIGNED': return <GraduationCap size={16} className="text-primary" />;
            case 'THRESHOLD_UPDATED': return <PenTool size={16} className="text-purple-500" />;
            default: return <Edit3 size={16} className="text-muted-foreground" />;
        }
    };

    return (
        <div className="space-y-6 mt-4">
            {!canViewExecutiveDashboards ? (
                <RestrictedView
                    title="سجل النشاط مقيد"
                    message="يتطلب استعراض سجل النشاطات والأحداث التفصيلي صلاحيات إدارية عليا."
                />
            ) : (
                <Card className="bg-card shadow-sm border-border/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Activity & Audit Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative border-l border-muted-foreground/20 ml-3 pl-6 space-y-8 py-2">
                            {sortedTimeline.length > 0 ? sortedTimeline.map((event, idx) => (
                                <div key={event.id || idx} className="relative">
                                    {/* Dot Icon */}
                                    <div className="absolute -left-10 bg-background border p-1 rounded-full shadow-sm">
                                        {getEventIcon(event.type)}
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-semibold">{event.label}</h4>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {event.at ? new Date(event.at).toLocaleString() : 'N/A'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Type: <span className="uppercase text-[10px] bg-muted px-1.5 py-0.5 rounded ml-1">{(event.type || '').replace('_', ' ')}</span></p>

                                        {event.metadata && (
                                            <div className="mt-2 bg-muted/50 p-2 rounded text-xs font-mono text-muted-foreground w-fit">
                                                {JSON.stringify(event.metadata)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-sm text-muted-foreground">No timeline events recorded.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
