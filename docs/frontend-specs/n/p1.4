# Execution Plan (Ranked Phases to Stabilize)

This plan provides a targeted, structured sequence to resolve all identified architectural breaks and stabilize the full Frontend -> Gateway -> Backend -> AI flow.

### Phase 1: Controller Registration & Routing Integrity (Immediate 404 Fixes)
1. **Fix [server/api/index.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/index.ts)**: Import and register missing controllers ([ml](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/compose.debug.yaml), [turnover](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/ml-service/api/controllers/prediction_controller.py#40-70), `performance`, `training`, `reports`, `users`, `impact`, [recommendation](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/ml-service/api/controllers/recommendation_controller.py#13-22)).
2. **Standardize Gateway API Config**: Ensure the Frontend consistently uses `API_CONFIG.mlServiceURL` (`GATEWAY_URL/ml`) rather than raw port 8000 configurations to prevent CORS/bypass issues.
3. Validate Frontend -> Gateway -> Backend basic CRUD flow for all domains.

### Phase 2: ML Infrastructure De-confliction (The Port 8000 Problem)
1. **Re-port `hr_ai_layer`**: Change `hr_ai_layer` in [docker-compose.yml](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/docker-compose.yml) to expose port `8001` (or another free port like `8005`) instead of `8000`. Update [.env](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/.env) `HR_AI_LAYER_URL=http://hr-ai-layer:8001` in the backend. 
2. Keep `ml-service` on port `8000` as the main orchestrator for Recommendations and generic predictions.

### Phase 3: Unify the "Turnover/Attrition" Brain
1. **Analyze [ml.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/ml.controller.ts) & [turnover.controller.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/turnover.controller.ts)**: Identify exactly how the backend intends to orchestrate ML calls.
2. **Wire the BFF layer**: Ensure `employee-service` calls `hr_ai_layer:/predict` for explicit attrition risk scores, and `ml-service:/recommendations/` for mitigation strategies.
3. Remove or deprecate redundant endpoints in `ml-service` (`/predictions/turnover`) if `hr_ai_layer` is the definitive source of truth for Attrition, OR configure `ml-service` to act as an internal proxy to `hr_ai_layer`.

### Phase 4: Full End-to-End Verification
1. Spin up the entire stack using `docker-compose up -d`.
2. Generate synthetic `employee_id` in the database.
3. Trigger a turnover prediction from the Frontend UI.
4. Verify the call hits Gateway -> Backend -> `hr_ai_layer`.
5. Verify `hr_ai_layer` writes to `ai_layer.sim_survival_horizon_dataset_v1` and returns the prediction constraint back up to the frontend UI successfully.
