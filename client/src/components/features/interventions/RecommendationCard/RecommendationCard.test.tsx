import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RecommendationCard, Recommendation } from './RecommendationCard';

const mockRecommendation: Recommendation = {
    id: '1',
    employeeId: '101',
    title: 'Training Required',
    description: 'Skill gap in React',
    logic: 'Performance drop in frontend tasks',
    confidenceScore: '0.85',
    status: 'generated',
    suggestedInterventionType: 'Training'
};

describe('RecommendationCard', () => {
    it('renders recommendation details', () => {
        render(<RecommendationCard recommendation={mockRecommendation} onAction={() => { }} />);
        expect(screen.getByText('Training Required')).toBeInTheDocument();
        expect(screen.getByText('85% Confidence')).toBeInTheDocument();
    });

    it('renders actions when status is generated', () => {
        render(<RecommendationCard recommendation={mockRecommendation} onAction={() => { }} />);
        expect(screen.getByText('Reject')).toBeInTheDocument();
        expect(screen.getByText('Apply')).toBeInTheDocument();
    });

    it('renders status badge when not generated', () => {
        const completedRec = { ...mockRecommendation, status: 'completed' };
        render(<RecommendationCard recommendation={completedRec} onAction={() => { }} />);
        expect(screen.getByText('completed')).toBeInTheDocument();
        expect(screen.queryByText('Apply')).not.toBeInTheDocument();
    });

    it('calls onAction when buttons clicked', () => {
        const onAction = vi.fn();
        render(<RecommendationCard recommendation={mockRecommendation} onAction={onAction} />);
        fireEvent.click(screen.getByText('Apply'));
        expect(onAction).toHaveBeenCalledWith('1', 'apply');
    });
});
