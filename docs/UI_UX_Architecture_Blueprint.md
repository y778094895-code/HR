# Smart HR System — Case-Centric UI/UX Architecture Blueprint

## 1. الهيكل التنظيمي للمعلومات (Information Architecture - IA)

تم بناء الهيكل على أساس "Case-Centric"، حيث تلعب التحليلات دور الداعم الذكي للمهام اليومية التي تدار عبر الحالات (Cases).

* **لوحة التحكم (Dashboard)**
  * اختصارات سريعة للحالات، طابور التنبيهات، مؤشرات الأداء، والمخاطر.
* **مركز التنبيهات (Alerts Center)**
  * صندوق الوارد، غير مقروءة، حرجة (High Severity)، سجل الاستجابة.
* **الموظفون (Employees)**
  * دليل الموظفين، ملف الموظف (Profile).
* **الأداء (Performance Intelligence)**
  * التحليل الدوري/الآني، مؤشرات الأداء، تدني الأداء المبكر.
* **الاستقالات والدوران (Attrition & Turnover)**
  * التنبؤ بمخاطر الاستقالة، محركات المخاطر (Drivers)، تكلفة فقد الكفاءات.
* **التدريب (Training Needs)**
  * التنبؤ بالاحتياجات التدريبية، مطابقة البرامج، أثر التدريب.
* **العدالة والتحيز (Fairness Monitoring)**
  * مراقبة العدالة، التنبيهات والتقارير، تفسير العدالة (XAI).
* **التوصيات والمحاكاة (Recommendations & What-if)**
  * التوصيات الذكية، تقدير الأثر المتوقع، محاكاة "ماذا لو".
* **مركز الحالات والتدخلات (Case Management)**
  * إدارة الحالات (مفتوحة، قيد التنفيذ...)، إنشاء/فتح حالة، تفاصيل الحالة.
* **تحليل الأثر (Impact Analysis)**
  * أثر التدخلات والتدريب، مقارنة زمنية.
* **التقارير والتصدير (Reports & Exports)**
  * مكتبة التقارير، منشئ التقارير، التصدير.
* **جودة البيانات (Data Quality)**
  * فحص القيم، سياسات المعالجة، سجل التدقيق، التنبيهات.
* **إدارة المستخدمين والصلاحيات (Users & Permissions)**
  * المستخدمون، الأدوار، صلاحيات البيانات، سجل الدخول.
* **الإعدادات (Settings)**
  * إعدادات المؤسسة، العتبات، النماذج، قنوات التنبيه، الـتصدير.
* **المساعدة (Help)**
  * دليل الاستخدام، الأسئلة الشائعة، الدعم.

---

## 2. خريطة التنقل (Navigation Map)

### الشريط الجانبي (Sidebar Navigation)
* 🏠 **الرئيسية (Dashboard)**
* 🔔 **تنبيهات (Alerts)** `[Count Badge]`
* 📁 **إدارة الحالات (Cases)**
* 👥 **الموظفون (Employees)**
* 📊 **التحليلات الذكية (Intelligence)**
  * الأداء (Performance)
  * الاستقالات (Attrition)
  * التدريب (Training)
  * العدالة (Fairness)
  * التوصيات والمحاكاة (Recommendations)
* 📈 **تحليل الأثر (Impact Analysis)**
* 📑 **التقارير (Reports)**
* ⚙️ **إدارة النظام (System)**
  * جودة البيانات (Data Quality)
  * المستخدمون والصلاحيات (Users & Roles)
  * الإعدادات (Settings)
* ❓ **المساعدة (Help)**

### مسارات التنقل الداخلية (Breadcrumbs)
* `Dashboard > Alerts Center > Alert Details > Create Case`
* `Employees > Directory > Employee Profile > Risk Recommendations > What-if Simulation`
* `Cases > Open Cases > Case Details (#10024)`

---

## 3. مواصفات واجهات المستخدم (UI Specifications)

### 3.1. لوحة التحكم (Dashboard)
* **Tabs**: مخصصة حسب الدور (System Admin, Executive, HR, Manager, Group Admin, Analyst).
* **Widgets**: 
  * KPIs Cards (مؤشرات الأداء، المخاطر، العدالة، إجمالي الحالات).
  * Data Grid: حالات تحتاج إجراء الآن (صنف بالخطورة والاختصار لفتح/متابعة الحالة).
  * List: أهم الإشعارات غير المقروءة.
