# Database Migrations Runbook

This guide explains how to manage database migrations strictly and safely in the Smart Performance System.

## ⚠️ Critical Warning

**NEVER use `drizzle-kit push` (npm run migrate) in production.**
It attempts to synchronize the schema state directly, which can lead to data loss and unexpected downtime.

## ✅ Approved Workflow: Versioned Migrations

We use SQL file-based migrations to ensure deterministic and safe database changes.

### 1. Running Migrations (Apply Changes)

Use the dedicated versioned migration script:

```bash
# Standard Run
npm run migrate:versioned

# Dry Run (Verify paths/connection only)
CROSS_ENV MIGRATE_DRY_RUN=1 npm run migrate:versioned
# OR via PowerShell
$env:MIGRATE_DRY_RUN="1"; npm run migrate:versioned
```

### 2. Pre-flight Checks (Before Migrating)

Before applying a new value, especially one adding Foreign Keys:

1.  **Check for Orphaned Data**:
    If adding a FK to `users`, ensure all referencing columns actually point to valid users.
    ```sql
    -- Example check
    SELECT count(*) FROM interventions WHERE created_by NOT IN (SELECT id FROM users);
    ```
    *If count > 0, you MUST fix this data manually before migrating.*

2.  **Backup**:
    Always ensure a recent backup exists.

## Troubleshooting

-   **"Foreign key constraint violation"**:
    This means your data is inconsistent. The migration is adding a safety rule that your current data violates.
    *Action*: Fix the data (UPDATE/DELETE orphans) then retry.

-   **"Table already exists"**:
    The migration table tracking might be out of sync. Check `__drizzle_migrations` table.
