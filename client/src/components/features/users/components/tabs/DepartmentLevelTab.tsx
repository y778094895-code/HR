import { Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { Badge } from '@/components/ui/data-display/badge';

export function DepartmentLevelTab() {
    // Show limited data based on user department information
    const departments = [
        { id: 'engineering', name: 'Engineering', users: 0, description: 'Software development and technical teams' },
        { id: 'hr', name: 'Human Resources', users: 0, description: 'People operations and recruitment' },
        { id: 'sales', name: 'Sales', users: 0, description: 'Sales and business development' },
        { id: 'marketing', name: 'Marketing', users: 0, description: 'Brand and growth marketing' },
        { id: 'finance', name: 'Finance', users: 0, description: 'Financial planning and accounting' },
        { id: 'operations', name: 'Operations', users: 0, description: 'Business operations and support' },
    ];

    return (
        <div className="space-y-6">
            <div className="text-sm text-slate-500">
                Department-level data visibility controls are not fully configured by the backend.
                Below shows the available departments in the system.
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {departments.map((dept) => (
                    <Card key={dept.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-slate-400" />
                                    <CardTitle className="text-base">{dept.name}</CardTitle>
                                </div>
                                <Badge variant="outline">{dept.users} users</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500">{dept.description}</p>
                            <p className="text-xs text-slate-400 mt-2">
                                Backend API support required: /departments endpoint
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

