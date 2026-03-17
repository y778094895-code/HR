import { UserProfile } from './auth';

export interface Employee {
    id: string;
    fullName: string;
    email: string;
    department: string;
    designation: string;
    dateOfJoining: string;
    employeeCode: string;
    performanceScore?: number;
    riskScore?: number;
    employmentStatus: 'active' | 'inactive' | 'on_boarding';
}

// Re-export UserProfile as User for backward compatibility or domain usage
export type User = UserProfile;
