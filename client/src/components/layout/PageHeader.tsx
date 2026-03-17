import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface PageHeaderProps {
    title: React.ReactNode;
    description?: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({ title, description, breadcrumbs, actions, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8", className)}>
            <div className="space-y-1.5 flex-1">
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav className="flex items-center text-sm text-muted-foreground mb-3" aria-label="Breadcrumb">
                        {breadcrumbs.map((crumb, idx) => {
                            const isLast = idx === breadcrumbs.length - 1;
                            return (
                                <div key={idx} className="flex items-center">
                                    {crumb.href && !isLast ? (
                                        <Link to={crumb.href} className="hover:text-foreground transition-colors">
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span className={isLast ? "text-foreground font-medium" : ""}>
                                            {crumb.label}
                                        </span>
                                    )}
                                    {!isLast && (
                                        <ChevronRight className="h-4 w-4 mx-1.5 opacity-50 rtl:rotate-180" />
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {title}
                </h1>
                {description && (
                    <p className="text-base text-muted-foreground max-w-3xl">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
}
