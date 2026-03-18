# Integration Contract: ERPNext ↔ Smart Performance System

**Direction**: ERPNext → Smart Performance System (read-only sync)
**Protocol**: ERPNext REST API v2 over HTTPS
**Auth**: API Key + Secret (Basic Auth base64 encoded as `key:secret`)
**Trigger**: Manual (Admin), Scheduled (cron), Webhook (on ERPNext Employee save)

---

## ERPNext Endpoints Used

| ERPNext Endpoint | Method | Purpose |
|-----------------|--------|---------|
| `/api/resource/Employee` | GET | Paginated employee list |
| `/api/resource/Employee/:name` | GET | Single employee detail |
| `/api/resource/Department` | GET | Department reference data |
| `/api/resource/Designation` | GET | Job title reference data |

**Pagination**: ERPNext uses `?limit_start=0&limit_page_length=100` parameters.
**Filters**: `?filters=[["status","=","Active"]]` to skip terminated employees.

---

## Field Mapping

Default mapping (configurable via `integration_configs.field_mapping` JSONB):

| ERPNext Field | Internal Field | Transform |
|--------------|----------------|-----------|
| `name` | `erpNextId` | none (ERPNext primary key) |
| `employee_name` | `nameEn` | none |
| `first_name` + `last_name` | `nameEn` | concatenate |
| `company_email` | `email` | none |
| `department` | `department.name` | lookup or create |
| `designation` | `jobTitle.name` | lookup or create |
| `reports_to` | `managerId` | resolve by `erpNextId` |
| `date_of_joining` | `hireDate` | date parse (YYYY-MM-DD) |
| `gender` | `gender` | map: `Male`→`male`, `Female`→`female` |
| `status` | `status` | map: `Active`→`active`, `Left`→`terminated`, `On Leave`→`on_leave` |
| `cell_number` | `phoneNumber` | optional |

---

## Sync Logic

```
1. Fetch page of employees from ERPNext (100 per page)
2. For each employee record:
   a. Apply field_mapping transformer
   b. Look up internal employee by erpNextId
   c. If not found → INSERT (status: created)
   d. If found and data changed → UPDATE (status: updated)
   e. If found and no change → skip (status: skipped)
   f. If validation fails → log error, continue (status: error)
3. Employees present in DB but absent from ERPNext active list:
   → Soft-delete: set deleted_at = now() (preserve review history)
4. On completion → update sync_jobs record + emit notification
```

---

## Retry & Error Handling

| Scenario | Behaviour |
|----------|-----------|
| ERPNext unreachable | Retry 3× with exponential backoff (5 s, 25 s, 125 s); then mark job `failed` |
| HTTP 401 from ERPNext | Mark job `failed` immediately; do not retry (invalid credentials) |
| HTTP 429 from ERPNext | Respect `Retry-After` header; pause and resume |
| Invalid field value | Log to `sync_jobs.errors[].row`; skip record; continue batch |
| Mapping config missing key | Use `null` for optional fields; error for required fields |

---

## Webhook (optional, v2)

ERPNext can POST to `POST /api/v1/integrations/webhook/erpnext` on Employee save.

**Payload shape**:
```json
{
  "doctype": "Employee",
  "name": "HR-EMP-00042",
  "data": { … ERPNext Employee fields … }
}
```

**Verification**: HMAC-SHA256 signature in `X-Frappe-Webhook-Signature` header.
NestJS verifies signature before processing; rejects with 401 if invalid.

---

## Security Constraints

- `api_key_enc` and `api_secret_enc` are AES-256-GCM encrypted at rest in `integration_configs`.
- Encryption key is read from `INTEGRATION_ENCRYPTION_KEY` env var; never stored in DB.
- Credentials are **never** returned in API responses (masked: `"api_key": "sk-****"`).
- Credentials are **never** written to application logs (`redactPaths: ['api_key', 'api_secret']` in logger config).
- HTTPS enforced for all ERPNext API calls (TLS certificate verified; `skip_tls` only available in local dev via env flag).

---

## CSV / Excel Import Contract

### Employees import schema

| Column Header (EN) | Column Header (AR) | Type | Required | Notes |
|-------------------|--------------------|------|----------|-------|
| `name_en` | `الاسم بالإنجليزية` | string | Yes | |
| `name_ar` | `الاسم بالعربية` | string | No | |
| `email` | `البريد الإلكتروني` | email | Yes | Unique |
| `department` | `القسم` | string | Yes | Lookup or create |
| `job_title` | `المسمى الوظيفي` | string | No | |
| `hire_date` | `تاريخ التعيين` | date YYYY-MM-DD | Yes | |
| `salary` | `الراتب` | decimal | No | |
| `manager_email` | `بريد المدير` | email | No | Resolved to managerId |
| `status` | `الحالة` | enum | No | `active`/`on_leave`/`terminated` |

**File constraints**: Max 10 MB; UTF-8 encoding required; BOM optional.
**Import is atomic**: all-or-nothing per upload; partial row failures reported but do not cancel valid rows (configurable: `strict_mode` flag aborts on first error).
