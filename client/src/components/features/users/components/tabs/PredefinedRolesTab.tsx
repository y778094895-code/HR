import { useUsers } from '@/components/features/users/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Shield, Users, Crown, Briefcase } from 'lucide-react';

// Predefined roles based on the system
const PREDEFINED_ROLES = [
    {
        id: 'super_admin',
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        icon: Crown,
        color: 'bg-red-50 text-red-600 border-red-200',
        permissions: [
            'All user management',
            'All system settings',
            'All data access',
            'All analytics',
            'Fairness monitoring'
        ]
    },
    {
        id: 'admin',
        name: 'Admin',
        description: 'Administrative access to manage users and settings',
        icon: Shield,
        color: 'bg-red-50 text-red-600 border-red-200',
        permissions: [
            'User management',
            'Role management',
            'Data visibility settings',
            'Access audit logs',
            'Fairness monitoring'
        ]
    },
    {
        id: 'hr_manager',
        name: 'HR Manager',
        description: 'Human resources management and employee oversight',
        icon: Users,
        color: 'bg-amber-50 text-amber-600 border-amber-200',
        permissions: [
            'View all employees',
            'Manage employee profiles',
            'Create interventions',
            'View reports',
            'Training program management'
        ]
    },
    {
        id: 'manager',
        name: 'Manager',
        description: 'Team management and performance oversight',
        icon: Briefcase,
        color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        permissions: [
            'View team employees',
            'View team performance',
            'Create interventions',
            'View reports'
        ]
    },
    {
        id: 'employee',
        name: 'Employee',
        description: 'Standard employee access',
        icon: Users,
        color: 'bg-slate-50 text-slate-600 border-slate-200',
        permissions: [
            'View own profile',
            'View own performance',
            'Access training programs'
        ]
    }
];

export function PredefinedRolesTab() {
    const { users } = useUsers();
    
    // Get role statistics from actual user data
    const roleStats = users?.reduce((acc: Record<string, number>, user) => {
        const role = user.role || 'employee';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {}) || {};

    return (
        <div className="space-y-6">
            <div className="text-sm text-slate-500">
                System-defined roles with predefined permission sets
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {PREDEFINED_ROLES.map((role) => {
                    const Icon = role.icon;
                    const count = roleStats[role.id] || 0;
                    
                    return (
                        <Card key={role.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className={`p-2 rounded-lg ${role.color}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <Badge variant="outline" className="ml-2">
                                        {count} user{count !== 1 ? 's' : ''}
                                    </Badge>
                                </div>
                                <CardTitle className="text-base mt-3">{role.name}</CardTitle>
                                <p className="text-sm text-slate-500">{role.description}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs font-medium text-slate-500 mb-2">Permissions:</div>
                                <ul className="text-xs space-y-1">
                                    {role.permissions.map((perm, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-emerald-500 mt-0.5">•</span>
                                            <span className="text-slate-600">{perm}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