* **States**: Empty state لـ "لا توجد حالات حالياً". Loading skeleton أثناء جلب البيانات.

### 3.2. مركز التنبيهات (Alerts Center)
* **Tabs**: All Alerts, Unread, High Severity, Acknowledged.
* **Filters**: التاريخ، تصنيف التنبيه (أداء، استقالة، عدالة)، الأهمية.
* **Table**: (المرسل/النظام، التنبيه، التاريخ، الأهمية، الإجراء السريع).
* **Drawer (عند النقر على تنبيه)**:
  * *Tabs*: Summary, Signal/Reason, Suggested Action, Activity Log.
  * *Actions*: زر أساسي (Open Case), زر ثانوي (Link to existing Case), Mark as Read.

### 3.3. الموظفون (Employees) - ملف الموظف
* **Header**: بيانات أساسية، زر الإجراء الواضح (Open Case).
* **Tabs**:
  1. Overview (نظرة عامة)
  2. Performance (رسوم بيانية للـ KPIs والاتجاهات)
  3. Risks (مؤشر الاستقالة %، خطورة الأداء)
  4. Recommendations (بطاقات توصيات تدريب/احتفاظ)
  5. Cases & Interventions (قائمة بالحالات المرتبطة بهذا الموظف مع حالاتها)
  6. Fairness (مؤشرات العدالة الخاصة به)
  7. Explainability (مقاطع نصية ورسومية من XAI للمخاطر)
  8. Timeline (سجل زمني شامل لكل التفاعلات).

### 3.4. الذكاء التحليلي (Analytics Pages: Performance, Attrition, Fairness, Training)
* **Filters**: النطاق الزمني، القسم، الفئة الوظيفية.
* **Views**: 
  * Dashboard View للاتجاهات العامة.
  * List View للموظفين المتأثرين (High Risk List, Underperformance List).
* **Actions**: تحديد موظف/أكثر -> المبادرة بإجراء (Open Group Case أو Open Individual Case).
* **Drawers**: XAI Explainability (لماذا تم تصنيف هذا الموظف كمخاطرة عالية؟)، وما هي محركات المخاطر (Drivers).

### 3.5. مركز الحالات والتدخلات (Case Management) - "القلب المشغل"
* **Tabs (قائمة الحالات)**: المفتوحة، قيد التنفيذ، تحت المراجعة، مغلقة.
* **Filters**: Owner, Priority, Status, Due Date.
* **Case Details Page**:
  * *Header*: Case ID, Title, Status Badge, Assignee, SLA Timer.
  * *Tabs*: 
    1. Summary
    2. Signals
    3. Actions
    4. Monitoring
    5. Impact Measurement
    6. Attachments/Notes
    7. Audit Trail
  * *Actions*: Change Status, Assign, Execute Intervention, Close Case.

### 3.6. التوصيات ومحاكاة "ماذا لو" (Recommendations & What-if)
* **Layout**: 
  * الجانب الأيمن: محددات السيناريو (Sliders للمتغيرات كزيادة الراتب، تقليل الساعات، إضافة تدريب).
  * الجانب الأيسر: رسم بياني شريطي (Bar Chart) يعرض الأثر المتوقع (الأداء المستقبلي، انخفاض المخاطرة، التكلفة).
* **Actions**: Export Scenario, Adopt & Link to Case.

---

## 4. خريطة الصلاحيات والأدوار (RBAC Map)

