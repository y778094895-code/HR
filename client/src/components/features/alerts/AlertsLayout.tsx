import React, { ReactNode } from 'react';

interface AlertsLayoutProps {
    sidebarContent: ReactNode;
    mainContent: ReactNode;
}

export function AlertsLayout({ sidebarContent, mainContent }: AlertsLayoutProps) {
    return (
        <div className="flex-1 flex overflow-hidden border-t border-border/30 bg-background rtl:flex-row">
            <div className="w-full lg:w-[450px] xl:w-[500px] flex-shrink-0 border-e border-border/50 flex flex-col overflow-hidden bg-muted/10 h-full relative z-10 transition-all duration-300">
                {sidebarContent}
            </div>
            <div className="hidden lg:flex flex-1 flex-col overflow-hidden bg-card/20 h-full relative z-0">
                {mainContent}
            </div>
        </div>
    );
}
