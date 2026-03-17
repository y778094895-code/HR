import { ShieldCheck } from 'lucide-react';

export function PermissionChangesTab() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-slate-100 p-4 mb-4">
                <ShieldCheck className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Permission Changes Not Available</h3>
            <p className="text-slate-500 max-w-sm">
                Permission change audit logging is not currently supported by the backend.
                Role and permission modifications are tracked in system logs.
            </p>
            <p className="text-sm text-slate-400 mt-4">
                Backend API support required: /audit/permission-changes endpoint
            </p>
        </div>
    );
}

