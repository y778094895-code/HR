# API Gap Analysis Report

## نظرة عامة (Overview)
هذا التقرير يوضح الفجوات بين ما تطلبه واجهة المستخدم (Frontend) وما يقدمه الـ Gateway والـ Backend/ML فعليًا.
تم تحليل Endpoints المستهلكة في `client/src/services/resources` ومقارنتها مع `infrastructure/api-gateway/src/routes.js` و `server/api/controllers/*.ts`.

## ملخص الفجوات (Gap Summary)
- الواجهة تستهلك حوالي **50+ endpoint**.
- الـ Gateway يغطي أغلب المسارات الرئيسية، ويقوم بعملية توجيه (Proxy) صحيحة لخدمة `employee-service` بشكل أساسي وخدمات أخرى.
- الـ **Backend (Node.js)** يفتقر إلى **70%** من وحدات التحكم (Controllers) اللازمة لتلبية طلبات الواجهة. تم تطبيق (Mocking) في عدد قليل منها (`employees`, `dashboard` جزئيًا).

---

## تفاصيل الفجوات (Detailed Gaps)

### 1. ❌ وحدات تحكم غير موجودة بالكامل (Missing Controllers)
الواجهة تطلب هذه المسارات والـ Gateway يوجهها، لكن الـ Backend غير مزود بأي Controller لها:
* **Performance** (`/api/performance/*`): `getOverview`, `getEmployees`, `getDepartments`, `getRecommendations`, `getEmployeeDetail` -> **Suggested Fix:** إنشاء `server/api/controllers/performance.controller.ts`
* **Training** (`/api/training/*`): `getSkillsGaps`, `getRecommendations`, `approve`, `reject`, `getEffectiveness` -> **Suggested Fix:** إنشاء `server/api/controllers/training.controller.ts`
* **Reports** (`/api/reports/*`): `getTemplates`, `createJob`, `getJob`, `download` -> **Suggested Fix:** إنشاء `server/api/controllers/reports.controller.ts`
* **Turnover** (`/api/turnover/*`): `getMetrics`, `getRisks`, `getRiskDetail` -> **Suggested Fix:** إنشاء `server/api/controllers/turnover.controller.ts`
* **Users** (`/api/users/*`): `getAll`, `create`, `update`, `delete` -> **Suggested Fix:** إنشاء `server/api/controllers/users.controller.ts`
* **Impact** (`/api/impact/*`): `getOverview`, `getEmployeeImpact`, `getDepartmentImpact` -> **Suggested Fix:** إنشاء `server/api/controllers/impact.controller.ts`
* **Recommendations** (`/api/recommendations/*`): كل الـ REST endpoints باستثناء ما يتم توليده في ML -> **Suggested Fix:** إنشاء `server/api/controllers/recommendations.controller.ts`

### 2. ⚠️ وحدات تحكم موجودة ولكن غير مكتملة (Incomplete Controllers)
هذه الـ Controllers موجودة ولكنها تفتقر للـ Endpoints المحددة:
* **Auth** (`auth.controller.ts`):
  * موجود: `POST /api/auth/login`
  * مفقود: `POST /register`, `POST /logout`, `GET /me`, `POST /refresh-token`
* **Employees** (`employee.controller.ts`):
  * مفقود: `GET /employees/:id/performance`
* **Fairness** (`fairness.controller.ts`):
  * موجود: `GET /` فقط.
  * مفقود: `/metrics`, `/comparison`, `/recommendations`, `/analyze`, `/matrix`, `/gap-analysis`.
* **Interventions** (`intervention.controller.ts`):
  * موجود: `GET /` فقط.
  * مفقود: `/interventions/:id`, `POST /interventions`, `PATCH /status`, `POST /log`, `/analytics`, `/history`, `POST /assign`, `POST /close`.

### 3. ⚠️ مشكلة توجيه / اختلاف في الردود (Routing & Response Shape Mismatch)
* **Dashboard**: 
  * الواجهة تطلب `/api/dashboard`, `/api/dashboard/kpis`, `/api/dashboard/trends`.
  * الـ Gateway يعيد توجيه القواعد المكتوبة إلى `/api/dashboard/stats` إذا كان المسار فارغاً.
  * الـ Backend (`dashboard.controller.ts`) يحمل فقط `GET /stats` والذي يرجع بيانات Mock. إذا طلبت الواجهة `/kpis` ستواجه 404 (Not Found) لأنه غير مُعرف في الـ Controller.

### 4. ⚠️ تقاطعات خدمة الـ ML (ML Service Integrations)
* ML Service تملك مسار `POST /predictions/turnover`. الواجهة تستدعي `POST /turnover/predict/:employeeId`. يُفترض أن بوابة الـ Node.js Backend هي من تقوم باستدعاء خدمة ML أو أن الـ Gateway هو من يقوم بذلك. حاليًا Gateway يوجه `/api/turnover` إلى `employee-service`.
* ML Service تملك `POST /recommendations/`. Node backend غير مزود بأي معالج لتمرير أو حفظ هذه التوصيات للمستخدم.

---

## خطة الإصلاح المقترحة (Suggested Action Plan)
1. إنشاء جميع الـ Controllers المفقودة كملفات فارغة مهيأة (Skeleton) لضمان عدم حدوث `404 Not Found`.
2. استكمال الـ Endpoints المفقودة في `auth.controller.ts` و `fairness.controller.ts` و `intervention.controller.ts`.
3. تعديل `dashboard.controller.ts` ليطابق واجهة المستخدم بشكل دقيق (`/`, `/kpis`, `/trends`).
4. ربط مسارات الـ Prediction والتوصيات المتواجدة في الواجهة مع الـ ML Service عن طريق الـ Backend (BFF/Proxy).
