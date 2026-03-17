import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, Navigate } from 'react-router-dom';
import { profileDataAdapter, EmployeeProfileBundle } from '@/services/resources/profileDataAdapter';
import { EmployeeHeaderSticky, EmployeeHeaderDTO } from '@/components/features/employees/profile/EmployeeHeaderSticky';
import ProfileTabs from '@/components/features/employees/profile/ProfileTabs';
import { Skeleton } from '@/components/ui/feedback/skeleton';
import { ProfileActionDrawerProvider } from '@/components/features/employees/profile/drawers/ProfileActionDrawer';
import { useAuthStore } from '@/stores/business/auth.store';
import { AlertCircle, RefreshCw, UserX } from 'lucide-react';
import { Button } from '@/components/ui/buttons/button';
import { Card, CardContent } from '@/components/ui/cards/card';

// Check if employee is a real loaded record or a placeholder
const isRealEmployee = (employee: EmployeeProfileBundle['employee']): boolean => {
    return !!employee && 
           employee.id !== '' && 
           employee.fullName !== 'Unknown Employee' &&
           employee.email !== 'unknown@example.com';
};

export default function EmployeeProfilePage() {
    const { id: paramId } = useParams<{ id: string }>();
    const { user } = useAuthStore();
    const [searchParams] = useSearchParams();

    // Canonical route: /dashboard/employees/:id
    // Redirect legacy /dashboard/profile to /dashboard/employees/:userId
    const id = paramId || user?.id;
    const view = searchParams.get('view') || 'overview';

    const [profile, setProfile] = useState<EmployeeProfileBundle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [coreEmployeeError, setCoreEmployeeError] = useState<boolean>(false);

    const loadProfile = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        setCoreEmployeeError(false);
        try {
            const data = await profileDataAdapter.getEmployeeProfile(id);
            
            // Validate core employee record is real, not placeholder
            if (!isRealEmployee(data.employee)) {
                setCoreEmployeeError(true);
                setProfile(null);
            } else {
                setProfile(data);
            }
        } catch (err: any) {
            console.error('Failed to load profile', err);
            setError(err?.message || 'Failed to load employee profile. Please try again.');
            setCoreEmployeeError(true);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    // No employee ID - redirect to employees directory
    if (!id) {
        return <Navigate to="/dashboard/employees" replace />;
    }

    // Loading state
    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-[600px] w-full rounded-xl" />
            </div>
        );
    }

    // Core employee fetch failed or returned placeholder - show proper not-found state
    if (coreEmployeeError || error || !profile) {
        return (
            <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <UserX className="h-8 w-8 text-destructive" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                            لم يتم العثور على الموظف
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {error || 'Employee not found or unable to load employee profile. The employee ID may be invalid or the record no longer exists.'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2" onClick={loadProfile}>
                            <RefreshCw size={16} /> إعادة المحاولة
                        </Button>
                        <Button variant="default" className="gap-2" onClick={() => window.location.href = '/dashboard/employees'}>
                            العودة لقائمة الموظفين
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const headerData: EmployeeHeaderDTO = {
        id: profile.employee?.id || '',
        fullName: profile.employee?.fullName,
        department: profile.employee?.department,
        designation: profile.employee?.designation,
        email: profile.employee?.email,
        employeeCode: profile.employee?.employeeCode,
        overallRiskScore: profile.employee?.riskScore || (profile.risk ? Math.round(profile.risk.riskScore * 100) : 0),
        status: profile.employee?.employmentStatus || 'active',
    };

    return (
        <ProfileActionDrawerProvider profile={profile} onActionComplete={loadProfile}>
            <div className="relative space-y-6">
                <EmployeeHeaderSticky data={headerData} />
                <ProfileTabs profile={profile} activeView={view} />
            </div>
        </ProfileActionDrawerProvider>
    );
}
