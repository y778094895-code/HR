import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
    message?: string;
    className?: string;
    fullScreen?: boolean;
}

export function LoadingState({ message = 'Loading...', className, fullScreen = false }: LoadingStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center space-y-4 p-8 text-center animate-in fade-in duration-500",
                fullScreen ? "min-h-[60vh]" : "w-full",
                className
            )}
        >
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            {message && (
                <p className="text-sm font-medium text-muted-foreground">{message}</p>
            )}
        </div>
    );
}