| Role | Dashboard | Alerts | Cases | Employees | Analytics | Impact | Reports | Settings / Roles |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **System Admin** | System Health | Tech Alerts | System Cases | All | All (Anonymized options) | System Level | All | **Full Access** |
| **Executive** | Executive Summary | High Level | View High Impact | Restricted (No PII) | High Level/Org-wide | Org-wide Impact | Exec Reports | No Access |
| **HR Manager** | HR Metrics | HR Alerts | Create/Manage/Assign | Full Access | Full Access | Full Access | Org/Dept Reports | Department Rules |
| **Manager** | My Team Metrics | Team Alerts | Manage Team Cases | My Team Only | My Team Only | Team Impact | Team Reports | No Access |
| **Group Admin** | Group Metrics | Group Alerts | Manage Group Cases | Group Only | Group Only | Group Impact | Group Reports | Manage Group |
| **Data Analyst** | Data Quality / SLA | Data Alerts | Data/Model Cases | Anonymized | Full Raw Access | Model Impact | All Reports | Model Settings |
| **Employee** | My Performance | My Alerts | View My Cases | My Profile Only | No Access | No Access | No Access | No Access |

---

## 5. مسارات المستخدمين (User Flows)

### مسار 1: من التنبيه إلى إغلاق الحالة (Alert to Case Lifecycle)
1. **Trigger**: تنبيه يصل للنظام (مثال: موظف X سجل تراجع حاد في الأداء).
2. **Review**: ينقر (Manager) على التنبيه لفتح الـ Drawer الخاص به، يقرأ (Signal) والتفسير (XAI).
3. **Initiate**: يضغط على [Open Case]. تفتح نافذة إنشاء الحالة محملة مسبقاً ببيانات التنبيه والموظف.
4. **Action**: يقوم باختيار تدخل (مثل: توجيه / تخفيف مهام)، يعين مسؤول (Assignee)، ويحفظ.
5. **Monitor**: تتغير حالة الـ Case إلى "قيد التنفيذ".
6. **Measure & Close**: بعد فترة، يراجع (Manager) صفحة (Impact Analysis) للتدخل المعني، ويغلق الحالة (Close) بعد توثيق الأثر.

### مسار 2: التوصية، المحاكاة، ثم التدخل (Employee Profile Drop-in)
1. **Explore**: يتصفح (HR) ملف الموظف (Y) ذو الرتبة المهمة ويرى مؤشر (مخاطر استقالة 85%).
2. **Recommend**: يدخل على تبويب (Recommendations). النظام يقترح: (زيادة حوافز 10% أو تدريب متقدم).
3. **Simulate**: يضغط على زر المحاكاة بجانب التوصية. يفتح واجهة (What-if).
4. **Test**: يحرك مؤشر الحوافز، فيرى تقليص المخاطرة إلى 30%.
5. **Adopt**: يضغط [Adopt & Open Case]، يُنشئ حالة للمطالبة بالزيادة المالية واعتمادها.

---

## 6. معايير القبول (Acceptance Criteria)

* **القابلية للوصول وكفاءة التنقل:**
  * يمكن للمستخدم تحويل أي **إشارة (Signal) أو تنبيه (Alert) إلى حالة (Case)** في أقل من أو يساوي **2 نقرات**.
  * مسارات "What-If" يمكن البدء فيها مباشرة من ملف الموظف دون فقدان سياق واجهة الموظف الحالي.
* **إدارة الحالات (Case-Centricity):**
  * لا يمكن إجراء تطبيق قرار مهم (مثل إنهاء محاكاة واعتمادها) إلا من خلال ربطها إما بتحديث حالة قائمة أو فتح حالة جديدة.
  * كل حالة (Case) تحتوي إجبارياً على: Owner, Status, Audit Trail مفصل بالتوقيت.
* **الأمن وصلاحيات الوصول (RBAC):**
  * واجهة المستخدم تتكيف تلقائياً؛ لا تظهر القوائم أو الإجراءات غير المصرح بها للدور الحالي بدلاً من إظهار رسالة خطأ لاحقاً.
  * السرية: البيانات التفصيلية (كسبب الاستقالة الدقيق) وتفسير العدالة تكون مرئية لـ HR/Manager للموظف التابع لهم فقط.
* **قابلية التصدير (Exportability):**
  * جميع الجداول والقوائم وقوائم الحالات والتقارير تحتوي زر [تصدير] للتحميل بصيغ (CSV, Excel, PDF).
* **معالجة الحالات الجانبية (Edge Cases):**
  * عرض واضح وصريح للمستخدم في حال انعدام البيانات (Empty State).
  * رسائل محددة أثناء تحميل تحليلات المحاكاة (Loading State) لمنع الإجراءات المكررة.
