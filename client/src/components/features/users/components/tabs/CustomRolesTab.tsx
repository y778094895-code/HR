import { Lock } from 'lucide-react';

export function CustomRolesTab() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-slate-100 p-4 mb-4">
                <Lock className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Custom Roles Not Available</h3>
            <p className="text-slate-500 max-w-sm">
                Custom role creation is not currently supported by the backend.
                The system uses predefined roles with fixed permission sets.
            </p>
            <p className="text-sm text-slate-400 mt-4">
                Backend API support required: /roles/custom endpoint
            </p>
        </div>
    );
}

