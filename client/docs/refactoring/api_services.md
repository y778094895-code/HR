# خدمات API المستقلة - الدليل التقني

## 1. هيكلية الخدمات
```
services/
├── api/           # HTTP Client & Configuration
├── resources/     # API Services by Resource (Dashboard, Employees, etc.)
├── cache/         # Caching Layer (In-memory)
└── transformers/  # Data Transformation (Adapter Pattern)
```

## 2. نمط الاستخدام

### 2.1 الاستيراد والاستخدام
```typescript
import { dashboardService } from '@/services/resources/dashboard.service';

const useDashboardData = () => {
  useEffect(() => {
    dashboardService.getDashboardData().then(setData);
  }, []);
};
```

### 2.2 الميزات المتقدمة
- **Caching**: يتم تخزين البيانات تلقائيًا لفترة محددة (TTL).
- **Transformation**: يتم تحويل بيانات الواجهة الخلفية إلى نموذج الواجهة الأمامية عبر `transformers/`.
- **Interceptors**: يتم إضافة توكن المصادقة تلقائيًا، ومعالجة أخطاء 401 مركزيًا.

## 3. دليل الترحيل
- استبدل `axios.get` المباشر بـ `resourceService.getData()`.
- انقل تعريفات الأنواع (Types) إلى `services/resources/types.ts`.
- استخدم `cacheManager` للبيانات التي لا تتغير كثيرًا.
