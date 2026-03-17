import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function RiskMatrix() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Organization Risk Matrix</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
                    <p className="text-muted-foreground">Risk Heatmap Visualization (Placeholder)</p>
                </div>
            </CardContent>
        </Card>
    );
}
