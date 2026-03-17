import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import InterventionsListContainer from '../InterventionsList';
import RecommendationsListContainer from '../RecommendationsList';
import ImpactSummaryChartContainer from '../ImpactSummaryChart';

const InterventionsDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Interventions & Smart Recommendations</h2>
            </div>

            <ImpactSummaryChartContainer />

            <Tabs defaultValue="interventions" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="interventions">Interventions</TabsTrigger>
                    <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
                </TabsList>
                <TabsContent value="interventions" className="space-y-4">
                    <InterventionsListContainer />
                </TabsContent>
                <TabsContent value="recommendations" className="space-y-4">
                    <RecommendationsListContainer />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default InterventionsDashboard;
