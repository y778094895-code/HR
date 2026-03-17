import React from 'react';
import { SideDrawer } from '@/components/ui/overlays/SideDrawer';
import { EmployeeProfileBundle } from '@/services/resources/profileDataAdapter';
import { Badge } from '@/components/ui/data-display/badge';

interface CaseDetailsDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    caseId: string | null;
    profile: EmployeeProfileBundle;
}

export function CaseDetailsDrawer({ open, onOpenChange, caseId, profile }: CaseDetailsDrawerProps) {
    const caseData = profile.cases.find(c => c.id === caseId);

    return (
        <SideDrawer
            open={open}
            onOpenChange={onOpenChange}
            title="Case Details"
            description={`Viewing details for ${caseId}`}
        >
            {caseData ? (
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Title</h4>
                        <p className="font-semibold text-lg">{caseData.title || caseData.type}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                            <Badge variant="outline" className="mt-1">{caseData.status}</Badge>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Severity</h4>
                            <Badge variant="outline" className="mt-1">{caseData.severity}</Badge>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Created At</h4>
                        <p className="mt-1">{caseData.createdAt ? new Date(caseData.createdAt).toLocaleString() : 'N/A'}</p>
                    </div>

                    <div className="p-4 border rounded-xl bg-muted/30">
                        <p className="text-sm text-center text-muted-foreground">No updates logged yet for this operational case.</p>
                    </div>
                </div>
            ) : (
                <div className="p-8 text-center text-muted-foreground">
                    Case not found.
                </div>
            )}
        </SideDrawer>
    );
}
