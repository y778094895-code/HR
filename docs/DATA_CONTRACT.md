# Data Contract

This document defines the data exchange formats and interfaces between the Smart HR services.

## 1. Backend ↔ ML Service

### Turnover Risk Prediction
**Endpoint**: `POST /predict/turnover`
**Request**:
```json
{
  "employee_id": "uuid",
  "historical_data": {
    "attendance_rate": 0.95,
    "last_rating": 4.2,
    "years_at_company": 3.5,
    "salary_percentile": 0.75
  }
}
```
**Response**:
```json
{
  "risk_score": 0.15,
  "risk_level": "low",
  "factors": {
    "attendance": "stable",
    "performance": "high"
  }
}
```

## 2. ERPNext ↔ Backend

### Employee Sync
**Entity**: `Employee`
**Fields**:
- `erpnext_id`: External ID
- `full_name`: String
- `email`: String (Unique)
- `department`: String
- `designation`: String

## 3. Frontend ↔ Backend

### Authentication
**Token**: JWT (Bearer)
**Standard Response**:
```json
{
  "success": true,
  "data": {},
  "timestamp": "ISO8601"
}
```
**Error Response**:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```
