# API Endpoint Catalog (Final Delivery)

هذا المستند يوثق تدفق البيانات النهائي من واجهة المستخدم (UI) مروراً ببوابة الـ API (Gateway) وصولاً للخدمات الخلفية (Backend/ML) وقواعد البيانات (DB).

تم في المرحلة الحالية تطبيق نمط Backend-For-Frontend عبر Node.js لتجميع الردود وتوحيد صيغة (ApiResponse) للـ Gateway، مع بقاء الواجهة الأمامية تتحدث ببروتوكول موحد.

## Authentication (`/api/auth`)
| Frontend Service | Method | Route | Gateway | Backend Handler | DB Table |
|---|---|---|---|---|---|
| `authService.login` | POST | `/auth/login` | ✅ `employee-service` | `AuthController.login` | `users` |
| `authService.register` | POST | `/auth/register` | ✅ | `AuthController.register` | `users`, `employees` |
| `authService.logout` | POST | `/auth/logout` | ✅ | `AuthController.logout` | - |
| `authService.getCurrentUser` | GET | `/auth/me` | ✅ | `AuthController.getCurrentUser`| `users`, `employees` |
| `authService.refreshToken` | POST | `/auth/refresh-token`| ✅ | `AuthController.refreshToken`| - |

## Dashboard (`/api/dashboard`)
| Frontend Service | Method | Route | Gateway | Backend Handler | DB Table |
|---|---|---|---|---|---|
| `dashboardService.getDashboardData`| GET | `/dashboard` (proxied to `/dashboard/stats`) | ✅ | `DashboardController.getStats` | `employees`, `kpis` |
| `dashboardService.getKPIs` | GET | `/dashboard/kpis` | ✅ | `DashboardController.getKpis` | `kpis` |
| `dashboardService.getTrends` | GET | `/dashboard/trends`| ✅ | `DashboardController.getTrends`| `performance` |

## Employees (`/api/employees`)
| Frontend Service | Method | Route | Gateway | Backend Handler | DB Table |
|---|---|---|---|---|---|
| `employeeService.getEmployees` | GET | `/employees` | ✅ `employee-service` | `EmployeeController.getAllEmployees` | `employees` |
| `employeeService.getEmployeeById`| GET | `/employees/:id` | ✅ | `EmployeeController.getEmployeeById` | `employees` |
| `employeeService.createEmployee` | POST | `/employees` | ✅ | `EmployeeController.createEmployee` | `employees` |
| `employeeService.updateEmployee` | PUT | `/employees/:id` | ✅ | `EmployeeController.updateEmployee` | `employees` |
| `employeeService.deleteEmployee` | DELETE| `/employees/:id` | ✅ | `EmployeeController.deleteEmployee` | `employees` |

## Interventions (`/api/interventions`)
| Frontend Service | Method | Route | Gateway | Backend Handler | DB Table |
|---|---|---|---|---|---|
| `interventionService.findAll` | GET | `/interventions` | ✅ `employee-service` | `InterventionController.getAll` | `interventions` |
| `interventionService.findOne` | GET | `/interventions/:id` | ✅ | `InterventionController.getById` | `interventions` |
| `interventionService.create` | POST | `/interventions` | ✅ | `InterventionController.create` | `interventions` |
| `interventionService.update` | PATCH | `/interventions/:id`| ✅ | `InterventionController.update` | `interventions` |

## Fairness (`/api/fairness`)
| Frontend Service | Method | Route | Gateway | Backend Handler | DB Table |
|---|---|---|---|---|---|
| `fairnessService.getMetrics` | GET | `/fairness/metrics`| ✅ `employee-service` | `FairnessController.getMetrics` | `bias_metrics` |
| `fairnessService.getComparison`| GET | `/fairness/comparison`| ✅ | `FairnessController.getComparison` | - |

## Recommendations (`/api/recommendations`)
| Frontend Service | Method | Route | Gateway | Backend Handler | DB Table |
|---|---|---|---|---|---|
| `recommendationsApi.findAll` | GET | `/recommendations` | ✅ `employee-service`| `RecommendationsController.getAll` | `recommendations` |
| `recommendationsApi.generate` | POST | `/recommendations/generate/:employeeId`| ✅ | `RecommendationsController.generate`| `recommendations` |
| `recommendationsApi.takeAction`| POST | `/recommendations/:id/accept\|reject`| ✅ | `RecommendationsController.takeAction`| `recommendations` |

