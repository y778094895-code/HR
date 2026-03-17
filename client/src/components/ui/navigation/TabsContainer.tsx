import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { cn } from '@/lib/utils';

export interface TabItem {
    value: string;
    label: string | React.ReactNode;
    icon?: React.ReactNode; // Added icon property
    content: React.ReactNode;
}

interface TabsContainerProps {
    tabs: TabItem[];
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    /**
     * If provided, syncs the active tab with this URL search param key.
     * e.g. syncWithUrl="tab" -> ?tab=overview
     */
    syncWithUrl?: string;
    className?: string;
    contentClassName?: string;
}

export function TabsContainer({
    tabs,
    defaultValue,
    onValueChange,
    syncWithUrl,
    className,
    contentClassName,
}: TabsContainerProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = (syncWithUrl ? searchParams.get(syncWithUrl) : undefined) || defaultValue || tabs[0]?.value;

    const [activeTab, setActiveTab] = useState<string>(initialTab);

    // Sync from URL if changed externally (e.g. back button)
    useEffect(() => {
        if (syncWithUrl) {
            const paramValue = searchParams.get(syncWithUrl);
            if (paramValue && paramValue !== activeTab) {
                setActiveTab(paramValue);
            }
        }
    }, [searchParams, syncWithUrl]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (onValueChange) onValueChange(value);

        if (syncWithUrl) {
            setSearchParams(prev => {
                prev.set(syncWithUrl, value);
                return prev;
            }, { replace: true });
        }
    };

    return (
        <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className={cn("w-full", className)}
        >
            <TabsList className="w-full justify-start overflow-x-auto">
                {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                        {tab.icon && <span>{tab.icon}</span>}
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
            {tabs.map((tab) => (
                <TabsContent
                    key={tab.value}
                    value={tab.value}
                    className={cn("mt-4", contentClassName)}
                >
                    {tab.content}
                </TabsContent>
            ))}
        </Tabs>
    );
}
