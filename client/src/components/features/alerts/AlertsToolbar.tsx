import React from 'react';
import { Search, Filter, SortDesc, MoreHorizontal, CheckSquare, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/buttons/button';

interface AlertsToolbarProps {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    selectedCount: number;
    totalCount: number;
    onBulkAcknowledge?: () => void;
    onBulkConvert?: () => void;
}

export function AlertsToolbar({
    searchQuery,
    onSearchChange,
    selectedCount,
    totalCount,
    onBulkAcknowledge,
    onBulkConvert
}: AlertsToolbarProps) {
    return (
        <div className="flex flex-col gap-3 p-4 border-b border-border/50 bg-background/95 backdrop-blur z-10 sticky top-0">
            {/* Top Row: Search and Filters */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="البحث في التنبيهات..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-muted/50 border border-border/50 rounded-md h-9 ps-9 pe-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
                    />
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                    <Settings2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                    <SortDesc className="h-4 w-4" />
                </Button>
            </div>

            {/* Bottom Row: Bulk Actions or Status */}
            <div className="flex items-center justify-between min-h-[32px]">
                {selectedCount > 0 ? (
                    <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                            {selectedCount} محدد
                        </span>
                        <div className="flex items-center gap-1 ms-auto">
                            {onBulkAcknowledge && (
                                <Button variant="secondary" size="sm" className="h-7 text-xs px-2" onClick={onBulkAcknowledge}>
                                    استلام
                                </Button>
                            )}
                            {onBulkConvert && (
                                <Button variant="secondary" size="sm" className="h-7 text-xs px-2" onClick={onBulkConvert}>
                                    تحويل
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-xs text-muted-foreground">
                        إجمالي التنبيهات: <span className="font-medium text-foreground">{totalCount}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
