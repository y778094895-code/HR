import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/cards/card';

interface RestrictedViewProps {
    message?: string;
    title?: string;
}

export function RestrictedView({
    title = 'محتوى مقيد بحدود الصلاحية',
    message = 'غير مصرح لك باستعراض هذه التفاصيل بناءً على قواعد خصوصية وسرية البيانات.'
}: RestrictedViewProps) {
    return (
        <Card className="border-dashed border-2 bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <ShieldAlert className="h-8 w-8 text-destructive" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground">{message}</p>
                </div>
            </CardContent>
        </Card>
    );
}
