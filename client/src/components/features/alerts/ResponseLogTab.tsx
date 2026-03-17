import React, { useMemo, useState } from 'react';
import { useAlertStore } from '@/stores/business/alert.store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Clock, TrendingUp, Zap, ShieldCheck, Filter, Search } from 'lucide-react';
import { AlertStatus } from '@/types/alerts';

export function ResponseLogTab() {
    const [searchTerm, setSearchTerm] = useState('');
    const { alerts } = useAlertStore();

    // Extract all events from all alerts in store
    const allEvents = useMemo(() => {
        return (alerts as any[]).flatMap(a =>
            ((a as any).auditTrail || []).map((event: any) => ({
                ...event,
                alertTitle: a.title,
                alertIdLabel: a.id,
                severity: a.severity
            }))
        ).sort((a, b) => {
            const timeA = new Date(a.at || a.time || 0).getTime();
            const timeB = new Date(b.at || b.time || 0).getTime();
            return timeB - timeA;
        });
    }, [alerts]);

    const filteredEvents = useMemo(() => {
        if (!searchTerm) return allEvents;
        const q = searchTerm.toLowerCase();
        return allEvents.filter(e =>
            e.action.toLowerCase().includes(q) ||
            (e.actorName || '').toLowerCase().includes(q) ||
            (e.note && e.note.toLowerCase().includes(q)) ||
            e.alertIdLabel.toLowerCase().includes(q)
        );
    }, [allEvents, searchTerm]);

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background">
            {/* 1) KPI Section */}
            <div className="p-4 md:p-6 border-b border-border/50 bg-card/30">
                <h3 className="text-sm font-semibold mb-4 text-foreground/80">مؤشرات الأداء التشغيلية للاستجابة</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="shadow-sm border-border/50 bg-white/50 dark:bg-black/20">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium mb-1">متوسط الاستجابة (MTTA)</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold font-mono">12m</span>
                                    <span className="text-xs text-emerald-500 mb-1 font-medium">-2m عن الشهر الماضي</span>
                                </div>
                            </div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                                <Zap className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-border/50 bg-white/50 dark:bg-black/20">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium mb-1">متوسط الحل (MTTR)</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold font-mono">4.2h</span>
                                    <span className="text-xs text-amber-500 mb-1 font-medium">+0.5h</span>
                                </div>
                            </div>
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                                <Clock className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-border/50 bg-white/50 dark:bg-black/20">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium mb-1">معدل التصعيد</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold font-mono">8%</span>
                                    <span className="text-xs text-emerald-500 mb-1 font-medium">مستقر</span>
                                </div>
                            </div>
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-border/50 bg-white/50 dark:bg-black/20">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium mb-1">الامتثال للـ SLA</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">96.5%</span>
                                </div>
                            </div>
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* 2) Filters Section */}
            <div className="px-4 py-3 border-b border-border/50 bg-background flex flex-wrap items-center gap-3 w-full">
                <div className="relative w-full md:w-64">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="بحث في السجل..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full text-sm border border-border/60 bg-muted/30 rounded-md h-9 ps-9 pe-3 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar flex-1">
                    <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-muted text-xs whitespace-nowrap"><Filter className="w-3 h-3 inline-block me-1" /> كل الإجراءات</Badge>
                    <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-muted text-xs whitespace-nowrap">المنفذ: الجميع</Badge>
                    <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-muted text-xs whitespace-nowrap">القسم: الكل</Badge>
                    <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-muted text-xs whitespace-nowrap">اليوم</Badge>
                </div>
            </div>

            {/* 3) Data Table Section */}
            <div className="flex-1 overflow-auto bg-card/20 p-4">
                <div className="border border-border/40 rounded-xl overflow-hidden bg-background shadow-sm">
                    <table className="w-full text-start text-sm">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border/40 text-muted-foreground">
                                <th className="font-medium p-3 text-start">الوقت</th>
                                <th className="font-medium p-3 text-start">معرف التنبيه</th>
                                <th className="font-medium p-3 text-start">الإجراء</th>
                                <th className="font-medium p-3 text-start">المنفذ</th>
                                <th className="font-medium p-3 text-start">تغيير الحالة</th>
                                <th className="font-medium p-3 text-start">القناة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.length > 0 ? filteredEvents.map((evt, i) => (
                                <tr key={evt.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors group">
                                    <td className="p-3 text-xs text-muted-foreground/80 font-mono whitespace-nowrap">
                                        {new Date(evt.at).toLocaleString('ar-SA')}
                                    </td>
                                    <td className="p-3 font-medium text-primary hover:underline cursor-pointer">
                                        {evt.alertIdLabel}
                                    </td>
                                    <td className="p-3">
                                        <span className="font-semibold text-foreground/90">{evt.action}</span>
                                        {evt.note && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 group-hover:line-clamp-none max-w-xs">{evt.note}</p>}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-foreground/80 border border-border/30">
                                                {evt.actorName || 'System'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        {evt.fromStatus && evt.toStatus ? (
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <span className="line-through opacity-70">{evt.fromStatus}</span>
                                                <span>{'->'}</span>
                                                <span className="text-foreground font-medium">{evt.toStatus}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground/40 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                            {/* @ts-ignore - legacy channel field */}
                                            {evt.channel || 'UI'}
                                        </Badge>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-muted-foreground">
                                        <Filter className="h-8 w-8 mx-auto opacity-30 mb-2" />
                                        <p className="text-sm">لم يتم العثور على سجلات تطابق عوامل التصفية الحالية.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
