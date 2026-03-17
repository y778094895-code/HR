export class EmployeeValidationRules {
    static validateCreate(data: any) {
        const errors: string[] = [];
        if (!data.fullName) errors.push('Full Name is required');
        if (!data.email) errors.push('Email is required');
        if (!data.employeeCode) errors.push('Employee Code is required');

        return {
            valid: errors.length === 0,
            errors
        };
    }

    static validateUpdate(data: any) {
        // Validation logic for update
        return { valid: true, errors: [] };
    }
}

export class EmployeeBusinessRules {
    static validateFilters(filters: any) {
        // Logic to validate and sanitize filters
        return filters || {};
    }

    static enrichCreateData(data: any) {
        return {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            employmentStatus: 'active',
            syncStatus: 'pending'
        };
    }

    static async canUpdateEmployee(id: string, updates: any) {
        // Business rule: e.g., cannot update terminated employee
        return true;
    }
}
