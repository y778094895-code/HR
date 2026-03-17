# Domain Types Standard

## Overview
Domain entities are now standardized in `client/src/types/`. This separation of concerns ensures that type definitions are easily locatable and maintainable.

## Type Definitions

| Domain | File Location | Key Interfaces |
| :--- | :--- | :--- |
| **KPIs** | [`src/types/kpi.ts`](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/types/kpi.ts) | `KPI`, `Trend`, `DashboardData` |
| **Users** | [`src/types/users.ts`](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/types/users.ts) | `Employee`, `User` |
| **Risk** | [`src/types/risk.ts`](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/types/risk.ts) | `TurnoverRisk` |
| **Fairness** | [`src/types/fairness.ts`](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/types/fairness.ts) | `BiasMetric` |
| **Intervention** | [`src/types/intervention.ts`](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/types/intervention.ts) | `Intervention` |
| **XAI** | [`src/types/xai.ts`](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/types/xai.ts) | `ExplainabilityRecord` |
| **Training** | [`src/types/training.ts`](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/types/training.ts) | `TrainingModule` |
| **Reports** | [`src/types/reports.ts`](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/types/reports.ts) | `ReportConfig`, `ReportResult` |

## Importing Types
You can import types directly from their domain file or via the `types` alias if configured (recommended usage is direct import for clarity, or via the legacy `services/resources/types` for backward compatibility).

```typescript
// Recommended
import { KPI } from '@/types/kpi';

// Legacy / Backward Compatible
import { KPI } from '@/services/resources/types';
```