## Performance (`/api/performance`)
| Method | Route | Gateway | Backend Handler | DB Table |
|---|---|---|---|---|
| GET | `/performance/overview` | ✅ `employee-service` | `PerformanceController.getOverview` | `perf_cycles` |
| GET | `/performance/employees` | ✅ | `PerformanceController.getEmployees` | `perf_assessments`|
| GET | `/performance/employees/:id` | ✅ | `PerformanceController.getEmployeeDetail` | `perf_kpi_scores` |
| GET | `/performance/departments` | ✅ | `PerformanceController.getDepartments` | `perf_assessments`|
| GET | `/performance/recommendations` | ✅ | `PerformanceController.getRecommendations` | - |

## Training (`/api/training`)
| Method | Route | Gateway | Backend Handler | DB Table |
|---|---|---|---|---|
| GET | `/training/skills/:id/gaps` | ✅ `employee-service` | `TrainingController.getSkillsGaps` | `skill_catalog` |
| GET | `/training/recommendations` | ✅ | `TrainingController.getRecommendations` | `training_programs` |
| POST| `/training/recommendations/:id/approve` | ✅ | `TrainingController.approveRecommendation` | `training_enrollments` |
| POST| `/training/recommendations/:id/reject` | ✅ | `TrainingController.rejectRecommendation` | `training_enrollments` |
| GET | `/training/effectiveness` | ✅ | `TrainingController.getEffectiveness` | `training_enrollments` |

## Reports (`/api/reports`)
| Method | Route | Gateway | Backend Handler | DB Table |
|---|---|---|---|---|
| GET | `/reports/templates` | ✅ `employee-service` | `ReportsController.getTemplates` | `report_definitions` |
| POST| `/reports/jobs` | ✅ | `ReportsController.createJob` | `report_runs` |
| GET | `/reports/jobs/:id` | ✅ | `ReportsController.getJobStatus` | `report_runs` |
| GET | `/reports/jobs/:id/download` | ✅ | `ReportsController.downloadReport` | `report_outputs` |

## Turnover & ML (`/api/turnover` and `/api/ml`)
| Method | Route | Gateway | Backend Handler | External Service |
|---|---|---|---|---|
| GET | `/turnover/metrics` | ✅ `employee-service` | `TurnoverController.getDashboardMetrics` | - |
| GET | `/turnover/risks` | ✅ | `TurnoverController.getRiskList` | - |
| GET | `/turnover/risks/:id` | ✅ | `TurnoverController.getRiskDetail` | - |
| POST| `/turnover/predict/:id` | ✅ | `TurnoverController.predictRisk` | ML Service |
| POST| `/ml/predictions/turnover`| ✅ | `MLController.predictTurnover` | ML Service `POST /predictions/turnover` |
| POST| `/ml/predictions/batch` | ✅ | `MLController.predictTurnoverBatch` | ML Service `POST /predictions/batch` |

## Users (`/api/users`)
| Method | Route | Gateway | Backend Handler | DB Table |
|---|---|---|---|---|
| GET | `/users` | ✅ `employee-service` | `UsersController.getAll` | `users` |
| POST| `/users` | ✅ | `UsersController.create` | `users` |
| PUT | `/users/:id` | ✅ | `UsersController.update` | `users` |
| DELETE| `/users/:id` | ✅ | `UsersController.delete` | `users` |

## Impact (`/api/impact`)
| Method | Route | Gateway | Backend Handler | DB Table |
|---|---|---|---|---|
| GET | `/impact/overview` | ✅ `employee-service` | `ImpactController.getOverview` | Mock/Derivations |
| GET | `/impact/employee/:id` | ✅ | `ImpactController.getEmployeeImpact` | Mock/Derivations |
| GET | `/impact/department/:dep` | ✅ | `ImpactController.getDepartmentImpact`| Mock/Derivations |
