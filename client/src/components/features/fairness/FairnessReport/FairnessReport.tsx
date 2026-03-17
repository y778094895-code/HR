import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/cards/card';
import { Button } from '@/components/ui/buttons/button';

export const FairnessReport: React.FC = () => {
    return (
        <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className="text-center">Annual Fairness Audit Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        Download PDF Report
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default FairnessReport;
