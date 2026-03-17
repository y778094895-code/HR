# نظام إدارة الحالة - الدليل التقني

## 1. هيكلية إدارة الحالة
```
stores/
├── ui/           # حالة واجهة المستخدم (Theme, Sidebar)
├── business/     # حالة الأعمال (Auth, Dashboard Data)
├── middlewares/  # وسائط معالجة الحالة (Logging, Persistence)
└── selectors/    # مشتقات الحالة (Reselect)
```

## 2. أنواع الحالة ومسؤولياتها

### 2.1 UI State
تُستخدم للإعدادات التفضيلية وحالة العرض (مثل فتح/إغلاق القوائم).
- يتم تخزينها عادةً في `localStorage`.

### 2.2 Business State
تُستخدم للبيانات القادمة من الخادم والتي تتطلب مشاركة بين عدة مكونات.
- يتم تحديثها عبر Actions تستدعي `services`.

## 3. نمط الاستخدام
```typescript
// في المكونات
const { data } = useDashboardStore();
const kpis = useDashboardKPIs(); // Selector

// في Actions
const fetchDashboardData = async () => {
  const data = await dashboardService.getData();
  set({ data });
};
```

## 4. إرشادات
- استخدم **Local State** (`useState`) للحالة الخاصة بمكون واحد.
- استخدم **Zustand Store** للحالة العامة.
- استخدم **Selectors** لتحسين الأداء وتجنب إعادة الريندر غير الضرورية.
