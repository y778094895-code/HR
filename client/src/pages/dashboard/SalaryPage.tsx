import React, { useState, useEffect, useCallback } from 'react';
import { salaryService, SalaryRecord, SalaryListResponse } from '../../services/resources/salary.service';

// ── Helpers ───────────────────────────────────────────────────────────────────
const num = (v: any) => (v ? parseFloat(v) : 0);
const fmt = (v: any) => num(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processed: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
};

const EMPTY_FORM: Partial<SalaryRecord> = {
    employeeId: '',
    salaryMonth: '',
    salaryStructure: '',
    basicSalary: '0',
    houseRentAllowance: '0',
    conveyanceAllowance: '0',
    medicalAllowance: '0',
    specialAllowance: '0',
    otherAllowances: '0',
    professionalTax: '0',
    providentFund: '0',
    incomeTax: '0',
    otherDeductions: '0',
    bonus: '0',
    overtimePay: '0',
    incentives: '0',
    paymentStatus: 'pending',
    paymentDate: '',
    paymentReference: '',
    remarks: '',
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function SalaryPage() {
    const [data, setData] = useState<SalaryListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modal state
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<SalaryRecord | null>(null);
    const [viewRecord, setViewRecord] = useState<SalaryRecord | null>(null);
    const [form, setForm] = useState<Partial<SalaryRecord>>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchSalaries = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, any> = { page, pageSize: 20 };
            if (search) params.search = search;
            if (statusFilter) params.paymentStatus = statusFilter;
            const result = await salaryService.getSalaries(params);
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Failed to load salary data');
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => { fetchSalaries(); }, [fetchSalaries]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setFormError(null);
        setShowForm(true);
    };

    const openEdit = async (id: string) => {
        try {
            const record = await salaryService.getSalaryById(id);
            setEditing(record);
            setForm(record);
            setFormError(null);
            setShowForm(true);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const openView = async (id: string) => {
        try {
            const record = await salaryService.getSalaryById(id);
            setViewRecord(record);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this salary record?')) return;
        try {
            await salaryService.deleteSalary(id);
            fetchSalaries();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFormError(null);
        try {
            if (!form.employeeId || !form.salaryMonth || !form.basicSalary) {
                throw new Error('Employee ID, Salary Month, and Basic Salary are required');
            }
            if (editing) {
                await salaryService.updateSalary(editing.id, form);
            } else {
                await salaryService.createSalary(form);
            }
            setShowForm(false);
            fetchSalaries();
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Salary Management</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View and manage employee salary records</p>
                </div>
                <button
                    onClick={openCreate}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                    + New Salary Record
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <input
                    type="text"
                    placeholder="Search by employee name..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm w-64"
                />
                <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processed">Processed</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                </select>
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
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Department</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Month</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">Basic Salary</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Status</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.items?.length ? data.items.map((row) => (
                                <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{row.employeeName || row.employeeId?.substring(0, 8)}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.department || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.salaryMonth}</td>
                                    <td className="px-4 py-3 text-right font-mono text-gray-900 dark:text-gray-100">{fmt(row.basicSalary)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[row.paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
                                            {row.paymentStatus}
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
                                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">No salary records found</td>
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
                            className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Previous
                        </button>
                        <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* View Detail Modal */}
            {viewRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setViewRecord(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Salary Detail</h2>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><span className="text-gray-500">Month:</span> <span className="font-medium">{viewRecord.salaryMonth}</span></div>
                            <div><span className="text-gray-500">Status:</span> <span className="font-medium">{viewRecord.paymentStatus}</span></div>
                            <div><span className="text-gray-500">Basic:</span> <span className="font-mono">{fmt(viewRecord.basicSalary)}</span></div>
                            <div><span className="text-gray-500">Net Salary:</span> <span className="font-mono font-bold text-green-700">{fmt(viewRecord.netSalary)}</span></div>
                            <div><span className="text-gray-500">Total Allowances:</span> <span className="font-mono">{fmt(viewRecord.totalAllowances)}</span></div>
                            <div><span className="text-gray-500">Total Deductions:</span> <span className="font-mono">{fmt(viewRecord.totalDeductions)}</span></div>
                            <div><span className="text-gray-500">Bonus:</span> <span className="font-mono">{fmt(viewRecord.bonus)}</span></div>
                            <div><span className="text-gray-500">Total Earnings:</span> <span className="font-mono font-bold">{fmt(viewRecord.totalEarnings)}</span></div>
                            {viewRecord.paymentDate && <div className="col-span-2"><span className="text-gray-500">Payment Date:</span> {viewRecord.paymentDate}</div>}
                            {viewRecord.remarks && <div className="col-span-2"><span className="text-gray-500">Remarks:</span> {viewRecord.remarks}</div>}
                        </div>
                        <button onClick={() => setViewRecord(null)} className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">Close</button>
                    </div>
                </div>
            )}

            {/* Create / Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                            {editing ? 'Edit Salary Record' : 'New Salary Record'}
                        </h2>

                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">{formError}</div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Core fields */}
                                <FormField label="Employee ID *" value={form.employeeId || ''} onChange={v => updateField('employeeId', v)} disabled={!!editing} />
                                <FormField label="Salary Month *" type="date" value={form.salaryMonth || ''} onChange={v => updateField('salaryMonth', v)} disabled={!!editing} />
                                <FormField label="Salary Structure" value={form.salaryStructure || ''} onChange={v => updateField('salaryStructure', v)} />
                                <FormField label="Basic Salary *" type="number" value={form.basicSalary || '0'} onChange={v => updateField('basicSalary', v)} />

                                {/* Allowances */}
                                <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Allowances</div>
                                <FormField label="House Rent" type="number" value={form.houseRentAllowance || '0'} onChange={v => updateField('houseRentAllowance', v)} />
                                <FormField label="Conveyance" type="number" value={form.conveyanceAllowance || '0'} onChange={v => updateField('conveyanceAllowance', v)} />
                                <FormField label="Medical" type="number" value={form.medicalAllowance || '0'} onChange={v => updateField('medicalAllowance', v)} />
                                <FormField label="Special" type="number" value={form.specialAllowance || '0'} onChange={v => updateField('specialAllowance', v)} />
                                <FormField label="Other Allowances" type="number" value={form.otherAllowances || '0'} onChange={v => updateField('otherAllowances', v)} />

                                {/* Deductions */}
                                <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Deductions</div>
                                <FormField label="Professional Tax" type="number" value={form.professionalTax || '0'} onChange={v => updateField('professionalTax', v)} />
                                <FormField label="Provident Fund" type="number" value={form.providentFund || '0'} onChange={v => updateField('providentFund', v)} />
                                <FormField label="Income Tax" type="number" value={form.incomeTax || '0'} onChange={v => updateField('incomeTax', v)} />
                                <FormField label="Other Deductions" type="number" value={form.otherDeductions || '0'} onChange={v => updateField('otherDeductions', v)} />

                                {/* Extras */}
                                <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Additional</div>
                                <FormField label="Bonus" type="number" value={form.bonus || '0'} onChange={v => updateField('bonus', v)} />
                                <FormField label="Overtime Pay" type="number" value={form.overtimePay || '0'} onChange={v => updateField('overtimePay', v)} />
                                <FormField label="Incentives" type="number" value={form.incentives || '0'} onChange={v => updateField('incentives', v)} />

                                {/* Payment */}
                                <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Payment</div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                                    <select value={form.paymentStatus || 'pending'} onChange={e => updateField('paymentStatus', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm">
                                        <option value="pending">Pending</option>
                                        <option value="processed">Processed</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                                <FormField label="Payment Date" type="date" value={form.paymentDate || ''} onChange={v => updateField('paymentDate', v)} />
                                <FormField label="Payment Reference" value={form.paymentReference || ''} onChange={v => updateField('paymentReference', v)} />
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Remarks</label>
                                    <textarea value={form.remarks || ''} onChange={e => updateField('remarks', e.target.value)} rows={2}
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

// ── Reusable Form Field ───────────────────────────────────────────────────────
function FormField({ label, value, onChange, type = 'text', disabled = false }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
                step={type === 'number' ? '0.01' : undefined}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm disabled:opacity-60" />
        </div>
    );
}
