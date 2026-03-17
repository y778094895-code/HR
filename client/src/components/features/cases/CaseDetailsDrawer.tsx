import React, { useState } from 'react';
import { SideDrawer } from '@/components/ui/overlays/SideDrawer';
import { HRCase, useCaseStore, CaseStatus } from '@/stores/business/case.store';
import { Button } from '@/components/ui/buttons/button';
import { Badge } from '@/components/ui/data-display/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/navigation/tabs';

interface CaseDetailsDrawerProps {
    hrCase: HRCase;
    isOpen: boolean;
    onClose: () => void;
}

export function CaseDetailsDrawer({ hrCase, isOpen, onClose }: CaseDetailsDrawerProps) {
    const { updateCaseStatus, addIntervention } = useCaseStore();
    const [newInterventionTitle, setNewInterventionTitle] = useState('');

    const handleStatusChange = (status: CaseStatus) => {
        updateCaseStatus(hrCase.id, status);
    };

    const handleAddIntervention = () => {
        if (!newInterventionTitle.trim()) return;
        addIntervention(hrCase.id, {
            title: newInterventionTitle,
            description: 'تم إضافة تدخل يدوي جديد من قبل مدير الموارد البشرية',
            type: 'manual'
        });
        setNewInterventionTitle('');
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return 'مفتوحة';
            case 'in_progress': return 'قيد التنفيذ';
            case 'under_review': return 'تحت المراجعة';
            case 'closed': return 'مغلقة';
            default: return status;
        }
    };

    return (
        <SideDrawer
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
            title={`تفاصيل الحالة: ${hrCase.id}`}
            className="w-[600px] sm:w-[500px]"
            footer={
                <div className="flex justify-between items-center w-full">
                    <div className="flex gap-2">
                        {hrCase.status !== 'closed' && (
                            <Button variant="outline" onClick={() => handleStatusChange('closed')}>
                                إغلاق الحالة
                            </Button>
                        )}
                        {hrCase.status === 'open' && (
                            <Button variant="default" onClick={() => handleStatusChange('in_progress')}>
                                البدء بالتنفيذ
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold mb-2">{hrCase.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant={hrCase.status === 'open' ? 'default' : 'secondary'}>
                            {getStatusLabel(hrCase.status)}
                        </Badge>
                        <Badge variant="outline">
                            المسؤول: {hrCase.ownerName || 'غير معين'}
                        </Badge>
                        {hrCase.employeeName && (
                            <Badge variant="outline">
                                الموظف: {hrCase.employeeName}
                            </Badge>
                        )}
                        <Badge variant="outline">
                            آخر تحديث: {new Date(hrCase.updatedAt).toLocaleDateString('ar-SA')}
                        </Badge>
                    </div>
                </div>

                <Tabs defaultValue="summary">
                    <TabsList className="w-full flex justify-between overflow-x-auto">
                        <TabsTrigger value="summary">الملخص</TabsTrigger>
                        <TabsTrigger value="signals">الإشارات</TabsTrigger>
                        <TabsTrigger value="actions">التدخلات</TabsTrigger>
                        <TabsTrigger value="monitoring">المراقبة</TabsTrigger>
                        <TabsTrigger value="impact">تحليل الأثر</TabsTrigger>
                        <TabsTrigger value="notes">الملاحظات/المرفقات</TabsTrigger>
                        <TabsTrigger value="audit">السجل</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="p-4 bg-muted/50 rounded-md mt-4">
                        <h4 className="font-medium mb-2">وصف الحالة</h4>
                        <p className="text-sm text-muted-foreground">{hrCase.description}</p>
                    </TabsContent>

                    <TabsContent value="signals" className="p-4 bg-muted/50 rounded-md mt-4">
                        <h4 className="font-medium mb-2">الإشارات المرتبطة</h4>
                        {hrCase.sourceAlertId ? (
                            <div className="border border-border p-3 rounded text-sm text-card-foreground">
                                مسار الإشارة المرجعي: <span className="font-mono text-xs">{hrCase.sourceAlertId}</span>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">لا توجد إشارات نظامية مرتبطة بهذه الحالة.</p>
                        )}
                    </TabsContent>

                    <TabsContent value="actions" className="p-4 bg-muted/50 rounded-md mt-4">
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="إضافة تدخل جديد..."
                                value={newInterventionTitle}
                                onChange={e => setNewInterventionTitle(e.target.value)}
                            />
                            <Button size="sm" onClick={handleAddIntervention}>إضافة</Button>
                        </div>
                        <ul className="space-y-3">
                            {hrCase.interventions.length > 0 ? hrCase.interventions.map(i => (
                                <li key={i.id} className="border-l-2 border-primary pl-4 rtl:pr-4 rtl:pl-0 rtl:border-r-2 rtl:border-l-0">
                                    <div className="text-sm font-medium">{i.title}</div>
                                    <div className="text-xs text-muted-foreground">{new Date(i.date).toLocaleDateString('ar-SA')} - {i.description}</div>
                                </li>
                            )) : <p className="text-sm text-muted-foreground">لم يتم اتخاذ أي تدابير بعد.</p>}
                        </ul>
                    </TabsContent>

                    <TabsContent value="monitoring" className="p-4 bg-muted/50 rounded-md mt-4">
                        <div className="text-center p-8 text-sm text-muted-foreground">
                            لوحة مراقبة الحالة (قريباً)
                        </div>
                    </TabsContent>

                    <TabsContent value="impact" className="p-4 bg-muted/50 rounded-md mt-4">
                        <div className="text-center p-8 text-sm text-muted-foreground">
                            سيتم حساب الأثر الفعلي بعد إغلاق الحالة بشهر واحد ومقارنة الأداء أو المخاطر.
                        </div>
                    </TabsContent>

                    <TabsContent value="notes" className="p-4 bg-muted/50 rounded-md mt-4">
                        <div className="text-center p-8 text-sm text-muted-foreground">
                            الملاحظات والمرفقات (قريباً)
                        </div>
                    </TabsContent>

                    <TabsContent value="audit" className="p-4 bg-muted/50 rounded-md mt-4">
                        <ul className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                            {hrCase.timeline.map(t => (
                                <li key={t.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active text-sm">
                                    <div className="bg-slate-100 p-2 rounded border">{t.description} <br /><span className="text-xs text-muted-foreground">{new Date(t.date).toLocaleString('ar-SA')}</span></div>
                                </li>
                            ))}
                        </ul>
                    </TabsContent>
                </Tabs>
            </div>
        </SideDrawer>
    );
}
