import React from 'react';

interface LoadingSkeletonProps {
    className?: string;
    rows?: number;
    height?: number | string;
}

export function LoadingSkeleton({ rows = 3, height = '3rem', className = '' }: LoadingSkeletonProps) {
    return (
        <div className={`space-y-4 w-full animate-pulse ${className}`}>
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="bg-muted/50 rounded-md w-full"
                    style={{ height }}
                />
            ))}
        </div>
    );
}
