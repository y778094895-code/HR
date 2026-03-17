# UI/Logic Separation - الدليل التقني

## 1. المبادئ المعتمدة
- **Presentational Components**: تعرض فقط، لا منطق. تستقبل البيانات عبر `props`.
- **Container Components**: تحتوي المنطق، تمرر البيانات للمكونات التقديمية.
- **Custom Hooks**: تغليف وإعادة استخدام المنطق (API calls, side effects).

## 2. الهيكلية الجديدة
```
components/
├── ui/           # ← Presentational فقط (Shared)
├── features/     # ← Feature-based modules
│   └── [FeatureName]/
│       ├── [ComponentName]/
│       │   ├── index.tsx      # Container (يستخدم Hook)
│       │   ├── [Name].tsx     # Presentational
│       │   └── hooks/         # Co-located hooks
│       │       └── use[Name].ts
└── shared/       # ← مشترك بين الميزات
```

## 3. نماذج الاستخدام

### 3.1 إنشاء مكون جديد
1. **إنشاء مجلد الميزة**: `src/components/features/my-feature`
2. **Presentational Component**:
   ```typescript
   export const MyComponent: FC<Props> = ({ data, loading }) => {
     if (loading) return <Spinner />;
     return <div>{data}</div>;
   };
   ```
3. **Custom Hook**:
   ```typescript
   export const useMyComponent = () => {
     // Logic here
     return { data, loading };
   };
   ```
4. **Container**:
   ```typescript
   const MyComponentContainer = () => {
     const props = useMyComponent();
     return <MyComponent {...props} />;
   };
   ```

## 4. قواعد الترحيل
- نقل المكونات إلى `features/[feature]/`.
- فصل `useEffect` و `useState` في hooks.
- التأكد من عدم وجود استدعاءات API في `components/ui`.
