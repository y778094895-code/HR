import { LayoutGrid } from 'lucide-react';

export function FieldLevelTab() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-slate-100 p-4 mb-4">
                <LayoutGrid className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Field-Level Visibility Not Available</h3>
            <p className="text-slate-500 max-w-sm">
                Field-level visibility controls are not currently supported by the backend.
                All fields are visible based on role permissions.
            </p>
            <p className="text-sm text-slate-400 mt-4">
                Backend API support required: /visibility/fields endpoint
            </p>
        </div>
    );
}

