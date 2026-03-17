export interface EmployeeDto {
    id: string;
    erpnextId: string;
    employeeCode: string;
    fullName: string;
    email: string;
    phone?: string;
    department?: string;
    designation?: string;
    managerId?: string | null;
    dateOfJoining: string; // ISO Date string
    dateOfBirth?: string; // ISO Date string
    gender?: string;
    maritalStatus?: string;
    employmentType?: string;
    employmentStatus: string;
    salary?: number;
    costCenter?: string;
    location?: string;
    createdAt?: Date;
    updatedAt?: Date;
    lastSyncAt?: Date | null;
    syncStatus?: string;
}

export function mapEmployeeToDto(data: any): EmployeeDto {
    return {
        id: data.id,
        erpnextId: data.erpnextId,
        employeeCode: data.employeeCode,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        department: data.department,
        designation: data.designation,
        managerId: data.managerId,
        dateOfJoining: data.dateOfJoining,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        employmentType: data.employmentType,
        employmentStatus: data.employmentStatus,
        salary: data.salary ? Number(data.salary) : undefined,
        costCenter: data.costCenter,
        location: data.location,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lastSyncAt: data.lastSyncAt,
        syncStatus: data.syncStatus
    };
}
