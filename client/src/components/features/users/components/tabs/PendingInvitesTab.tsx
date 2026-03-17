import { Button } from '@/components/ui/buttons/button';
import { Mail, RefreshCw } from 'lucide-react';

// Note: Pending invites are not currently supported by the backend API.
// This shows an honest limited-data state.
export function PendingInvitesTab() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-amber-100 p-4 mb-4">
                <Mail className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Pending Invites Not Available</h3>
            <p className="text-slate-500 max-w-sm">
                The backend does not currently support pending invite tracking. 
                User invitations are handled through the user creation process.
            </p>
            <p className="text-sm text-slate-400 mt-4">
                Backend API support required: /users/invites endpoint
            </p>
        </div>
    );
}

