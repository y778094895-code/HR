import React, { useState } from 'react';
import { TabsContainer } from '@/components/ui/navigation/TabsContainer';
import { KPICard } from '@/components/ui/data-display/KPICard';
import { Target, TrendingUp, AlertTriangle, CheckCircle, Users, BarChart3, LineChart as LineChartIcon, ArrowUpRight, ArrowDownRight, Activity, Crosshair, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
// Note: We use visual CSS elements instead of raw Chart.js / Recharts 
// to ensure perfect Dark Theme compat and speed without relying on external bloated deps, 
// using semantic divs that look like high-end HR dashboards.

const stats = {
    avgScore: 84,
    completionRate: 92,
    topPerformers: 15, // 15%
    activePips: 8
};

function IndividualAnalysis() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard title="متوسط الأداء العام" value={stats.avgScore} change={2.4} icon={Target} variant="success" valueSuffix="%" />
                <KPICard title="نسبة التقييم المنجز" value={stats.completionRate} change={5.1} icon={CheckCircle} variant="success" valueSuffix="%" />
                <KPICard title="أصحاب الأداء الفائق" value={stats.topPerformers} change={1.2} icon={Award} variant="default" valueSuffix="%" />
                <KPICard title="خطط التحسين (PIP)" value={stats.activePips} change={-2.0} icon={AlertTriangle} variant="warning" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 9-Box Matrix */}
                <div className="lg:col-span-2 bg-[#0A1121] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <Crosshair className="w-5 h-5 text-indigo-400" />
                        <div>
                            <h3 className="text-lg font-bold text-white">مصفوفة الأداء والكفاءة الكامنة (9-Box Grid)</h3>
                            <p className="text-xs text-slate-400">توزيع القيادات والموظفين بناءً على تقاطعات الأداء الفعلي (X) والقدرة المستقبلية (Y).</p>
                        </div>
                    </div>

                    <div className="relative z-10 aspect-video max-h-[400px] w-full mt-4 flex font-sans">
                        {/* Y-axis Label */}
                        <div className="w-8 flex flex-col items-center justify-center mr-2">
                            <span className="transform -rotate-90 text-xs font-bold text-slate-500 tracking-widest whitespace-nowrap">الإمكانات والكفاءة الكامنة (Potential)</span>
                        </div>
                        {/* The Grid */}
                        <div className="flex-1 flex flex-col relative w-full h-full bg-[#0f192b] border-l-2 border-b-2 border-slate-700/50">
                            {/* Grid Cells (3x3) */}
                            <div className="flex-1 flex">
                                <div className="flex-1 border-r border-b border-white/5 p-2 flex flex-col relative group hover:bg-white/5 transition-colors">
                                    <span className="text-[10px] text-slate-500 absolute top-2 right-2">موهبة متعارضة (7%)</span>
                                    <div className="mt-auto self-start bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs font-bold">14 موظف</div>
                                </div>
                                <div className="flex-1 border-r border-b border-white/5 p-2 flex flex-col relative group hover:bg-white/5 transition-colors bg-emerald-500/[0.02]">
                                    <span className="text-[10px] text-slate-400 absolute top-2 right-2">نجم مستقبلي (15%)</span>
                                    <div className="mt-auto self-start bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold">32 موظف</div>
                                </div>
                                <div className="flex-1 border-b border-white/5 p-2 flex flex-col relative group hover:bg-white/5 transition-colors bg-emerald-500/[0.05]">
                                    <span className="text-[10px] text-emerald-300 absolute top-2 right-2">نجم حالي ومستقبلي (10%)</span>
                                    <div className="mt-auto self-start bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2 py-1 rounded text-xs font-bold">21 موظف</div>
                                </div>
                            </div>
                            <div className="flex-1 flex">
                                <div className="flex-1 border-r border-b border-white/5 p-2 flex flex-col relative group hover:bg-white/5 transition-colors bg-rose-500/[0.02]">
                                    <span className="text-[10px] text-slate-500 absolute top-2 right-2">أداء ضعيف كامن (5%)</span>
                                    <div className="mt-auto self-start bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-1 rounded text-xs font-bold">11 موظف</div>
                                </div>
                                <div className="flex-1 border-r border-b border-white/5 p-2 flex flex-col relative group hover:bg-white/5 transition-colors bg-blue-500/[0.02]">
                                    <span className="text-[10px] text-slate-400 absolute top-2 right-2">عضو أساسي (35%)</span>
                                    <div className="mt-auto self-start bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold">75 موظف</div>
                                </div>
                                <div className="flex-1 border-b border-white/5 p-2 flex flex-col relative group hover:bg-white/5 transition-colors bg-emerald-500/[0.02]">
                                    <span className="text-[10px] text-slate-400 absolute top-2 right-2">نجم أداء أساسي (12%)</span>
                                    <div className="mt-auto self-start bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold">25 موظف</div>
                                </div>
                            </div>
                            <div className="flex-1 flex">
                                <div className="flex-1 border-r border-white/5 p-2 flex flex-col relative group hover:bg-white/5 transition-colors bg-rose-500/[0.05]">
                                    <span className="text-[10px] text-rose-400 absolute top-2 right-2">خطر منخفض (4%)</span>
                                    <div className="mt-auto self-start bg-white/5 border border-white/10 text-slate-400 px-2 py-1 rounded text-xs font-bold">8 موظفين</div>
                                </div>
                                <div className="flex-1 border-r border-white/5 p-2 flex flex-col relative group hover:bg-white/5 transition-colors bg-slate-500/[0.02]">
                                    <span className="text-[10px] text-slate-500 absolute top-2 right-2">أداء صلب (8%)</span>
                                    <div className="mt-auto self-start bg-white/5 border border-white/10 text-slate-300 px-2 py-1 rounded text-xs font-bold">17 موظف</div>
                                </div>
                                <div className="flex-1 border-white/5 p-2 flex flex-col relative group hover:bg-white/5 transition-colors bg-blue-500/[0.02]">
                                    <span className="text-[10px] text-slate-400 absolute top-2 right-2">مؤدي موثوق (4%)</span>
                                    <div className="mt-auto self-start bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold">9 موظفين</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* X-axis Label */}
                    <div className="h-8 flex items-center justify-center mt-2 ml-10">
                        <span className="text-xs font-bold text-slate-500 tracking-widest">الأداء الفعلي والنتائج (Performance)</span>
                    </div>
                </div>

                {/* Score Distribution */}
                <div className="bg-[#0A1121] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart3 className="w-5 h-5 text-cyan-400" />
                        <div>
                            <h3 className="text-lg font-bold text-white">توزيع نطاقات التقييم</h3>
                            <p className="text-xs text-slate-400">التوزيع الطبيعي لدرجات الموظفين.</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center space-y-4">
                        {[
                            { label: 'ممتاز (90-100)', value: 15, color: 'bg-emerald-500' },
                            { label: 'جيد جداً (80-89)', value: 45, color: 'bg-cyan-500' },
                            { label: 'جيد (70-79)', value: 25, color: 'bg-blue-500' },
                            { label: 'يحتاج تحسين (60-69)', value: 10, color: 'bg-amber-500' },
                            { label: 'غير مرضٍ (<60)', value: 5, color: 'bg-rose-500' },
                        ].map(tier => (
                            <div key={tier.label} className="space-y-1">
                                <div className="flex justify-between text-xs font-medium text-slate-300">
                                    <span>{tier.label}</span>
                                    <span className="text-slate-400" dir="ltr">{tier.value}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-[#0f192b] rounded-full overflow-hidden flex">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-1000", tier.color)}
                                        style={{ width: `${tier.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actionable Top/Bottom Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performers Grid */}
                <div className="bg-[#0A1121] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-emerald-500/10 bg-emerald-500/[0.02] flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-bold text-emerald-50">قائمة أفضل المؤدين</h3>
                    </div>
                    <div className="p-0">
                        {[
                            { name: 'أحمد العتيبي', dept: 'تطوير البرمجيات', score: 98, trend: '+2' },
                            { name: 'سارة الدوسري', dept: 'المبيعات', score: 96, trend: '+4' },
                            { name: 'فهد القحطاني', dept: 'التسويق', score: 95, trend: '+1' },
                        ].map((emp, i) => (
                            <div key={i} className="flex justify-between items-center p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-0">
                                <div>
                                    <p className="font-bold text-sm text-white">{emp.name}</p>
                                    <p className="text-xs text-slate-400">{emp.dept}</p>
                                </div>
                                <div className="text-left" dir="ltr">
                                    <span className="text-lg font-black text-emerald-400">{emp.score}%</span>
                                    <span className="text-[10px] text-emerald-500 ml-2 bg-emerald-500/10 px-1 rounded">{emp.trend}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PIP Interventions */}
                <div className="bg-[#0A1121] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-rose-500/10 bg-rose-500/[0.02] flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                        <h3 className="font-bold text-rose-50">حالات تتطلب متابعة (PIPs)</h3>
                    </div>
                    <div className="p-0">
                        {[
                            { name: 'سالم المطيري', dept: 'العمليات', risk: 'عالي', days: 14 },
                            { name: 'نورة السبيعي', dept: 'خدمة العملاء', risk: 'متوسط', days: 28 },
                            { name: 'خالد العنزي', dept: 'المالية', risk: 'عالي', days: 5 },
                        ].map((emp, i) => (
                            <div key={i} className="flex justify-between items-center p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-0">
                                <div>
                                    <p className="font-bold text-sm text-white">{emp.name}</p>
                                    <p className="text-xs text-slate-400">{emp.dept}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={cn("text-xs px-2 py-0.5 rounded border", emp.risk === 'عالي' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20')}>خطورة: {emp.risk}</span>
                                    <span className="text-[10px] text-slate-500">منذ {emp.days} يوم</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TeamsAnalysis() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid gap-6 lg:grid-cols-3">

                {/* Department Rankings */}
                <div className="lg:col-span-2 bg-[#0A1121] border border-white/5 rounded-2xl p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-blue-400" />
                            <div>
                                <h3 className="text-lg font-bold text-white">ترتيب الأقسام ومعدلات الإنجاز</h3>
                                <p className="text-xs text-slate-400">مقارنة أداء الأقسام من الأفضل للأسوأ.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {[
                            { rank: 1, name: 'تطوير البرمجيات', score: 89, completion: 100, trend: 1.2 },
                            { rank: 2, name: 'المبيعات الإقليمية', score: 85, completion: 94, trend: -0.5 },
                            { rank: 3, name: 'الموارد البشرية', score: 82, completion: 98, trend: 2.1 },
                            { rank: 4, name: 'خدمة العملاء', score: 76, completion: 81, trend: -1.8 },
                        ].map((dept) => (
                            <div key={dept.rank} className="bg-[#0f192b] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="w-8 h-8 rounded bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                                    {dept.rank}
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-white text-sm">{dept.name}</h4>
                                        <div className="flex items-center gap-2">
                                            {dept.trend > 0 ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : <ArrowDownRight className="w-3 h-3 text-rose-400" />}
                                            <span className={cn("text-xs font-bold", dept.trend > 0 ? "text-emerald-400" : "text-rose-400")} dir="ltr">{dept.trend}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1 text-slate-400">
                                                <span>الأداء العام</span>
                                                <span className="text-white font-bold">{dept.score}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-[#08152b] rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${dept.score}%` }} />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1 text-slate-400">
                                                <span>نسبة الإنجاز</span>
                                                <span className="text-white font-bold">{dept.completion}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-[#08152b] rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${dept.completion}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Heat Metrics / Gaps */}
                <div className="bg-[#0A1121] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="w-5 h-5 text-indigo-400" />
                        <div>
                            <h3 className="text-lg font-bold text-white">فجوات الأداء الحرجة</h3>
                            <p className="text-xs text-slate-400">نطاقات انخفاض الأداء مقارنة بالمستهدف.</p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 h-full bg-rose-500" />
                            <h4 className="font-bold text-rose-100 text-sm mb-1">خدمة العملاء</h4>
                            <p className="text-xs text-slate-400 mb-3">فجوة كبيرة في تقييم المهارات السلوكية.</p>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">المستهدف: 85%</span>
                                <span className="text-rose-400 font-bold">الحالي: 71%</span>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 h-full bg-amber-500" />
                            <h4 className="font-bold text-amber-100 text-sm mb-1">المبيعات الإقليمية</h4>
                            <p className="text-xs text-slate-400 mb-3">انخفاض تدريجي ملحوظ هذا الربع.</p>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">المستهدف: 90%</span>
                                <span className="text-amber-400 font-bold">الحالي: 85%</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function TimeComparisonAnalysis() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-[#0A1121] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <LineChartIcon className="w-5 h-5 text-purple-400" />
                        <div>
                            <h3 className="text-lg font-bold text-white">تحليل دورة التقييم (Cycle-over-Cycle)</h3>
                            <p className="text-xs text-slate-400">تتبع مسار الأداء المؤسسي على مدار الفصول الأربعة الماضية.</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-xs font-bold bg-[#0f192b] p-2 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded" /> دقة القياس (Quality)</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-cyan-500 rounded" /> تحقيق الأهداف (OKRs)</div>
                    </div>
                </div>

                {/* Trend Chart Mock (Visual CSS representation mapping logical data) */}
                <div className="h-72 w-full flex items-end justify-around pb-6 border-b border-white/5 relative z-10">
                    {/* Y-axis lines mapped to percentages */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 z-0">
                        <div className="border-t border-white border-dashed w-full h-0 relative"><span className="absolute -left-8 -top-2 text-[10px] opacity-50">100</span></div>
                        <div className="border-t border-white border-dashed w-full h-0 relative"><span className="absolute -left-8 -top-2 text-[10px] opacity-50">75</span></div>
                        <div className="border-t border-white border-dashed w-full h-0 relative"><span className="absolute -left-8 -top-2 text-[10px] opacity-50">50</span></div>
                    </div>

                    {[
                        { label: 'Q2 2025', q: 76, okr: 80 },
                        { label: 'Q3 2025', q: 79, okr: 84 },
                        { label: 'Q4 2025', q: 85, okr: 88 },
                        { label: 'Q1 2026', q: 88, okr: 92 },
                    ].map((q, i) => (
                        <div key={i} className="relative flex justify-center w-24 h-full group z-10">
                            <div className="absolute bottom-0 flex gap-2 w-full h-full items-end justify-center">
                                {/* Bar 1 */}
                                <div
                                    className="w-6 bg-purple-500/80 hover:bg-purple-400 rounded-t-sm transition-all relative"
                                    style={{ height: `${q.q}%` }}
                                >
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-[#08152b] px-1 rounded">{q.q}%</span>
                                </div>
                                {/* Bar 2 */}
                                <div
                                    className="w-6 bg-cyan-500/80 hover:bg-cyan-400 rounded-t-sm transition-all relative"
                                    style={{ height: `${q.okr}%` }}
                                >
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-[#08152b] px-1 rounded">{q.okr}%</span>
                                </div>
                            </div>
                            <span className="absolute -bottom-8 text-xs font-bold text-slate-400">{q.label}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl relative">
                        <h4 className="text-emerald-400 font-bold text-sm mb-1">النمو العام للأداء</h4>
                        <p className="text-slate-400 text-xs text-balance">هناك تحسن مطرد بمتوسط زيادة قدرها +3.2% كل ربع سنة بفضل برامج التدريب وخطط التحسين الموجهة.</p>
                    </div>
                    <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl relative">
                        <h4 className="text-purple-400 font-bold text-sm mb-1">معدل الامتثال ودقة القياس</h4>
                        <p className="text-slate-400 text-xs text-balance">ارتفعت دقة وموضوعية التقييم بنسبة 12% مقارنة بالዓام المَاضي طبقا لمؤشرات العدالة.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ContinuousAnalysisView() {
    return (
        <TabsContainer
            syncWithUrl="analysis-tab"
            defaultValue="individual"
            tabs={[
                {
                    value: 'individual',
                    label: 'التحليل الفردي',
                    content: <div className="mt-6"><IndividualAnalysis /></div>
                },
                {
                    value: 'teams',
                    label: 'الفرق والأقسام',
                    content: <div className="mt-6"><TeamsAnalysis /></div>
                },
                {
                    value: 'time-comparison',
                    label: 'المقارنة الزمنية (Trend)',
                    content: <div className="mt-6"><TimeComparisonAnalysis /></div>
                }
            ]}
        />
    );
}
