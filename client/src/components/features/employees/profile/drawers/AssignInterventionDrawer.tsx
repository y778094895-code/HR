import React, { useState } from 'react';
import { SideDrawer } from '@/components/ui/overlays/SideDrawer';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import { EmployeeProfileBundle, profileDataAdapter } from '@/services/resources/profileDataAdapter';

interface AssignInterventionDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile: EmployeeProfileBundle;
    onSuccess?: () => void;
}

export function AssignInterventionDrawer({ open, onOpenChange, profile, onSuccess }: AssignInterventionDrawerProps) {
    const [interventionTitle, setInterventionTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!interventionTitle) return;
        const employeeId = profile.employee?.id;
        if (!employeeId) return;
        
        setIsSubmitting(true);
        try {
            await profileDataAdapter.assignTraining(employeeId, {
                skill: interventionTitle,
                type: 'Custom Intervention'
            });
            
            onOpenChange(false);
            setInterventionTitle('');
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Failed to assign intervention:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const footer = (
        <div className="flex justify-end gap-2 w-full mt-8">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!interventionTitle || isSubmitting}>
                {isSubmitting ? 'Assigning...' : 'Assign'}
            </Button>
        </div>
    );

    return (
        <SideDrawer
            open={open}
            onOpenChange={onOpenChange}
            title="Assign Intervention"
            description="Assign a specific retention or performance intervention to this employee."
            footer={footer}
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Intervention Plan</label>
                    <Input
                        placeholder="E.g., 20% Retention Bonus or Mentorship Program"
                        value={interventionTitle}
                        onChange={(e) => setInterventionTitle(e.target.value)}
                    />
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                    Assigning an intervention will automatically log it in the employee's immutable timeline and tag it for Impact Analysis tracking.
                </div>
            </div>
        </SideDrawer>
    );
}
