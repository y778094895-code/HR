# Case-Centric UI/UX Refactor Changelog

## 1. Summary
This refactor completed the migration of the Smart HR System's client application from an analytics-centric interface to a **Case-Centric Information Architecture**. 
Analytics engines (Performance, Attrition, Fairness) now produce "Signals" and "Alerts" which are seamlessly converted into trackable **Cases** encompassing a full intervention lifecycle (Open → Assign → Action → Monitor → Measure → Close).

**High-Level Navigation Changes:**
- Restructured the sidebar navigation (`_nav.ts`) to align precisely with the 15-item Case-Centric IA.
- Added strict support for Arabic labels (`ar.json`) reflecting terminology such as "إدارة الحالات والتدخلات" (Case Management) and "مركز التنبيهات" (Alerts Center).
- Preserved existing alias routes for backward compatibility.

---

## 2. File Change Inventory

### Added Files
- `client/src/pages/dashboard/AlertsPage.tsx`
  - **Reason:** Root page container for the new Alerts Center.
- `client/src/pages/dashboard/CasesPage.tsx`
  - **Reason:** Root page container for the Core Case Management Center.
- `client/src/pages/dashboard/DataQualityPage.tsx`
  - **Reason:** Root page container for the Data Quality Dashboard.
- `client/src/components/features/alerts/AlertsList.tsx`
  - **Reason:** Renders the main data table for System Alerts.
- `client/src/components/features/alerts/AlertDrawer.tsx`
  - **Reason:** Displays alert details and handles the conversion of an alert into a new Case.
- `client/src/components/features/cases/CasesList.tsx`
  - **Reason:** Renders grouped sub-lists of cases based on their lifecycle status.
- `client/src/components/features/cases/CaseDetailsDrawer.tsx`
  - **Reason:** High-fidelity drawer to manage Case Actions/Interventions, Signals, and Timelines.
- `client/src/components/features/data-quality/DataQualityDashboard.tsx`
  - **Reason:** Implemented the UI to scan and monitor conflicting/missing HR records.
- `client/src/stores/business/alert.store.ts`
  - **Reason:** Zustand mock state store for Alerts (as no backend API currently handles unified alerts).
- `client/src/stores/business/case.store.ts`
  - **Reason:** Zustand mock state store mapping the lifecycle and interventions of cases.
- `docs/client-ui-refactor-changelog.md`
  - **Reason:** This file, fulfilling the documentation requirements of the refactor.

### Modified Files
- `client/src/App.tsx`
  - **Reason:** Added router paths for `/dashboard/alerts`, `/dashboard/cases`, `/dashboard/data-quality`, and `/dashboard/recommendations`.
- `client/src/components/layout/_nav.ts`
  - **Reason:** Overhauled Sidebar export arrays/icons to match the required 15 elements Case-Centric list.
- `client/src/locales/ar.json`
  - **Reason:** Re-mapped and inserted Arabic terms for newly introduced hubs (Alerts, Cases, Data Quality...).
- `client/src/locales/en.json`
  - **Reason:** Ensured English fallbacks accurately reflect Case-Centric terminology.
- `client/src/components/features/attrition/RiskDetailDrawer.tsx`
  - **Reason:** Upgraded "Log Intervention" UI to trigger the creation of a Case.
- `client/src/components/features/performance/EmployeePerformanceList.tsx`
  - **Reason:** Transitioned "Initiate PIP" and "Review" buttons to trigger robust Case representations instead of `console.log`.
- `client/src/components/features/fairness/DemographicAnalysis.tsx`
  - **Reason:** Wired high/medium disparity markers directly to the "Open Fairness Case" pipeline for Admins.
- `client/src/components/features/interventions/RecommendationsList/RecommendationsList.tsx`
  - **Reason:** Changed the "Apply Recommendation" API success block to additionally bootstrap an HR case linked to the recommendation.

### Replaced/Removed Files
- *(None - safely utilized legacy elements and aliases routing to ensure no current imports were irrevocably broken).*

---

## 3. Route Map After Refactor
| Route | IA Section Mapping | Status / Role |
| :--- | :--- | :--- |
| `/dashboard` | 1. Dashboard | All |
| `/dashboard/alerts` | 2. Alerts Center | All |
| `/dashboard/cases` | 9. Case Management | All |
| `/dashboard/vo-employees` | 3. Employees | Admin, Manager |
| `/dashboard/performance` | 4. Performance Intelligence | Admin, Manager |
| `/dashboard/attrition` | 5. Attrition & Turnover | Admin, Manager |
| `/dashboard/training` | 6. Training Needs | Admin, Manager, HR |
| `/dashboard/fairness` | 7. Fairness Monitoring | Admin Only |
| `/dashboard/recommendations`| 8. Recommendations & What-if | Admin, Manager |
| `/dashboard/impact` | 10. Impact Analysis | Admin, Manager |
| `/dashboard/reports` | 11. Reports & Exports | Admin, Manager |
| `/dashboard/data-quality` | 12. Data Quality | Admin, Super Admin |
| `/dashboard/users` | 13. Users & Permissions | Admin, Super Admin |
| `/dashboard/settings` | 14. Settings | All |
| `/dashboard/help` | 15. Help | All |
| `/dashboard/interventions` | *(Alias fallback)* | Backward Compatibility |

---

## 4. Known Limitations
- Data for Cases and Alerts currently rely on `localStorage` state (via Zustand persist) due to the absence of active unified microservice endpoints for these domain models.
- Impact Analysis metrics inside the new `CaseDetailsDrawer` are represented via placeholder logic as time-series backend evaluation engines were outside the explicit scope of this immediate frontend refactoring task.
- Recommendation What-If comparisons retain previous iteration features with only the terminal "Approve" action connected to case mapping, awaiting deeper backend calculation APIs.
