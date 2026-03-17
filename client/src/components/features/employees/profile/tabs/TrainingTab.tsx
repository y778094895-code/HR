import React, { useState } from 'react';
import { EmployeeProfileBundle } from '@/services/resources/profileDataAdapter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/cards/card';
import { Button } from '@/components/ui/buttons/button';
import { Badge } from '@/components/ui/data-display/badge';
import { GraduationCap, BookOpen, AlertCircle, Link as LinkIcon, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useProfileDrawer } from '../drawers/ProfileActionDrawer';
import { interventionService } from '@/services/resources/intervention.service';
import { SkillGap } from '@/services/resources/training.service';

interface TrainingTabProps {
    profile: EmployeeProfileBundle;
}

export default function TrainingTab({ profile }: TrainingTabProps) {
    const { training, recommendations, employee } = profile;
    const { canAssignIntervention } = usePermissions();
    const { openDrawer } = useProfileDrawer();
    
    // Filter training recommendations from the profile bundle
    const trainingRecs = profile.training?.recommendations || [];
    const skillGaps = profile.training?.skillGaps || [];

    const [isAssigning, setIsAssigning] = useState<string | null>(null);

    const handleAssign = async (recId: string) => {
        if (!canAssignIntervention) return;
        
        setIsAssigning(recId);
        try {
            await interventionService.handleRecommendationAction(recId, 'apply');
        } catch (err) {
            console.error('Failed to assign training:', err);
        } finally {
            setIsAssigning(null);
        }
    };

    const handleLinkCase = () => {
        const employeeId = employee?.id;
        if (employeeId) {
            openDrawer('CREATE_CASE', { employeeId });
        }
    };

    // Helper to determine gap trend color
    const getGapTrendIcon = (gapScore: number) => {
        if (gapScore > 0) return <TrendingDown size={14} className="text-destructive" />;
        if (gapScore < 0) return <TrendingUp size={14} className="text-emerald-500" />;
        return <Minus size={14} className="text-muted-foreground" />;
    };

    return (
        <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-card shadow-sm border-border/60 col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen size={18} /> Recommended Development
                        </CardTitle>
                        <CardDescription>Based on recent performance and skill gap analysis.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {trainingRecs.length > 0 ? trainingRecs.map(rec => (
                            <div key={rec.id} className="p-4 border rounded-xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold">{(rec as any).title || rec.reason || 'Training Recommendation'}</h4>
                                        <Badge variant="outline" className={rec.status === 'pending' ? 'text-orange-500 border-orange-500' : ''}>
                                            {rec.status || 'pending'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Match Score: <strong>{(rec.matchScore * 100).toFixed(0)}%</strong>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="gap-1" onClick={handleLinkCase}>
                                        <LinkIcon size={14} /> Link Case
                                    </Button>
                                    {canAssignIntervention && (
                                        <Button size="sm" className="gap-1" onClick={() => handleAssign(rec.id)} disabled={isAssigning === rec.id}>
                                            <GraduationCap size={14} /> {isAssigning === rec.id ? 'Assigning...' : 'Assign Training'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center border-dashed border-2 rounded-xl text-muted-foreground">
                                No active training recommendations required.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-card shadow-sm border-border/60">
                    <CardHeader>
                        <CardTitle className="text-base">Detected Skill Gaps</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {skillGaps.length > 0 ? (
                            <div className="space-y-2">
                                {skillGaps.map((gap: SkillGap, idx: number) => (
                                    <div key={gap.skillName || idx} className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                gap.priority === 'high' ? 'bg-orange-500' : 
                                                gap.priority === 'medium' ? 'bg-blue-500' : 'bg-purple-500'
                                            }`}></div>
                                            {gap.skillName}
                                        </span>
                                        <span className="font-medium flex items-center gap-1">
                                            {getGapTrendIcon(gap.gapScore)}
                                            {gap.gapScore > 0 ? '+' : ''}{gap.gapScore}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-4">
                                No skill gaps detected.
                            </div>
                        )}

                        {skillGaps.length > 0 && (
                            <div className="mt-4 p-3 bg-blue-500/10 rounded-xl text-sm text-blue-800 dark:text-blue-300 flex gap-3">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <p>Addressing skill gaps could improve performance and promotion equity over the next 12 months.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
