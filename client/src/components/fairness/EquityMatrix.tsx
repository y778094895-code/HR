import React from 'react';

const EquityMatrix: React.FC = () => {
    return (
        <div className="p-4 border rounded-lg bg-white overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4">Pay & Performance Equity Matrix</h3>
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left">Category</th>
                        <th className="px-4 py-2 text-right">Avg Salary</th>
                        <th className="px-4 py-2 text-right">Avg Rating</th>
                        <th className="px-4 py-2 text-right">Gap</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    <tr>
                        <td className="px-4 py-2">Male</td>
                        <td className="px-4 py-2 text-right">$75,000</td>
                        <td className="px-4 py-2 text-right">4.2</td>
                        <td className="px-4 py-2 text-right">--</td>
                    </tr>
                    <tr>
                        <td className="px-4 py-2">Female</td>
                        <td className="px-4 py-2 text-right">$73,500</td>
                        <td className="px-4 py-2 text-right">4.3</td>
                        <td className="px-4 py-2 text-right text-red-500">-2%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default EquityMatrix;
