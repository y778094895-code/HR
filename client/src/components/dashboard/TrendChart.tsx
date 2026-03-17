import React from 'react';

const TrendChart: React.FC = () => {
    return (
        <div className="p-4 border rounded-xl bg-white shadow-sm h-64 flex flex-col">
            <h4 className="text-sm font-semibold mb-4 text-gray-700">Performance Over Time</h4>
            <div className="flex-1 flex items-end space-x-2 px-2">
                <div className="flex-1 bg-indigo-100 rounded-t h-[30%]"></div>
                <div className="flex-1 bg-indigo-200 rounded-t h-[45%]"></div>
                <div className="flex-1 bg-indigo-300 rounded-t h-[40%]"></div>
                <div className="flex-1 bg-indigo-400 rounded-t h-[60%]"></div>
                <div className="flex-1 bg-indigo-500 rounded-t h-[75%]"></div>
                <div className="flex-1 bg-indigo-600 rounded-t h-[90%]"></div>
            </div>
        </div>
    );
};

export default TrendChart;
