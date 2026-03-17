import React from 'react';

const GapAnalysis: React.FC = () => {
    return (
        <div className="p-4 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold mb-4">Demographic Gap Analysis</h3>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span>Gender Pay Gap</span>
                        <span className="font-bold">2.1%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full">
                        <div className="bg-orange-500 h-2 rounded-full w-[21%]"></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span>Promotion Rate Gap</span>
                        <span className="font-bold">0.5%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full">
                        <div className="bg-green-500 h-2 rounded-full w-[5%]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GapAnalysis;
