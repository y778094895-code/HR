import React from 'react';
import { Button } from '@/components/ui/buttons/button';
import { FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: React.ElementType;
    className?: string;
}

export function EmptyState({
    title = 'No Data Found',
    description = 'There are no records to display at this time.',
    actionLabel,
    onAction,
    className,
    icon: Icon = FileQuestion
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10 animate-in fade-in duration-500", className)}>
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 text-muted-foreground shadow-sm">
                <Icon className="h-8 w-8 opacity-80" />
            </div>
            <h3 className="text-lg font-semibold text-foreground tracking-tight mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">{description}</p>

            {actionLabel && onAction && (
                <Button onClick={onAction} variant="outline" className="shadow-sm">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
