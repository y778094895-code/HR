import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { Progress } from '@/components/ui/feedback/progress';

export const GapAnalysis: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Demographic Gap Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span>Gender Pay Gap</span>
                        <span className="font-bold">2.1%</span>
                    </div>
                    {/* Using div for custom color progress as shadcn Progress is usually one color */}
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-2 w-[21%]"></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span>Promotion Rate Gap</span>
                        <span className="font-bold">0.5%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-2 w-[5%]"></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default GapAnalysis;
