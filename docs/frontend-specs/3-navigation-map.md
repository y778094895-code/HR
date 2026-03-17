# 3. خريطة التنقل وشريط الجانب (Navigation & Routing Map)

## بنية الهيكل (Application Shell Layout)
- **يتم التفاف التطبيق كاملًا الموجه للمستخدم بـ `DashboardLayout`:**
  - **الشريط العلوي (Topbar):** شريحة هوية المستخدم (User Identity Chip - الاسم والدور) + زر تسجيل الخروج (Logout).
  - **الشريط الجانبي (Sidebar):** يدعم (RTL) بشكل افتراضي وينطوي على شكل درج (Sheet/Drawer) في وضعيات الشاشات الموبايل المحمولة.

## جدول المسارات وصلاحيات الأدوار (RBAC Routing Table)
يتم التحكم في رؤية العناصر والوصول إليها بناءً على دور المستخدم (`admin`, `manager`, `employee`, `super_admin`). يجب استخدام مكون التوجيه الآمن (ProtectedRoute) مع مصفوفة `allowedRoles`.

| المسار (Route) | العنصر في القائمة (Label) | الأدوار المسموح لها الوصول | الظهور في القائمة |
|----------------|---------------------------|----------------------------|-------------------|
| `/dashboard` | لوحة التحكم | `admin`, `manager`, `employee` | نعم |
| `/dashboard/interventions` | التدخلات | `admin`, `manager` | نعم |
| `/dashboard/vo-employees` | الموظفون | `admin`, `manager` | نعم |
| `/dashboard/users` | إدارة المستخدمين | `admin`, `super_admin` | نعم (فقط للمخوّلين) |
| `/dashboard/impact` | تحليل الأثر | `admin`, `manager` | نعم |
| `/dashboard/performance` | الأداء | `admin`, `manager` | نعم (إذا كان مدعومًا واجهة القائمة) |
| `/dashboard/attrition` | الاستقالات | `admin`, `manager` | نعم (مخفي برمجياً في الـ Client إن لم يطلب) |
| `/dashboard/training` | التدريب | `admin`, `manager`, `employee` | نعم |
| `/dashboard/fairness` | العدالة | `admin` فقط | نعم (للمسؤول فقط) |
| `/dashboard/reports` | التقارير | `admin`, `manager` | نعم |
| `/dashboard/settings` | الإعدادات | `admin`, `manager`, `employee` | نعم (روابط فرعية مقيدة للأدمن) |
| `/dashboard/help` | المساعدة | الجميع | نعم |
| `/login` | تسجيل الدخول | (عام / غير مسجل فقط) | لا (صفحة خارج لوحة التحكم) |

## ملاحظات أمان التوجيه (Guards)
- **`ProtectedRoute`:**
  - إذا لم يكن مسجلاً -> توجيه (Redirect) لـ `/login`.
  - إذا كان مسجلاً ويُحاول دخول مسار لا يملكه (مثلاً Manager يزور Fairness) -> عرض واجهة "وصول غير مصرح (Unauthorized)" أو إعادة التوجيه لـ `/dashboard`.
- **رؤية العناصر الجانبية (Sidebar Visibility):** يتم تصفية قائمة روابط القائمة الجانبية مسبقًا، بحيث لا يرى المستخدم رابطًا لا يملك صلاحية الوصول لصفحته.
