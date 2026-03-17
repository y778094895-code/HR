import React from 'react';
import { Button } from '@/components/ui/buttons/button';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({
    title = 'Something went wrong',
    message = 'We encountered an error while loading data.',
    onRetry,
    className
}: ErrorStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-destructive/20 bg-destructive/5 animate-in fade-in duration-500", className)}>
            <div className="w-14 h-14 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4 shadow-sm">
                <AlertOctagon className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground tracking-tight mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">{message}</p>

            {onRetry && (
                <Button onClick={onRetry} variant="destructive" className="shadow-sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
            )}
        </div>
    );
}
