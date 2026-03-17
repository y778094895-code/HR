import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/overlays/dialog';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/forms/select';
import { useCaseStore, CasePriority } from '@/stores/business/case.store';
import { Briefcase } from 'lucide-react';

interface CreateCaseModalProps {
    open: boolean;
    onClose: () => void;
    /** Optional pre-fill for employee context */
    prefillEmployee?: { id: string; name: string };
}

export default function CreateCaseModal({ open, onClose, prefillEmployee }: CreateCaseModalProps) {
    const navigate = useNavigate();
    const addCase = useCaseStore((s) => s.addCase);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<CasePriority>('medium');
    const [employeeName, setEmployeeName] = useState(prefillEmployee?.name || '');
    const [employeeId, setEmployeeId] = useState(prefillEmployee?.id || '');
    const [submitting, setSubmitting] = useState(false);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setEmployeeName(prefillEmployee?.name || '');
        setEmployeeId(prefillEmployee?.id || '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setSubmitting(true);

        addCase({
            title: title.trim(),
            description: description.trim(),
            priority,
            employeeId: employeeId || undefined,
            employeeName: employeeName || undefined,
            ownerName: 'المستخدم الحالي',
        });

        setTimeout(() => {
            setSubmitting(false);
            resetForm();
            onClose();
            navigate('/dashboard/cases');
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) { resetForm(); onClose(); } }}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Briefcase className="h-5 w-5 text-primary" />
                        إنشاء حالة جديدة
                    </DialogTitle>
                    <DialogDescription>
                        أنشئ حالة جديدة لمتابعة إجراء معين أو معالجة مخاطر
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="case-title">عنوان الحالة *</Label>
                        <Input
                            id="case-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="مثال: معالجة خطر استقالة الموظف"
                            required
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="case-desc">الوصف</Label>
                        <textarea
                            id="case-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="تفاصيل إضافية حول الحالة..."
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        />
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <Label htmlFor="case-priority">الأولوية</Label>
                        <Select value={priority} onValueChange={(v) => setPriority(v as CasePriority)}>
                            <SelectTrigger id="case-priority">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="critical">حرج</SelectItem>
                                <SelectItem value="high">مرتفع</SelectItem>
                                <SelectItem value="medium">متوسط</SelectItem>
                                <SelectItem value="low">منخفض</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Employee (optional) */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="case-emp-name">اسم الموظف</Label>
                            <Input
                                id="case-emp-name"
                                value={employeeName}
                                onChange={(e) => setEmployeeName(e.target.value)}
                                placeholder="اختياري"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="case-emp-id">رقم الموظف</Label>
                            <Input
                                id="case-emp-id"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                placeholder="EMP-XXX"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => { resetForm(); onClose(); }}>
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={!title.trim() || submitting} className="gap-2">
                            {submitting ? (
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <Briefcase className="h-4 w-4" />
                            )}
                            إنشاء الحالة
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
