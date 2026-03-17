# دليل الاختبار والتشغيل (Testing and Execution Guide)

هذا الدليل يوضح خطوات تشغيل واختبار نظام "Smart Performance System" بشكل كامل، بما في ذلك الواجهة الخلفية (Backend)، بوابة الـ API (API Gateway)، والواجهة الأمامية (Client).

## 1. أوامر بدء التشغيل (Startup Commands)

يمكن تشغيل النظام بطريقتين: **بيئة التطوير المحلية (Local Development)** أو **بيئة الحاويات الكاملة (Full Docker)**.

### الخيار أ: تشغيل بيئة التطوير المحلية (موصى به للتطوير)
في هذا الوضع، نستخدم Docker لتشغيل البنية التحتية (قواعد البيانات، Redis، إلخ) بينما نشغل الخدمات (Backend, Gateway, Client) يدوياً لمراقبة التغييرات.

1.  **تشغيل البنية التحتية فقط:**
    ```powershell
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
    docker-compose up -d postgres redis rabbitmq consul prometheus grafana elasticsearch kibana
    ```

2.  **تشغيل الخدمات (في نوافذ Terminal منفصلة):**

    *   **نافذة 1: تشغيل السيرفر (Backend - Employee Service)**
        ```powershell
        cd server
        npm install  # (مرة واحدة فقط)
        npm run start:dev
        ```
        > المنفذ الافتراضي: `3000`

    *   **نافذة 2: تشغيل بوابة الـ API (API Gateway)**
        ```powershell
        cd infrastructure/api-gateway
        npm install  # (مرة واحدة فقط)
        npm run dev
        ```
        > المنفذ الافتراضي: `8080` (يعمل كوكيل للعناوين الأخرى)

    *   **نافذة 3: تشغيل الواجهة الأمامية (Frontend - Client)**
        ```powershell
        cd client
        npm install  # (مرة واحدة فقط)
        npm run dev
        ```
        > المنفذ الافتراضي: `5173`

### الخيار ب: تشغيل النظام بالكامل باستخدام Docker
لتشغيل كل شيء في حاويات (بما في ذلك التطبيقات):

```powershell
docker-compose up -d --build
```
> في هذا الوضع، يتم تقديم الواجهة الأمامية عادةً عبر Nginx أو تكون مدمجة مع البوابة (حسب الإعدادات)، ويتم الوصول إليها عبر `http://localhost:8080` أو المنفذ المحدد في `docker-compose.yml`.

---

## 2. أوامر التحقق من الاتصال (Connection Verification)

للتأكد من أن الـ API Gateway يوجه الطلبات بشكل صحيح إلى الخدمات الخلفية، استخدم أوامر `curl` التالية في الـ Terminal:

**أ. فحص صحة البوابة (Gateway Health Check):**
```powershell
curl http://localhost:8080/api/health
```
> **المتوقع:** استجابة `200 OK` مع حالة النظام.

**ب. فحص قائمة الموظفين (عبر البوابة):**
```powershell
curl http://localhost:8080/api/employees
```
> **المتوقع:** قائمة بصيغة JSON تحتوي على بيانات الموظفين. إذا كان هناك خطأ في الاتصال بقاعدة البيانات، تأكد من تشغيل حاوية `postgres`.

**ج. فحص خدمة الذكاء الاصطناعي (ML Service - عبر البوابة):**
```powershell
curl http://localhost:8080/api/ml/health
```
*(ملاحظة: تأكد من أن مسار التوجيه في البوابة مطابق لهذا الرابط).*

---

## 3. دليل التحقق من الواجهة (Frontend Verification)

للتأكد من أن المتصفح يتصل بالـ API دون مشاكل (مثل CORS Errors):

1.  افتح المتصفح واذهب إلى رابط الواجهة الأمامية (عادة `http://localhost:5173` في وضع التطوير).
2.  افتح أدوات المطور (**F12** أو **Right Click > Inspect**).
3.  انتقل إلى تبويب **Network**.
4.  قم بإجراء إجراء يتطلب اتصالاً بالسيرفر (مثلاً: تسجيل الدخول أو عرض قائمة الموظفين).
5.  راقب الطلبات المرسلة إلى `http://localhost:8080/api/...`.
    *   **اللون الأخضر (200/201):** الاتصال ناجح.
    *   **اللون الأحمر (400/500):** خطأ في السيرفر.
    *   **خطأ CORS (Blocked by CORS policy):** يعني أن إعدادات الـ Gateway أو السيرفر لا تسمح للمتصفح بالوصول. تأكد من إعدادات `cors` في `infrastructure/api-gateway/server.js` أو `server/main.ts`.

---

## 4. أوامر إعادة البناء (Build & Rebuild)

في حال قمت بتعديل كود، قد تحتاج إلى إعادة بناء الحزم أو الصور:

**أ. تحديث حزم Node.js (عند تغيير package.json):**
```powershell
# في كل مجلد (server, client, gateway)
npm install
```

**ب. إعادة بناء حاويات Docker (عند تعديل Dockerfile أو docker-compose):**
```powershell
docker-compose down
docker-compose up -d --build
```

**ج. تنظيف Docker بالكامل (في حال واجهت مشاكل غريبة):**
```powershell
docker-compose down -v  # تحذير: هذا سيحذف بيانات قواعد البيانات
docker system prune -a  # تحذير: هذا سيحذف جميع الصور غير المستخدمة
```
