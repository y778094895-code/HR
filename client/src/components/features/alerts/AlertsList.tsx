/**
 * @deprecated This component has been replaced by the Alerts Center split-pane layout.
 * See AlertListPanel.tsx and AlertFilters.tsx for the new implementation.
 * This stub is kept for backward compatibility — it should not be imported anywhere.
 */
import React from 'react';

export function AlertsList() {
    return (
        <div className="p-8 text-center text-muted-foreground">
            <p>This component has been replaced by the Alerts Center.</p>
            <p>Navigate to /dashboard/alerts to use the new interface.</p>
        </div>
    );
}
