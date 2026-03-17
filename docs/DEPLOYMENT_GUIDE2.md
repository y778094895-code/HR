# Smart HR System - Comprehensive Deployment Guide

## 📋 جدول المحتويات
1. [نظرة عامة على النشر](#نظرة-عامة-على-النشر)
2. [متطلبات النظام](#متطلبات-النظام)
3. [النشر المحلي (Development)](#النشر-المحلي-development)
4. [النشر على Staging](#النشر-على-staging)
5. [النشر على Production](#النشر-على-production)
6. [النشر على Kubernetes](#النشر-على-kubernetes)
7. [النشر على السحابة](#النشر-على-السحابة)
8. [الترقية والصيانة](#الترقية-والصيانة)
9. [النسخ الاحتياطي والاستعادة](#النسخ-الاحتياطي-والاستعادة)
10. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## 1. نظرة عامة على النشر
تم تصميم نظام Smart HR Performance Management System باستخدام معمارية الخدمات المصغرة (Microservices Architecture). يتكون النظام من واجهة أمامية (React/Vite)، وطبقة بوابة واجهة برمجة تطبيقات (API Gateway)، وخدمات خلفية (Node.js/NestJS)، وخدمة تعلم آلي (Python/FastAPI)، بالإضافة إلى بنية تحتية قوية تعتمد على PostgreSQL, Redis, RabbitMQ, و Consul لاكتشاف الخدمات.

نحن نتبع منهجية (12-Factor App) لضمان سهولة النشر والتوسع على مختلف البيئات (محلي، خوادم، سحابة، و Kubernetes).

---

## 2. متطلبات النظام

### متطلبات الخادم (Minimum Requirements)
* **المعالج (CPU):** 4 النوى (Cores) على الأقل.
* **الذاكرة العشوائية (RAM):** 8 جيجابايت (16 جيجابايت موصى بها للإنتاج).
* **مساحة التخزين:** 50 جيجابايت SSD.
* **نظام التشغيل:** Linux (Ubuntu 22.04 LTS / Debian 11) أو Windows Server مع WSL2.

### البرامج الأساسية
* Docker Engine (v24+)
* Docker Compose (v2.20+)
* Node.js (v18+)
* Python (v3.9+)

---

## 3. النشر المحلي (Development)
تُستخدم هذه البيئة للمطورين لتشغيل النظام بالكامل على أجهزتهم المحلية.

1. **نسخ ملفات البيئة:**
   ```bash
   cp .env.example .env
   ```

2. **تشغيل النظام باستخدام Docker Compose الخاص بالتطوير:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```
   *(ملاحظة: تأكد من تشغيل الواجهة الأمامية `client` بشكل منفصل عبر `npm run dev` إذا لم تكن مضمنة في الـ Compose).*

3. **التحقق من الخدمات:**
   قم بتشغيل السكريبت المخصص للتحقق (Smoke Test):
   ```bash
   ./scripts/smoke/full-smoke.sh
   ```

---

## 4. النشر على Staging
بيئة Staging تكون مطابقة تقريبًا لبيئة الإنتاج وتُستخدم كخطوة أخيرة لاختبار الميزات قبل إطلاقها.

1. **ضبط المتغيرات:**
   تأكد من تعديل `.env` ليعكس إعدادات قاعدة بيانات Staging ومفاتيح API الخاصة بها.

2. **البناء والنشر (Build & Deploy):**
   يفضل استخدام CI/CD (مثل GitHub Actions) للبناء التلقائي للإصدارات ودفعها إلى Docker Registry، ثم سحبها إلى خادم Staging.
   ```bash
   docker-compose -f docker-compose.yml pull
   docker-compose -f docker-compose.yml up -d
   ```

---

## 5. النشر على Production
بيئة الإنتاج تتطلب مستوى عالٍ من الأمان والموثوقية. نعتمِد هنا على التوسع (Scaling) ومراقبة الأداء.

1. **عزل البنية التحتية:**
   يُنصح بتشغيل خدمات قواعد البيانات (PostgreSQL, Redis, RabbitMQ) على خوادم مُدارة منفصلة (Managed Services) بدلاً من Docker لضمان موثوقية التخزين والأداء العالي.

2. **التشغيل والربط:**
   اضبط الـ API Gateway و Nginx ليكونوا الـ Reverse Proxy الأساسي الذي يستقبل الزيارات ويوجهها. تأكد من إعداد شهادات SSL عبر Let's Encrypt أو Cloudflare.

3. **المراقبة (Monitoring):**
   تأكد من تشغيل حاويات Prometheus للقياسات (Metrics)، Elasticsearch/Kibana للسجلات (Logs)، و Grafana لتصوير البيانات المجمعة من الخدمات كافّة.

---

## 6. النشر على Kubernetes
توفر مجلدات `infrastructure/kubernetes` و `kubernetes/` الإعدادات المطلوبة للتشغيل ضمن مجموعات Kubernetes (K8s) لدعم تقنيات Blue/Green deployment و Horizontal Pod Autoscaling (HPA).

1. **إنشاء الـ Namespaces:**
   ```bash
   kubectl create namespace smart-hr
   ```

2. **تطبيق إعدادات الـ ConfigMaps و Secrets:**
   ```bash
   kubectl apply -f kubernetes/secrets.yaml -n smart-hr
   ```

3. **نشر الخدمات الأساسية (Deployments & Services):**
   ```bash
   kubectl apply -f kubernetes/ -n smart-hr
   ```

4. **تفعيل الـ Ingress Controller:**
   تأكد من ربط مجال (Domain) النظام بخدمة الانجرس لتوجيه حركة المرور بشكل صحيح إلى API Gateway.

---

## 7. النشر على السحابة
يدعم النظام العمل مع مزودي الخدمات السحابية الأساسيين:
* **AWS:** باستخدام EKS للحاويات، RDS لـ PostgreSQL، و ElastiCache لـ Redis.
* **Azure:** باستخدام AKS، Azure Database for PostgreSQL.
* **Google Cloud:** باستخدام GKE، Cloud SQL.

**توصية:** استخدم أدوات البنية التحتية ككود (Infrastructure as Code) مثل Terraform لتجهيز وحيازة الخوادم آلياً في السحابة لضمان التناسق.

---

## 8. الترقية والصيانة
* **استراتيجية التحديث:** نستخدم Rolling Updates على Kubernetes لضمان عدم توقف النظام (Zero Downtime).
* **تحديث قاعدة البيانات:**
   يتم تنفيذ تحديثات المخططات (Migrations) آلياً عبر خدمة الخلفية (Backend) أثناء بدء تشغيل الخدمة، أو عبر سكربت مخصص:
   ```bash
   npm run generate # Drizzle Generate
   npm run migrate  # Drizzle Migrate
   ```

---

## 9. النسخ الاحتياطي والاستعادة

* **قاعدة البيانات (PostgreSQL):**
   يجب إعداد وظيفة دورية (Cron Job) لأخذ نسخة `pg_dump` يومياً وتخزينها في مساحة آمنة (مثل AWS S3).
   ```bash
   docker-compose exec postgres pg_dump -U hr_user hr_system > backup.sql
   ```
* **الاستعادة (Restore):**
   ```bash
   cat backup.sql | docker-compose exec -T postgres psql -U hr_user hr_system
   ```

---

## 10. استكشاف الأخطاء
في حال واجهت أي مشاكل أثناء النشر، اتبع الخطوات التالية:

* **الخدمات لا تعمل (Containers Crashing):**
  تفحص سجلات الخدمة المتأثرة.
  ```bash
  docker-compose logs -f employee-service
  ```
* **مشاكل اكتشاف الخدمات المتصلة (Consul Routing):**
  تأكد أن واجهة Consul (على المنفذ `8500`) تعرض كافة الخدمات (API Gateway, ML Service, Employee Service) باللون الأخضر (Healthy).
* **الاتصال بقاعدة البيانات يفشل:**
  تأكد من إعدادات الشبكة وأن خادم قواعد البيانات يقبل الطلبات وافحص بيانات الدخول في ملف `.env`. 
* **واجهة المستخدم لا تتصل بالـ Backend:**
  تأكد أن الـ Frontend تم بناؤه مشيراً للرابط الصحيح للـ Gateway (عبر متغير `VITE_API_URL`).
