# Process Analysis for Smart HR Performance Management System

This document outlines missing, duplicative, or conflicting backend processes discovered during the removal of mock data across the application interfaces.

## 1. Missing Processes and Endpoints
- **Training Effectiveness:** There is currently no database schema field linking `trainingEnrollments` directly to post-training performance improvement metrics (e.g., `avg_score_improvement`, `roi_score`, `feedback_rating`). These metrics are essential for calculating true ROI on training.
- **Fairness Matrix Granularity:** Generating a multi-dimensional intersectionality matrix across historical quarters requires archiving point-in-time states. To build the `Matrix` widget dynamically, snapshots or historical run data are required.
- **Top Performer per Department:** To reliably resolve the top performer by department over a given cycle, a window function or a dedicated view/aggregation table is heavily recommended over executing complex `GROUP BY` logic directly in real-time.

## 2. Duplicate or Conflicting Processes
- **Profile Aggregation:** Both `ProfileDataAdapter` on the frontend and endpoints in `EmployeeController` are attempting to aggregate risk + performance + cases. A true Backend-for-Frontend (BFF) approach was designed (`ConsoleBFFController`), but frontend stores try to recreate this aggregation.
- **Recommendations Generation:** `TurnoverService` fallback mock logic generated recommendations internally, while `RecommendationsService` handles ML-based prescriptive interventions. Migrating to relying entirely on the `recommendations` and `interventions` tables consolidates this logic successfully.

## 3. Recommended Actions
1. **Extend `training_enrollments` Table:** Add metric columns for `post_assessment_score` and `feedback_rating`.
2. **Optimize Dashboard Aggregation:** Introduce a materialized view for real-time `DashboardKPI` aggregations, rather than scanning `interventions`, `turnoverRisk`, and `performance` tables synchronously.
3. **Move Frontend Adapters to Real API Hooks:** Since backend endpoints now fulfill true Drizzle ORM queries, frontend components (such as `DashboardDataAdapter`) should completely swap static assignments to asynchronous `fetch` wrappers.
