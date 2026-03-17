import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/buttons/button';
import { DataTable, ColumnDef } from '@/components/ui/data-display/DataTable';
import { Plus, Loader2 } from 'lucide-react';
import { SideDrawer } from '@/components/ui/overlays/SideDrawer';
import { helpService } from '@/services/resources/help.service';
import type { SupportTicket, TicketPriority, TicketStatus } from '@/types/help';

interface TicketRow {
    id: string;
    subject: string;
    status: TicketStatus;
    priority: TicketPriority;
    lastUpdated: string;
}

const statusClassMap: Record<TicketStatus, string> = {
    Open: 'text-blue-600 bg-blue-50',
    'In Progress': 'text-orange-600 bg-orange-50',
    Resolved: 'text-green-600 bg-green-50',
    Closed: 'text-zinc-600 bg-zinc-100',
};

const priorityClassMap: Record<TicketPriority, string> = {
    Low: 'border-gray-200 text-gray-700',
    Medium: 'border-blue-200 text-blue-700',
    High: 'border-red-200 text-red-700',
    Critical: 'border-red-300 text-red-800 bg-red-50',
};

function toRelativeLabel(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';

    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function mapTicketToRow(ticket: SupportTicket): TicketRow {
    return {
        id: ticket?.id || 'N/A',
        subject: ticket?.subject || 'Untitled ticket',
        status: (ticket?.status || 'Open') as TicketStatus,
        priority: (ticket?.priority || 'Medium') as TicketPriority,
        lastUpdated: toRelativeLabel(ticket?.updatedAt),
    };
}

export function SupportTickets() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [tickets, setTickets] = useState<TicketRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [backendLimited, setBackendLimited] = useState(false);

    const [priorities, setPriorities] = useState<TicketPriority[]>(['Low', 'Medium', 'High', 'Critical']);
    const [categories, setCategories] = useState<string[]>([]);

    const [newTicket, setNewTicket] = useState<{
        subject: string;
        desc: string;
        priority: TicketPriority;
        category: string;
    }>({
        subject: '',
        desc: '',
        priority: 'Medium',
        category: '',
    });

    useEffect(() => {
        let alive = true;

        const loadData = async () => {
            setIsLoading(true);
            setLoadError(null);

            const [ticketRes, prioritiesRes, categoriesRes] = await Promise.all([
                helpService.getTickets({ page: 1, limit: 20 }),
                helpService.getTicketPriorities(),
                helpService.getTicketCategories(),
            ]);

            if (!alive) return;

            const safeRows = Array.isArray(ticketRes?.data)
                ? ticketRes.data.map(mapTicketToRow)
                : [];

            setTickets(safeRows);
            setPriorities(
                Array.isArray(prioritiesRes) && prioritiesRes.length > 0
                    ? (prioritiesRes.filter(Boolean) as TicketPriority[])
                    : ['Low', 'Medium', 'High', 'Critical']
            );
            setCategories(Array.isArray(categoriesRes) ? categoriesRes.filter(Boolean) : []);

            const status = helpService.getServiceStatus();
            const limited = !status.ticketsAvailable;
            setBackendLimited(limited);

            if (limited && safeRows.length === 0) {
                setLoadError('Tickets backend is unavailable right now. You can still submit a request and retry later.');
            }

            setIsLoading(false);
        };

        loadData();

        return () => {
            alive = false;
        };
    }, []);

    const columns: ColumnDef<TicketRow>[] = useMemo(() => [
        { accessorKey: 'id', header: 'ID' },
        {
            accessorKey: 'subject',
            header: 'Subject',
            cell: ({ row }) => <span className="font-medium">{row.original.subject}</span>
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                const cls = statusClassMap[status] || 'text-zinc-600 bg-zinc-100';
                return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
            }
        },
        {
            accessorKey: 'priority',
            header: 'Priority',
            cell: ({ row }) => {
                const priority = row.original.priority;
                const cls = priorityClassMap[priority] || 'border-gray-200 text-gray-700';
                return (
                    <span className={`px-2 py-1 rounded text-xs border ${cls}`}>
                        {priority}
                    </span>
                );
            }
        },
        { accessorKey: 'lastUpdated', header: 'Last Updated' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    title="Thread view requires backend ticket messages endpoint readiness."
                >
                    View
                </Button>
            )
        }
    ], []);

    const resetForm = () => {
        setNewTicket({ subject: '', desc: '', priority: 'Medium', category: '' });
        setFormError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        const trimmedSubject = newTicket.subject.trim();
        const trimmedDesc = newTicket.desc.trim();

        if (!trimmedSubject || !trimmedDesc) {
            setFormError('Subject and description are required.');
            return;
        }

        setIsSubmitting(true);
        const created = await helpService.createTicket({
            subject: trimmedSubject,
            description: trimmedDesc,
            priority: newTicket.priority,
            category: newTicket.category || undefined,
        });
        setIsSubmitting(false);

        if (!created) {
            setFormError('Ticket could not be created because backend support is currently unavailable.');
            return;
        }

        setTickets((prev) => [mapTicketToRow(created), ...prev]);
        setBackendLimited(false);
        setIsCreateOpen(false);
        resetForm();
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border">
                <div>
                    <h3 className="font-semibold text-lg">My Support Tickets</h3>
                    <p className="text-sm text-muted-foreground">Track the status of your requests and issues.</p>
                    {backendLimited && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Live ticket sync is limited. Some actions are read-only until support APIs are fully available.
                        </p>
                    )}
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Ticket
                </Button>
            </div>

            {isLoading ? (
                <div className="border rounded-lg bg-card p-10 text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading tickets...</span>
                </div>
            ) : loadError ? (
                <div className="border rounded-lg bg-card p-6 text-sm text-muted-foreground">{loadError}</div>
            ) : (
                <DataTable
                    data={tickets}
                    columns={columns}
                />
            )}

            <SideDrawer
                open={isCreateOpen}
                onOpenChange={(open) => {
                    setIsCreateOpen(open);
                    if (!open) resetForm();
                }}
                title="Create Support Ticket"
                description="Describe your issue in detail so our team can help you."
            >
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <input
                            required
                            className="w-full p-2 border rounded-md"
                            placeholder="e.g., Cannot export PDF"
                            value={newTicket.subject}
                            onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Priority</label>
                        <select
                            className="w-full p-2 border rounded-md"
                            value={newTicket.priority}
                            onChange={e => setNewTicket({ ...newTicket, priority: e.target.value as TicketPriority })}
                        >
                            {priorities.map((priority) => (
                                <option key={priority} value={priority}>{priority}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <select
                            className="w-full p-2 border rounded-md"
                            value={newTicket.category}
                            onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                        >
                            <option value="">General</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                            required
                            className="w-full p-2 border rounded-md min-h-[120px]"
                            placeholder="Please provide details..."
                            value={newTicket.desc}
                            onChange={e => setNewTicket({ ...newTicket, desc: e.target.value })}
                        />
                    </div>

                    {formError && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                            {formError}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Submitting...
                                </span>
                            ) : 'Submit Ticket'}
                        </Button>
                    </div>
                </form>
            </SideDrawer>
        </div>
    );
}
