# Machine Learning API (ML API)

This document describes the external Machine Learning API contracts and how they are exposed through the Smart HR System's backend via the Backend-For-Frontend (BFF) pattern.

## Endpoints

### 1. Turnover Prediction (Single)
- **Endpoint:** `POST /api/ml/predictions/turnover`
- **Description:** Get a turnover risk score for a single employee.
- **Request Body:**
  ```json
  {
    "employee_id": "uuid",
    "features": {
       // Optional extended features (metadata, department, etc)
    }
  }
  ```
- **Response:**
  ```json
  {
      "success": true,
      "data": {
          "riskScore": 0.45,
          "factors": ["tenure", "compensation"]
      }
  }
  ```

### 2. Turnover Prediction (Batch)
- **Endpoint:** `POST /api/ml/predictions/batch`
- **Description:** Get turnover risk scores for multiple employees at once.
- **Request Body:**
  ```json
  {
    "employee_ids": ["uuid-1", "uuid-2"]
  }
  ```
- **Response:**
  ```json
  {
      "success": true,
      "data": {
          "uuid-1": { "riskScore": 0.2, "factors": ["performance"] },
          "uuid-2": { "riskScore": 0.8, "factors": ["commute", "compensation"] }
      }
  }
  ```

## Internal Client

The `MLServiceClient` (located at `server/data/external/ml.service.client.ts`) handles communication with the Python/FastAPI ML engine (typically running on `http://localhost:8000`). It is injected into the DI container as `IMLServiceClient` and utilized by the `MLController`.
