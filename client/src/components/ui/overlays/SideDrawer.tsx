import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from './sheet';

interface SideDrawerProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    /**
     * Side to open from. Defaults to 'right' which is correct for RTL Arabic UX.
     */
    side?: 'top' | 'right' | 'bottom' | 'left';
    /**
     * Optional trigger element to open the drawer
     */
    trigger?: React.ReactNode;
    className?: string;
}

export function SideDrawer({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    side = 'right',
    trigger,
    className,
}: SideDrawerProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
            <SheetContent side={side} className={className}>
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-4">
                    {children}
                </div>
                {footer && <SheetFooter>{footer}</SheetFooter>}
            </SheetContent>
        </Sheet>
    );
}
