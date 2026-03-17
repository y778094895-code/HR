import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmployeeTable } from './EmployeeTable';
import { Employee } from '@/services/resources/employee.service';

const mockEmployees: Employee[] = [
    {
        id: '1',
        fullName: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        designation: 'Developer',
        employmentStatus: 'active',
        performanceScore: 85,
        dateOfJoining: '2023-01-01',
        employeeCode: 'EMP001'
    }
] as Employee[];

describe('EmployeeTable', () => {
    it('renders employee data', () => {
        render(<EmployeeTable employees={mockEmployees} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    it('renders loading skeleton', () => {
        const { container } = render(<EmployeeTable employees={[]} loading={true} />);
        // Check for Skeleton components (usually they have a specific class or we can check structure)
        // Based on implementation, it renders multiple Skeletons in a div
        expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0);
    });

    it('calls onViewProfile when view button clicked', () => {
        const onView = vi.fn();
        render(<EmployeeTable employees={mockEmployees} onViewProfile={onView} />);
        fireEvent.click(screen.getByText('View'));
        expect(onView).toHaveBeenCalledWith('1');
    });
});
