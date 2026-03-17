# 2. خريطة المكونات وبنية الـ Components (Component Map)

## بنية المجلدات المقترحة (Directory Structure)
```
src/
├── components/
│   ├── ui/                 # مكونات Shadcn/ui الأساسية (أزرار، حقول، أدراج)
│   ├── shared/             # مكونات مخصصة مبنية فوق الأساسية (مذكورة أدناه)
│   ├── layout/             # هيكل التطبيق (Sidebar, Topbar, DashboardLayout)
├── features/               # المكونات الخاصة بكل صفحة (Interventions, Fairness...)
├── hooks/                  # Custom Hooks (useAuth, useToast...)
├── lib/                    # وظائف مساعدة (Utils)
└── types/                  # تعريفات TypeScript العامة
```

## المكونات المشتركة (Shared UI Components)

### 1) `TabsContainer` (حاوية التبويبات)
- **الغرض:** مزامنة واجهة التبويبات مع الـ URL Parameter (مثال `?view=overview`).
- **المشاغلات (Props):**
  ```typescript
  interface TabsContainerProps {
    tabs: { id: string; label: string; content: React.ReactNode }[];
    defaultTab: string;
    queryParam?: string; // افتراضي: 'view'
  }
  ```
- **أماكن الاستخدام:** `Performance`, `Attrition`, `Training`, `Fairness`, `Reports`, `Settings`, `Help`.

### 2) `FiltersBar` (شريط الفلاتر)
- **الغرض:** توفير واجهة موحدة للبحث، وتحديد المدة الزمنية، وتحديد القسم.
- **المشاغلات (Props):**
  ```typescript
  interface FiltersBarProps {
    showSearch?: boolean;
    showDateRange?: boolean;
    showDepartment?: boolean;
    onSearch?: (term: string) => void;
    onDateChange?: (range: DateRange) => void;
    onDepartmentChange?: (deptId: string) => void;
  }
  ```
- **أماكن الاستخدام:** العديد من الصفحات وقوائم الجداول.

### 3) `ExportButtons` (أزرار التصدير)
- **الغرض:** توفير تجربة موحدة لتنزيل ملفات الـ Mock (PDF / CSV / Excel).
- **المشاغلات (Props):**
  ```typescript
  interface ExportButtonsProps {
    onExportPDF?: () => void;
    onExportCSV?: () => void;
    fileName?: string;
  }
  ```
- **أماكن الاستخدام:** معظم لوحات التحكم الرئيسية.

### 4) `DataTable` (جدول البيانات)
- **الغرض:** عرض البيانات في صفوف مع إمكانيات الفرز والأفعال (Actions).
- **المشاغلات (Props):**
  ```typescript
  interface DataTableProps<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    onRowClick?: (row: TData) => void;
    isLoading?: boolean;
    emptyMessage?: string;
  }
  ```
- **أماكن الاستخدام:** الموظفين، المستخدمين، الأداء، التدريب، إلخ.

### 5) `SideDrawer` (الدرج الجانبي)
- **الغرض:** عرض تفاصيل إضافية بدون الانتقال لصفحة جديدة عند النقر على صف (Row) في الجدول.
- **المشاغلات (Props):**
  ```typescript
  interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footerActions?: React.ReactNode;
  }
  ```
- **أماكن الاستخدام:** تحليل مخاطر الاستقالة، تفاصيل الموظفين للتقييم، عرض التذاكر.

### 6) `KPICard` (بطاقة مؤشرات الأداء)
- **الغرض:** عرض مقاييس مختصرة مع إمكانية عرض أيقونة واتجاه التغيير (Trend).
- **المشاغلات (Props):**
  ```typescript
  interface KPICardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: { value: number; isPositive: boolean };
    description?: string;
  }
  ```
- **أماكن الاستخدام:** `DashboardHome` والعديد من صفحات التحليل.

### 7) `Badge` (شارة الحالة / الدور / مستوى الخطر)
- **الغرض:** تمييز بصري موجز.
- **المكون المُدمج:** استخدام `Badge` الخاص بـ (Shadcn) مع متغيرات (Variants: success, destructive, warning, outline).
