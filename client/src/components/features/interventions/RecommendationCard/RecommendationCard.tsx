import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/cards/card";
import { Button } from "@/components/ui/buttons/button";
import { Badge } from "@/components/ui/data-display/badge";
import { X, ArrowUpRight } from "lucide-react";

export interface Recommendation {
    id: string;
    employeeId: string;
    title: string;
    description: string;
    logic: string;
    confidenceScore: string;
    status: string;
    suggestedInterventionType: string;
}

export interface RecommendationCardProps {
    recommendation: Recommendation;
    onAction: (id: string, action: 'accept' | 'reject' | 'apply') => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onAction }) => {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <Badge variant="outline">{recommendation.suggestedInterventionType}</Badge>
                    <Badge variant="secondary">{Math.round(parseFloat(recommendation.confidenceScore) * 100)}% Confidence</Badge>
                </div>
                <CardTitle className="mt-2 text-xl">{recommendation.title}</CardTitle>
                <CardDescription>{recommendation.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="text-sm font-medium text-muted-foreground mb-2">AI Logic:</div>
                <p className="text-sm">{recommendation.logic}</p>
            </CardContent>
            <CardFooter className="flex gap-2">
                {recommendation.status === 'generated' ? (
                    <>
                        <Button variant="outline" size="sm" onClick={() => onAction(recommendation.id, 'reject')} className="flex-1">
                            <X className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button size="sm" onClick={() => onAction(recommendation.id, 'apply')} className="flex-1">
                            <ArrowUpRight className="w-4 h-4 mr-2" /> Apply
                        </Button>
                    </>
                ) : (
                    <div className="w-full text-center py-2 bg-muted rounded text-xs uppercase font-bold tracking-wider">
                        {recommendation.status}
                    </div>
                )}
            </CardFooter>
        </Card>
    );
};

export default RecommendationCard;
