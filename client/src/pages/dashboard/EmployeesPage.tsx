import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import EmployeeListContainer from '@/components/features/employees/EmployeeList/index';

export default function EmployeesPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // This page now serves ONLY as the employee directory.
    // Profile views should navigate to /dashboard/employees/:id directly.
    // The old "view=profile" mode with placeholder tabs has been removed.

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('nav.directory', 'Employee Directory')}
                description={t('employees.directoryDescription', 'Manage workforce, search employees, and overview metrics.')}
            />

            <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden">
                <EmployeeListContainer />
            </div>
        </div>
    );
}
