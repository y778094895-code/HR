import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TurnoverRiskPredictionCard } from './TurnoverRiskPredictionCard';

describe('TurnoverRiskPredictionCard', () => {
    it('renders input and button', () => {
        render(<TurnoverRiskPredictionCard employeeId="" onEmployeeIdChange={() => { }} onPredict={() => { }} />);
        expect(screen.getByPlaceholderText('Enter Employee ID')).toBeInTheDocument();
        expect(screen.getByText('Predict Risk')).toBeInTheDocument();
    });

    it('calls onPredict when button clicked', () => {
        const onPredict = vi.fn();
        render(<TurnoverRiskPredictionCard employeeId="123" onEmployeeIdChange={() => { }} onPredict={onPredict} />);
        fireEvent.click(screen.getByText('Predict Risk'));
        expect(onPredict).toHaveBeenCalled();
    });

    it('displays risk data when provided', () => {
        const mockData = {
            employeeId: '123',
            riskScore: 0.85,
            riskLevel: 'High',
            contributingFactors: [{ factor: 'Low Salary', impact: 0.8 }],
            retentionProbability: 0.15
        };
        render(<TurnoverRiskPredictionCard employeeId="123" onEmployeeIdChange={() => { }} onPredict={() => { }} data={mockData as any} />);
        expect(screen.getByText('85%')).toBeInTheDocument();
        expect(screen.getByText('High')).toBeInTheDocument();
        expect(screen.getByText('Low Salary')).toBeInTheDocument();
    });
});
