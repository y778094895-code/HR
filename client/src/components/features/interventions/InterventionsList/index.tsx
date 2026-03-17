import React from 'react';
import InterventionsList from './InterventionsList';
import useInterventions from '../hooks/useInterventions';

const InterventionsListContainer: React.FC = () => {
    const {
        interventions,
        loading,
        updateStatus
    } = useInterventions();

    return (
        <InterventionsList
            interventions={interventions}
            loading={loading}
            onUpdateStatus={updateStatus}
        />
    );
};

export default InterventionsListContainer;
