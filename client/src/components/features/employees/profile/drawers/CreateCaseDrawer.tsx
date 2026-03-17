import React, { useState } from 'react';
import { SideDrawer } from '@/components/ui/overlays/SideDrawer';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import { EmployeeProfileBundle, profileDataAdapter } from '@/services/resources/profileDataAdapter';

interface CreateCaseDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile: EmployeeProfileBundle;
    onSuccess?: () => void;
}

export function CreateCaseDrawer({ open, onOpenChange, profile, onSuccess }: CreateCaseDrawerProps) {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Retention');
    const [severity, setSeverity] = useState('Medium');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title) return;
        const employeeId = profile.employee?.id;
        if (!employeeId) return;
        
        setIsSubmitting(true);
        try {
            await profileDataAdapter.createCase(employeeId, {
                title,
                type,
                severity,
            });
            
            onOpenChange(false);
            setTitle('');
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Failed to create case:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const footer = (
        <div className="flex justify-end gap-2 w-full mt-8">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!title || isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Case'}
            </Button>
        </div>
    );

    return (
        <SideDrawer
            open={open}
            onOpenChange={onOpenChange}
            title="Open New Case"
            description={`Create a new HR Operational Case for ${profile.employee?.fullName || 'Employee'}`}
            footer={footer}
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Case Title</label>
                    <Input
                        placeholder="E.g., Flight Risk Review"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Case Type</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="Retention">Retention</option>
                        <option value="Performance">Performance Review</option>
                        <option value="Disciplinary">Disciplinary</option>
                        <option value="Fairness">Fairness Review</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Severity Level</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                </div>
            </div>
        </SideDrawer>
    );
}
