/**
 * @deprecated This component has been replaced by the inline AlertDetailsPanel.
 * See AlertDetailsPanel.tsx for the new implementation.
 * This stub is kept for backward compatibility — it should not be imported anywhere.
 */
import React from 'react';

interface AlertDrawerProps {
    alert?: any;
    isOpen?: boolean;
    onClose?: () => void;
}

export function AlertDrawer({ isOpen, onClose }: AlertDrawerProps) {
    return null;
}
