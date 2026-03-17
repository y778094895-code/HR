import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TrendChart from './TrendChart';

describe('TrendChart', () => {
    it('renders title', () => {
        render(<TrendChart data={[10, 20]} />);
        expect(screen.getByText('Performance Over Time')).toBeInTheDocument();
    });

    it('renders bars based on data', () => {
        const { container } = render(<TrendChart data={[10, 20, 30]} />);
        // We can check if correct number of bars are rendered. 
        // Based on implementation, bars have class 'bg-indigo-500'
        expect(container.getElementsByClassName('bg-indigo-500').length).toBe(3);
    });

    it('renders loading state', () => {
        const { container } = render(<TrendChart data={[]} loading={true} />);
        expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0);
    });
});
