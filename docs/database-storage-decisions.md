# Database & Storage Decision Record (ADR)

This document formalizes the data storage strategy for the Smart Performance System, ensuring alignment with performance, security, and scalability requirements.

## 1. PostgreSQL: The System of Record

**What goes here:**
-   **Core Entities:** Users, Employees, Departments, Designations.
-   **Business Transactions:** Attendance logs, Performance Assessments, Risk Cases, Sync Runs.
-   **Metadata:** Pointers to files (`object_key`), pointers to secrets (`vault_secret_path`), configuration rules.
-   **Relationships:** Foreign keys ensuring referential integrity across modules.

**Why:**
-   **ACID Compliance:** Critical for HR data accuracy (e.g., salary-impacting attendance).
-   **Relational Integrity:** Ensures data consistency (e.g., an assessment must belong to a valid employee).
-   **Rich Querying:** Complex joins and filtering required for reporting and analytics.
-   **Persistence:** Primary durable storage that survives restarts and crashes.

---

## 2. Redis: High-Speed Volatile Data

**What goes here:**
-   **Session Store:** Active user session tokens (JWT whitelists/blacklists).
-   **Rate Limiting:** Counters for API throttling (e.g., `rate_limit:ip:192.168.1.1`).
-   **Job Queues:** BullMQ job metadata (e.g., background email sending, report generation tasks).
-   **Cache:** Frequently accessed, rarely changed data (e.g., system configuration, public form templates).

**Why:**
-   **Performance:** Sub-millisecond latency for critical path operations (authentication, throttling).
-   **Ephemeral Nature:** Data loss here is acceptable (sessions can be re-established, caches re-warmed).
-   **Structure:** Key-value and simple data structures match the access patterns perfecty.

---

## 3. Object Storage (S3 / MinIO): Unstructured Blobs

**What goes here:**
-   **Generated Reports:** PDF, Excel exports representing point-in-time snapshots.
-   **User Uploads:** Profile pictures, evidence attachments for forms, training materials.
-   **Backups:** Database dumps and system logs.

**Implementation Details:**
-   **Database Link:** Tables like `report_outputs` and `form_attachments` store only the `object_key` (path), `mime_type`, and `size`.
-   **Access:** Pre-signed URLs are generated on-the-fly; files are never streamed through the API server if possible to save bandwidth.

**Why:**
-   **Cost:** Much cheaper per GB than block storage (EBS) or database storage.
-   **Scalability:** Can store petabytes of data without degrading database performance.
-   **Database Health:** Keeping blobs out of Postgres prevents "bloat" and keeps backups/restores fast.

---

## 4. HashiCorp Vault: Secrets Management

**What goes here:**
-   **External API Keys:** Tokens for SAP, Salesforce, LinkedIn Learning.
-   **Encryption Keys:** Master keys for column-level encryption (if implemented).
-   **Database Credentials:** Dynamic credentials for services.

**Implementation Details:**
-   **Database Link:** Tables like `integration_connections` store a `vault_secret_path` (e.g., `secret/data/integrations/sap/production`).
-   **Runtime:** The application fetches the actual secret from Vault at runtime using its own identity, caching it briefly in memory.

**Why:**
-   **Security:** Secrets are encrypted at rest and in transit.
-   **Rotation:** Secrets can be rotated centrally without redeploying the application or updating the database.
-   **Audit:** Access to secrets is strictly logged within Vault.
-   **Compliance:** Prevents sensitive credentials from leaking into database dumps or logs.

---

## 5. Strategic Alignment

| Requirement | Solution Strategy |
| :--- | :--- |
| **Performance** | **Redis** handles high-frequency reads/writes. **Object Storage** offloads heavy file serving. **Postgres** is tuned for query execution, not file storage. |
| **Availability** | **Postgres** uses replication for failover. **Redis** runs in cluster mode. **Object Storage** is inherently distributed. |
| **Security** | **Vault** isolates credentials. **Postgres** enforces RLS (Row Level Security) candidates. **Redis** is isolated in private subnets. |
| **Privacy** | PII is centralized in **Postgres** where access controls are strict. File-based PII in **Object Storage** is protected by short-lived access tokens. |
