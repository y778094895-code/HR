import { LogIn } from 'lucide-react';

export function LoginHistoryTab() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-slate-100 p-4 mb-4">
                <LogIn className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Login History Not Available</h3>
            <p className="text-slate-500 max-w-sm">
                Login history tracking is not currently supported by the backend.
                Authentication events are managed at the gateway level.
            </p>
            <p className="text-sm text-slate-400 mt-4">
                Backend API support required: /audit/login-history endpoint
            </p>
        </div>
    );
}

