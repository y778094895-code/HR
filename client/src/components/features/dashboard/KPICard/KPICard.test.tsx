import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import KPICard from './KPICard';

describe('KPICard', () => {
    it('renders title and value', () => {
        render(<KPICard title="Test Title" value="100" />);
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('renders loading state', () => {
        const { container } = render(<KPICard title="Test" value="0" loading={true} />);
        expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0);
    });

    it('renders trend indicator', () => {
        render(<KPICard title="Revenue" value="500" trend="up" change="10%" />);
        expect(screen.getByText('10%')).toHaveClass('text-green-600');
    });
});
