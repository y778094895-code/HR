import React, { useState, useEffect, useCallback } from 'react';
import { attendanceService, AttendanceRecord, AttendanceListResponse } from '../../services/resources/attendance.service';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtMinutes = (m: number | undefined) => {
    if (!m) return '—';
    const h = Math.floor(m / 60);
    const mins = m % 60;
    return `${h}h ${mins}m`;
};

const ABSENCE_LABELS: Record<string, string> = {
    sick: 'Sick Leave',
    vacation: 'Vacation',
    unpaid: 'Unpaid Leave',
    personal: 'Personal',
    wfh: 'Work From Home',
};

const SOURCE_COLORS: Record<string, string> = {
    biometric: 'bg-blue-100 text-blue-800',
    manual: 'bg-gray-100 text-gray-800',
    system: 'bg-purple-100 text-purple-800',
};

const EMPTY_FORM: Partial<AttendanceRecord> = {
    employeeId: '',
    date: '',
    checkIn: '',
    checkOut: '',
    absenceType: '',
    reason: '',
    source: 'manual',
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function AttendancePage() {
    const [data, setData] = useState<AttendanceListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Modal state
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<AttendanceRecord | null>(null);
    const [viewRecord, setViewRecord] = useState<AttendanceRecord | null>(null);
    const [form, setForm] = useState<Partial<AttendanceRecord>>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchRecords = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, any> = { page, pageSize: 20 };
            if (search) params.search = search;
            if (dateFrom) params.dateFrom = dateFrom;
            if (dateTo) params.dateTo = dateTo;
            const result = await attendanceService.getAttendanceRecords(params);
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    }, [page, search, dateFrom, dateTo]);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setFormError(null);
        setShowForm(true);
    };

    const openEdit = async (id: string) => {
        try {
            const record = await attendanceService.getAttendanceById(id);
            setEditing(record);
            setForm(record);
            setFormError(null);
            setShowForm(true);
        } catch (err: any) { setError(err.message); }
    };

    const openView = async (id: string) => {
        try {
            const record = await attendanceService.getAttendanceById(id);
            setViewRecord(record);
        } catch (err: any) { setError(err.message); }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
        try {
            await attendanceService.deleteAttendance(id);
            fetchRecords();
        } catch (err: any) { setError(err.message); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFormError(null);
        try {
            if (!form.employeeId || !form.date) {
                throw new Error('Employee ID and Date are required');
            }
            if (editing) {
                await attendanceService.updateAttendance(editing.id, form);
            } else {
                await attendanceService.createAttendance(form);
            }
            setShowForm(false);
            fetchRecords();
        } catch (err: any) {
            setFormError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Attendance Management</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage employee attendance records</p>
                </div>
                <button onClick={openCreate}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    + New Record
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <input type="text" placeholder="Search by employee name..."
                    value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm w-56" />
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <span>From</span>
                    <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                        className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm" />
                    <span>To</span>
                    <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                        className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm" />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2 underline">dismiss</button>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Employee</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Date</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Check In</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Check Out</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Work Time</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Absence</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Source</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.items?.length ? data.items.map((row) => (
                                <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{row.employeeName || row.employeeId?.substring(0, 8)}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.date}</td>
                                    <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">{row.checkIn || '—'}</td>
                                    <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">{row.checkOut || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{fmtMinutes(row.workMinutes)}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.absenceType ? (ABSENCE_LABELS[row.absenceType] || row.absenceType) : '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${SOURCE_COLORS[row.source] || 'bg-gray-100 text-gray-800'}`}>
                                            {row.source}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button onClick={() => openView(row.id)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">View</button>
                                        <button onClick={() => openEdit(row.id)} className="text-amber-600 hover:text-amber-800 text-xs font-medium">Edit</button>
                                        <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">No attendance records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Page {data.page} of {data.totalPages} ({data.total} records)</span>
                    <div className="space-x-2">
                        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700">Previous</button>
                        <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700">Next</button>
                    </div>
                </div>
            )}

            {/* View Detail Modal */}
            {viewRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setViewRecord(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Attendance Detail</h2>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><span className="text-gray-500">Date:</span> <span className="font-medium">{viewRecord.date}</span></div>
                            <div><span className="text-gray-500">Source:</span> <span className="font-medium">{viewRecord.source}</span></div>
                            <div><span className="text-gray-500">Check In:</span> <span className="font-mono">{viewRecord.checkIn || '—'}</span></div>
                            <div><span className="text-gray-500">Check Out:</span> <span className="font-mono">{viewRecord.checkOut || '—'}</span></div>
                            <div><span className="text-gray-500">Work Time:</span> <span className="font-mono">{fmtMinutes(viewRecord.workMinutes)}</span></div>
                            <div><span className="text-gray-500">Absence:</span> <span>{viewRecord.absenceType ? (ABSENCE_LABELS[viewRecord.absenceType] || viewRecord.absenceType) : '—'}</span></div>
                            {viewRecord.reason && <div className="col-span-2"><span className="text-gray-500">Reason:</span> {viewRecord.reason}</div>}
                        </div>
                        <button onClick={() => setViewRecord(null)} className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">Close</button>
                    </div>
                </div>
            )}

            {/* Create / Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                            {editing ? 'Edit Attendance Record' : 'New Attendance Record'}
                        </h2>

                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">{formError}</div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Employee ID *</label>
                                    <input type="text" value={form.employeeId || ''} onChange={e => updateField('employeeId', e.target.value)} disabled={!!editing}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm disabled:opacity-60" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date *</label>
                                    <input type="date" value={form.date || ''} onChange={e => updateField('date', e.target.value)} disabled={!!editing}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm disabled:opacity-60" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Check In</label>
                                    <input type="time" value={form.checkIn || ''} onChange={e => updateField('checkIn', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Check Out</label>
                                    <input type="time" value={form.checkOut || ''} onChange={e => updateField('checkOut', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Absence Type</label>
                                    <select value={form.absenceType || ''} onChange={e => updateField('absenceType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm">
                                        <option value="">None (Present)</option>
                                        <option value="sick">Sick Leave</option>
                                        <option value="vacation">Vacation</option>
                                        <option value="unpaid">Unpaid Leave</option>
                                        <option value="personal">Personal</option>
                                        <option value="wfh">Work From Home</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Source</label>
                                    <select value={form.source || 'manual'} onChange={e => updateField('source', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm">
                                        <option value="manual">Manual</option>
                                        <option value="biometric">Biometric</option>
                                        <option value="system">System</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Reason</label>
                                    <textarea value={form.reason || ''} onChange={e => updateField('reason', e.target.value)} rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                    {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
