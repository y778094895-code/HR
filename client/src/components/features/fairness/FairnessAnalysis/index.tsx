import React from 'react';
import FairnessAnalysis from './FairnessAnalysis';
import useFairnessAnalysis from '../hooks/useFairnessAnalysis';

const FairnessAnalysisContainer: React.FC = () => {
    const {
        department,
        setDepartment,
        metrics,
        loading,
        analyzeFairness
    } = useFairnessAnalysis();

    return (
        <FairnessAnalysis
            department={department}
            metrics={metrics}
            loading={loading}
            onDepartmentChange={setDepartment}
            onAnalyze={analyzeFairness}
        />
    );
};

export default FairnessAnalysisContainer;
