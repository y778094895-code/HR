import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/data-display/table';
import { Button } from '@/components/ui/buttons/button';
import { Badge } from '@/components/ui/data-display/badge';
import { Skeleton } from '@/components/ui/feedback/skeleton';
import { User } from '../hooks/useUsers';
import { getUserDisplayName } from '@/lib/users-normalizer';
import { 
    MoreHorizontal, 
    Power, 
    PowerOff,
    Edit,
    Trash2 
} from 'lucide-react';
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/overlays/dropdown-menu';

interface UserTableProps {
    users: User[];
    loading?: boolean;
    onDelete: (id: string) => void;
    onEdit: (user: User) => void;
    onToggleStatus: (id: string, isActive: boolean) => void;
}

const roleColors: Record<string, string> = {
    admin: 'bg-red-50 text-red-600 border-red-200/50',
    super_admin: 'bg-red-50 text-red-600 border-red-200/50',
    manager: 'bg-indigo-50 text-indigo-600 border-indigo-200/50',
    hr_manager: 'bg-amber-50 text-amber-600 border-amber-200/50',
    employee: 'bg-slate-50 text-slate-600 border-slate-200/50',
};

function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

const UserTable: React.FC<UserTableProps> = ({ 
    users, 
    loading = false, 
    onDelete, 
    onEdit,
    onToggleStatus 
}) => {
    // Defensive: ensure users is always an array
    const safeUsers = Array.isArray(users) ? users : [];

    if (loading && safeUsers.length === 0) {
        return (
            <div className="space-y-4 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="rounded-xl border border-border/60 bg-white shadow-sm p-8 text-center">
                <p className="text-slate-500">No users found</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow>
                        <TableHead className="font-semibold text-slate-900">Full Name</TableHead>
                        <TableHead className="font-semibold text-slate-900">Username</TableHead>
                        <TableHead className="font-semibold text-slate-900">Email</TableHead>
                        <TableHead className="font-semibold text-center text-slate-900">Role</TableHead>
                        <TableHead className="font-semibold text-center text-slate-900">Status</TableHead>
                        <TableHead className="font-semibold text-right text-slate-900">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => {
                        const isActive = (user as any).isActive !== false;
                        const displayName = getUserDisplayName(user);
                        return (
                            <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="font-medium text-slate-900">{displayName}</TableCell>
                                <TableCell className="text-slate-600">{user.username}</TableCell>
                                <TableCell className="text-slate-600 text-sm whitespace-nowrap">{user.email}</TableCell>
                                <TableCell className="text-center">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "px-2.5 py-0.5 rounded-full capitalize text-[11px] font-semibold tracking-wide",
                                            roleColors[user.role?.toLowerCase()] || "bg-slate-100 text-slate-800"
                                        )}
                                    >
                                        {user.role || 'employee'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide",
                                            isActive 
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-200/50" 
                                                : "bg-slate-100 text-slate-500 border-slate-200/50"
                                        )}
                                    >
                                        {isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEdit(user)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => onToggleStatus(user.id, !isActive)}
                                            >
                                                {isActive ? (
                                                    <>
                                                        <PowerOff className="mr-2 h-4 w-4" />
                                                        Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <Power className="mr-2 h-4 w-4" />
                                                        Activate
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => onDelete(user.id)}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default UserTable;
