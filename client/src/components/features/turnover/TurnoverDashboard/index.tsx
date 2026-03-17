import React from 'react';
import TurnoverDashboard from './TurnoverDashboard';
import useTurnover from '../hooks/useTurnover';

const TurnoverContainer: React.FC = () => {
    const {
        risks,
        prediction,
        loading
    } = useTurnover();

    return (
        <TurnoverDashboard
            risks={risks}
            prediction={prediction}
            loading={loading}
        />
    );
};

export default TurnoverContainer;
