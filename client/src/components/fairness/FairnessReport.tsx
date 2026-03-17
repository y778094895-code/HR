import React from 'react';

const FairnessReport: React.FC = () => {
    return (
        <div className="p-6 border rounded-lg bg-white shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Annual Fairness Audit Report</h2>
            <div className="space-y-6">
                <section>
                    <h3 className="text-lg font-bold border-b pb-2">Executive Summary</h3>
                    <p className="mt-2 text-gray-600">
                        The overall fairness score for the current period is <span className="text-green-600 font-bold">94/100</span>.
                        Most categories show significant alignment with equity standards.
                    </p>
                </section>
                <section>
                    <h3 className="text-lg font-bold border-b pb-2">Identified Disparities</h3>
                    <ul className="mt-2 list-disc list-inside text-gray-600">
                        <li>Minor pay gap in the Engineering department (approx. 3%).</li>
                        <li>Gender representation gap in Leadership roles.</li>
                    </ul>
                </section>
                <div className="text-center mt-8">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Download PDF Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FairnessReport;
