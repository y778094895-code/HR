import React, { useState } from 'react';
import { TabsContainer } from '@/components/ui/navigation/TabsContainer';
import { KPICard } from '@/components/ui/data-display/KPICard';
import { Target, AlertTriangle, Link2, CheckCircle, Search, Filter, ShieldAlert, Zap, Baseline, ArrowRightLeft, FileWarning } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/buttons/button';

// --- Tab 1: KPI Definitions (تعريفات مؤشرات الأداء) --- //
const mockKpiData = [
    { id: 'EMP-1021', name: 'أحمد العتيبي', dept: 'تطوير البرمجيات', role: 'مهندس برمجيات أول', score: 94, rating: 'متميز', review: '2026-03-01', status: 'نشط' },
    { id: 'EMP-1045', name: 'سارة الدوسري', dept: 'الموارد البشرية', role: 'أخصائية توظيف', score: 82, rating: 'ضمن المتوقع', review: '2026-02-15', status: 'نشط' },
    { id: 'EMP-1102', name: 'خالد السبيعي', dept: 'المبيعات', role: 'مندوب مبيعات', score: 55, rating: 'دون المتوقع', review: '2026-02-28', status: 'PIP' },
    { id: 'EMP-1205', name: 'نورة المطيري', dept: 'خدمة العملاء', role: 'مشرفة فريق', score: 78, rating: 'ضمن المتوقع', review: '2026-01-10', status: 'نشط' },
];

