import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EquityMatrix from './EquityMatrix';

describe('EquityMatrix', () => {
    const mockData = [
        { category: 'Male', avgSalary: '$75,000', avgRating: 4.2, gap: '0%' },
        { category: 'Female', avgSalary: '$73,500', avgRating: 4.3, gap: '-2%' }
    ];

    it('renders data correctly', () => {
        render(<EquityMatrix data={mockData} />);
        expect(screen.getByText('Male')).toBeInTheDocument();
        expect(screen.getByText('$75,000')).toBeInTheDocument();
        expect(screen.getByText('-2%')).toBeInTheDocument();
    });

    it('applies correct color for negative gap', () => {
        render(<EquityMatrix data={mockData} />);
        const gapElement = screen.getByText('-2%');
        expect(gapElement).toHaveClass('text-red-600');
    });

    it('renders loading state', () => {
        const { container } = render(<EquityMatrix data={[]} loading={true} />);
        expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0);
    });
});
