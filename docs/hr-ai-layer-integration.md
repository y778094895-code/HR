# دمج خدمة HR AI Layer

## 1. ملخص الدمج
تم دمج مشروع `hr_ai_layer` في الـ `smart_performance_system` كخدمة مستقلة داخليًا. تم التأكد من عدم التأثير على التوجيه المباشر في الـ `gateway`، والاعتماد على خدمة `hr-ai-layer` الجديدة بشكل أساسي، مع بقاء `ml-service` كخدمة احتياطية (Fallback) في حالة الفشل. لم تُجرَ أي تغييرات على الـ `client` ولا واجهات الـ Frontend، وتم تكوين `hr-ai-layer` ليقوم بعرض التنبؤات استنادًا إلى قواعد بيانات معزولة.

## 2. الملفات المعدلة
* `docker-compose.yml`
* `server/data/external/ml.service.client.ts`
* `.env.example`
* `server/.env`
* `postgres/migrations/0018_ai_layer_views.sql` (ملف جديد)

## 3. المتغيرات الجديدة والتعديلات
* **`docker-compose.yml`**:
  - تم تعريف خدمة `hr-ai-layer` واستخدام `expose: "8000"` للاتصال الداخلي.
  - تم ربط الـ volume للإشارة إلى النموذج `attrition_rf_v1.joblib`.
  - داخل `employee-service`، أُضيفت متغيرات الـ AI الجديدة للتحكم بالتوجيه (URL الخاص بالطبقة على `http://hr-ai-layer:8000`).

* **`ml.service.client.ts`**:
  - أُزيل الاعتماد المباشر على `localhost` للخدمات داخل الشبكة.
  - تم توحيد الاستجابة المستلمة من `hr_ai_layer` لتطابق الهيكل الجديد المتوقع في النظام:
    - `employeeId`
    - `riskScore`
    - `riskLevel`
    - `confidenceScore`
    - `factors`
    - `contributingFactors`
    - `modelVersion`

* **`.env.example` و `server/.env`**:
  - `HR_AI_LAYER_ENABLED=true`
  - `HR_AI_LAYER_URL=http://localhost:8001` (للاتصال من الخارج إذا لزم الأمر للبيئة المحلية)
  - `HR_AI_LAYER_TIMEOUT_MS=5000`
  - `ML_SERVICE_URL=http://localhost:8000`

## 4. شرح الـ migration (`0018_ai_layer_views.sql`)
الملف أُنشِئ بمواصفات دقيقة لتجهيز بيانات طبقة الـ AI:
* بناء Schema منعزلة `ai_layer`.
* بناء الـ Materialized Views التابعة للمشروع وهي:
  - `ai_layer.sim_survival_horizon_dataset_v1`
  - `ai_layer.sim_performance_panel_dataset_v4`
* استخدام الجداول الفعلية (`employees_local`, `resignation_events`, `perf_assessments`).
* إضافة Indices محددة لتحسين الأداء على مستوى `(employee_id, record_date)` وعلى مستوى `(record_date)`.
* عدم إنشاء أي جداول إضافية مثل `ai_models`، `predictions`، أو `prediction_explanations`.

## 5. خطوات التشغيل
1. تأكد من تحميل متغيرات البيئة بإنشاء/تعديل ملف الـ `.env` من `.env.example`.
2. قم بتنفيذ الهجرة الأخيرة:
   ```bash
   npm run db:migrate # أو ما يعادلها في المشروع
   ```
3. قم ببناء أو تشغيل الحاويات:
   ```bash
   docker-compose up -d --build
   ```

## 6. خطوات التحقق
* تأكد من أن خدمة `hr-ai-layer` تعمل وتتجاوز فحص `healthcheck`.
* قم بتجربة طلبات التنبؤ بالتسرب من الـ Frontend (مثل صفحة الـ Dashboard للملفات الشخصية). الخدمة يجب أن تستجيب بالهيكل الجديد.
* إذا فشلت `hr-ai-layer` لأي سبب، تأكد من أن النتيجة الوهمية (Fallback) الخاصة بـ `ml-service` يتم استلامها بنجاح دون أخطاء في الـ Server.

## 7. العناصر غير المكتملة
* **نموذج الذكاء الاصطناعي (`attrition_rf_v1.joblib`)**: تأكد من توليد ملف النموذج المدرب الفعلي ووضعه داخل المسار المطلق `hr_ai_layer/artifacts/models/`. الخدمة حاليًا ستفشل بالرد إذا لم تعثر عليه وتعود إلى نظام `Fallback`.