function KpiDefinitionsTab() {
    const [search, setSearch] = useState('');

    const filtered = mockKpiData.filter(e => e.name.includes(search) || e.role.includes(search) || e.dept.includes(search));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0A1121] border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                        <Target className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold mb-1">التقييمات الممتازة</p>
                        <h4 className="text-2xl font-black text-white" dir="ltr">24%</h4>
                    </div>
                </div>
                <div className="bg-[#0A1121] border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                        <CheckCircle className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold mb-1">ضمن النطاق المتوقع</p>
                        <h4 className="text-2xl font-black text-white" dir="ltr">68%</h4>
                    </div>
                </div>
                <div className="bg-[#0A1121] border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0">
                        <AlertTriangle className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold mb-1">تحت خط الأداء</p>
                        <h4 className="text-2xl font-black text-white" dir="ltr">8%</h4>
                    </div>
                </div>
            </div>

            {/* List Container */}
            <div className="bg-[#0A1121] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                {/* Toolbar */}
                <div className="p-4 border-b border-white/5 bg-white/[0.02] flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="بحث بالاسم، القسم، المسمى..."
                            className="bg-[#0f192b] border border-white/10 text-white text-sm rounded-lg pr-10 pl-4 py-2 w-full focus:outline-none focus:border-primary transition-colors"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" className="bg-[#0f192b] border-white/10 text-slate-300 hover:bg-white/5 w-full sm:w-auto">
                            <Filter className="w-4 h-4 ml-2" /> تصفية متقدمة
                        </Button>
                    </div>
                </div>

                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 text-xs font-bold text-slate-400 bg-[#0f192b]/50 border-b border-white/5">
                    <div className="col-span-3">الموظف</div>
                    <div className="col-span-2">القسم</div>
                    <div className="col-span-2 text-center">الدرجة والتقييم</div>
                    <div className="col-span-2 text-center">آخر مراجعة</div>
                    <div className="col-span-1 text-center">الحالة</div>
                    <div className="col-span-2 text-left">إجراءات</div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col">
                    {filtered.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 text-sm">لا توجد نتائج مطابقة للبحث.</div>
                    ) : (
                        filtered.map(emp => (
                            <div key={emp.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-0">
                                {/* Employee Info */}
                                <div className="col-span-3 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg shrink-0">
                                        {emp.name.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="text-sm font-bold text-white truncate">{emp.name}</h4>
                                        <div className="flex items-center gap-2 text-xs mt-0.5">
                                            <span className="text-slate-500 font-mono">{emp.id}</span>
                                            <span className="text-slate-600">•</span>
                                            <span className="text-slate-400 truncate">{emp.role}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Department */}
                                <div className="col-span-2 text-sm text-slate-300 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-slate-700 rounded-full" />
                                    {emp.dept}
                                </div>

                                {/* Score & Rating */}
                                <div className="col-span-2 flex flex-col items-center justify-center">
                                    <span className={cn(
                                        "text-lg font-black",
                                        emp.score >= 90 ? "text-emerald-400" :
                                            emp.score >= 70 ? "text-blue-400" : "text-rose-400"
                                    )} dir="ltr">{emp.score}%</span>
                                    <span className={cn(
                                        "text-[10px] px-2 py-0.5 rounded-full mt-1 font-bold",
                                        emp.rating === 'متميز' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                            emp.rating === 'ضمن المتوقع' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                                "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                    )}>{emp.rating}</span>
                                </div>

                                {/* Review Date */}
                                <div className="col-span-2 flex justify-center text-xs text-slate-400 font-medium font-mono" dir="ltr">
                                    {emp.review}
                                </div>

                                {/* Status */}
                                <div className="col-span-1 flex justify-center">
                                    <span className={cn(
                                        "text-xs px-2 py-1 rounded-md border font-bold",
                                        emp.status === 'نشط' ? "bg-[#0f192b] text-slate-300 border-white/10" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    )}>
                                        {emp.status}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="col-span-2 flex justify-end gap-2">
                                    {emp.score < 60 && (
                                        <Button variant="destructive" size="sm" className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20">
                                            فتح PIP
                                        </Button>
                                    )}
                                    <Button variant="outline" size="sm" className="bg-[#0f192b] border-white/10 text-slate-300 hover:bg-white/5">
                                        التفاصيل
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Tab 2: Thresholds (العتبات) --- //
function ThresholdsTab() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-[#0A1121] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute -left-32 -top-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-3 mb-8 relative z-10">
                    <Baseline className="w-6 h-6 text-indigo-400" />
                    <div>
                        <h3 className="text-xl font-bold text-white">حوكمة عتبات الأداء (Thresholds)</h3>
                        <p className="text-sm text-slate-400">تحدد هذه العتبات النطاقات القياسية لتقييم الموظفين، وبناءً عليها يتم تفعيل الخطط أو التنبيهات آلياً.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                    {/* Outstanding */}
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 relative">
                        <div className="absolute top-0 right-0 w-full h-1 bg-emerald-500" />
                        <h4 className="text-lg font-black text-emerald-400 mb-2">متميز (Outstanding)</h4>
                        <div className="text-3xl font-black text-white mb-4" dir="ltr">&ge; 90%</div>
                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
                            نطاق التميز. الموظفون في هذا النطاق مرشحون لبرامج إعداد القادة والترقيات الاستثنائية. يتم استبعادهم من تنبيهات التسرب السلبي.
                        </p>
                        <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-2 rounded-lg inline-flex items-center gap-2">
                            <Zap className="w-4 h-4" /> لا توجد إجراءات تصحيحية مطلوبة
                        </div>
                    </div>

                    {/* Meets */}
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 relative">
                        <div className="absolute top-0 right-0 w-full h-1 bg-blue-500" />
                        <h4 className="text-lg font-black text-blue-400 mb-2">ضمن المتوقع (Meets)</h4>
                        <div className="text-3xl font-black text-white mb-4" dir="ltr">70% - 89%</div>
                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
                            النطاق الصحي للعمليات. يمثلون القوة العاملة الأساسية. يخضعون للتطوير المستمر والمراجعات الدورية نصف السنوية ولا تتولد عنهم تنبيهات.
                        </p>
                        <div className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-2 rounded-lg inline-flex items-center gap-2">
                            <Target className="w-4 h-4" /> متابعة اعتيادية
                        </div>
                    </div>

                    {/* Below */}
                    <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6 relative">
                        <div className="absolute top-0 right-0 w-full h-1 bg-rose-500" />
                        <h4 className="text-lg font-black text-rose-400 mb-2">دون المتوقع (Below)</h4>
                        <div className="text-3xl font-black text-white mb-4" dir="ltr">&lt; 70%</div>
                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
                            نطاق الخطر. الموظفون هنا يتطلبون تدخلاً مباشراً من الموارد البشرية. يتم توليد التنبيهات آلياً للمديرين المباشرين لطلب إيضاحات.
                        </p>
                        <div className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg inline-flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" /> توليد تنبيه وبدء مسار PIP
                        </div>
                    </div>
                </div>

                {/* Score Spectrum */}
                <div className="mt-12 bg-[#0f192b] rounded-xl p-6 border border-white/5">
                    <h4 className="text-sm font-bold text-white mb-4">مرئي النطاقات (Visual Spectrum)</h4>
                    <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner">
                        <div className="bg-rose-500 h-full w-[30%]" />
                        <div className="bg-amber-500 h-full w-[40%]" />
                        <div className="bg-emerald-500 h-full w-[30%]" />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 mt-2 font-mono" dir="ltr">
                        <span>0%</span>
                        <span>70%</span>
                        <span>90%</span>
                        <span>100%</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

// --- Tab 3: KPI-to-Alert Mapping (ربط المؤشرات بالتنبيهات) --- //
function KpiAlertMappingTab() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            <div className="bg-[#0A1121] border border-white/5 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <ArrowRightLeft className="w-6 h-6 text-amber-400" />
                        <div>
                            <h3 className="text-xl font-bold text-white">ربط المؤشرات بمنظومة التنبيهات</h3>
                            <p className="text-sm text-slate-400">القواعد المنطقية التي تحدد متى يتم إطلاق تنبيه بناءً على تغيرات الـ KPIs.</p>
                        </div>
                    </div>
                    <Button className="bg-[#0f192b] border border-white/10 text-white hover:bg-white/5 shadow-sm">
                        <Link2 className="w-4 h-4 ml-2" /> تعديل قواعد الربط
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Rule 1 */}
                    <div className="bg-[#0f192b] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-1 h-full bg-rose-500 group-hover:w-2 transition-all" />
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">خطورة عالية</span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded">
                                <FileWarning className="w-3 h-3" /> آلي
                            </div>
                        </div>
                        <h4 className="text-base font-bold text-white mb-2">هبوط الأداء الحاد</h4>
                        <div className="space-y-3 mt-4">
                            <div className="bg-[#0A1121] p-3 rounded-lg border border-white/5">
                                <span className="text-[10px] text-slate-500 block mb-1">المؤشر المشغّل (Trigger):</span>
                                <span className="text-sm text-slate-300 font-medium">الدرجة الإجمالية &lt; 60%</span>
                            </div>
                            <div className="flex justify-center"><ArrowRightLeft className="w-4 h-4 text-slate-600 rotate-90" /></div>
                            <div className="bg-[#0A1121] p-3 rounded-lg border border-white/5">
                                <span className="text-[10px] text-slate-500 block mb-1">الإجراء التنبيهي (Alert Action):</span>
                                <span className="text-sm text-rose-400 font-medium">إنشاء تنبيه بإشعار المدير وطلب خطة PIP فورية.</span>
                            </div>
                        </div>
                    </div>

                    {/* Rule 2 */}
                    <div className="bg-[#0f192b] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-1 h-full bg-amber-500 group-hover:w-2 transition-all" />
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">خطورة متوسطة</span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded">
                                <FileWarning className="w-3 h-3" /> آلي
                            </div>
                        </div>
                        <h4 className="text-base font-bold text-white mb-2">تراجع مستمر (دورتين متتاليتين)</h4>
                        <div className="space-y-3 mt-4">
                            <div className="bg-[#0A1121] p-3 rounded-lg border border-white/5">
                                <span className="text-[10px] text-slate-500 block mb-1">المؤشر المشغّل (Trigger):</span>
                                <span className="text-sm text-slate-300 font-medium">الدرجة الحالية &lt; الدرجة السابقة بـ 10%</span>
                            </div>
                            <div className="flex justify-center"><ArrowRightLeft className="w-4 h-4 text-slate-600 rotate-90" /></div>
                            <div className="bg-[#0A1121] p-3 rounded-lg border border-white/5">
                                <span className="text-[10px] text-slate-500 block mb-1">الإجراء التنبيهي (Alert Action):</span>
                                <span className="text-sm text-amber-400 font-medium">إرسال تنبيه اصطناعي (AI Warning) للمدير باحتمالية وجود عائق.</span>
                            </div>
                        </div>
                    </div>

                    {/* Rule 3 */}
                    <div className="bg-[#0f192b] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-1 h-full bg-blue-500 group-hover:w-2 transition-all" />
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">إشعار نظام</span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded">
                                <FileWarning className="w-3 h-3" /> آلي
                            </div>
                        </div>
                        <h4 className="text-base font-bold text-white mb-2">عدم اكتمال أهداف OKRs</h4>
                        <div className="space-y-3 mt-4">
                            <div className="bg-[#0A1121] p-3 rounded-lg border border-white/5">
                                <span className="text-[10px] text-slate-500 block mb-1">المؤشر المشغّل (Trigger):</span>
                                <span className="text-sm text-slate-300 font-medium">معدل تحقيق الأهداف &lt; 50% بنهاية الربع</span>
                            </div>
                            <div className="flex justify-center"><ArrowRightLeft className="w-4 h-4 text-slate-600 rotate-90" /></div>
                            <div className="bg-[#0A1121] p-3 rounded-lg border border-white/5">
                                <span className="text-[10px] text-slate-500 block mb-1">الإجراء التنبيهي (Alert Action):</span>
                                <span className="text-sm text-blue-400 font-medium">توليد تقرير استعراض أهداف مرسل للطرفين لورود قصور.</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}

// --- Main Container View --- //
export function KpiAnalysisView() {
    return (
        <TabsContainer
            syncWithUrl="kpi-tab"
            defaultValue="definitions"
            tabs={[
                {
                    value: 'definitions',
                    label: 'تعريفات مؤشرات الأداء',
                    content: <div className="mt-6"><KpiDefinitionsTab /></div>
                },
                {
                    value: 'thresholds',
                    label: 'العتبات (Thresholds)',
                    content: <div className="mt-6"><ThresholdsTab /></div>
                },
                {
                    value: 'mapping',
                    label: 'ربط المؤشرات بالتنبيهات',
                    content: <div className="mt-6"><KpiAlertMappingTab /></div>
                }
            ]}
        />
    );
}
