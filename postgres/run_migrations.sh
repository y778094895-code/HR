#!/bin/sh
set -eu

# ---------------------------------------------------------------------------
# Smart HR — database migration runner (POSIX sh, works on Alpine/busybox)
# ---------------------------------------------------------------------------
# Environment variables (with defaults):
#   DB_HOST       postgres host            (default: localhost)
#   DB_PORT       postgres port            (default: 5432)
#   DB_USER       postgres user            (default: hr)
#   DB_PASSWORD   postgres password        (default: hr_password)
#   DB_NAME       postgres database name   (default: hr_system)
# ---------------------------------------------------------------------------

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-hr}"
DB_PASSWORD="${DB_PASSWORD:-hr_password}"
DB_NAME="${DB_NAME:-hr_system}"

export PGPASSWORD="$DB_PASSWORD"

# When run inside the container the postgres/ folder is mounted at /postgres,
# so this script lives at /postgres/run_migrations.sh
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PG_DIR="$SCRIPT_DIR"
MIG_DIR="$PG_DIR/migrations"

run_sql() {
    file="$1"
    echo ""
    echo "==> Running: $file"
    psql -v ON_ERROR_STOP=1 \
         -h "$DB_HOST" \
         -p "$DB_PORT" \
         -U "$DB_USER" \
         -d "$DB_NAME" \
         -f "$file"
    echo "    [OK]"
}

echo "========================================================"
echo " Smart HR — Database Migration Runner"
echo " Host:     $DB_HOST:$DB_PORT  DB: $DB_NAME  User: $DB_USER"
echo "========================================================"

# 1. Init
run_sql "$PG_DIR/init.sql"

# 2. Migrations — canonical order
#    Skipped non-canonical variants:
#      0002_auth_core.sql, 0002_auth_core_remediation.sql
#      0003_hr_master_tables.sql
run_sql "$MIG_DIR/0000_closed_richard_fisk.sql"
run_sql "$MIG_DIR/0001_dusty_shinko_yamashiro.sql"
run_sql "$MIG_DIR/0002_classy_sharon_ventura.sql"
run_sql "$MIG_DIR/0003_burly_whizzer.sql"
run_sql "$MIG_DIR/0004_employees_local_add_fk_nullable.sql"
run_sql "$MIG_DIR/0005_hr_backfill_from_text.sql"
run_sql "$MIG_DIR/0006_attendance.sql"
run_sql "$MIG_DIR/0007_performance_cycles_assessments.sql"
run_sql "$MIG_DIR/0008_skills_training.sql"
run_sql "$MIG_DIR/0009_risk_cases_resignations_turnover.sql"
run_sql "$MIG_DIR/0010_interventions_add_risk_case_nullable.sql"
run_sql "$MIG_DIR/0011_fairness_runs_xai.sql"
run_sql "$MIG_DIR/0012_alerts_reports_outputs.sql"
run_sql "$MIG_DIR/0013_governance_policies_violations.sql"
run_sql "$MIG_DIR/0014_forms_engine.sql"
run_sql "$MIG_DIR/0015_integrations_sync_webhooks.sql"
run_sql "$MIG_DIR/0016_ui_dashboards.sql"
run_sql "$MIG_DIR/0017_ui_dashboards_v2.sql"
run_sql "$MIG_DIR/0018_ai_layer_views.sql"
run_sql "$MIG_DIR/0019_alerts_center_details.sql"
run_sql "$MIG_DIR/0020_phase_f_help_mfa.sql"
run_sql "$MIG_DIR/0021_salary_snapshots_notifications.sql"
run_sql "$MIG_DIR/0022_goals_kpis_objectives.sql"
run_sql "$MIG_DIR/0023_review_templates_participants.sql"
run_sql "$MIG_DIR/0024_training_suggestions.sql"
run_sql "$MIG_DIR/0025_notifications_extended.sql"
run_sql "$MIG_DIR/0027_show_risk_to_employee.sql"
# 3. Seed data
run_sql "$PG_DIR/seed_data.sql"
run_sql "$PG_DIR/seed_data_part2.sql"

echo ""
echo "========================================================"
echo " All migrations and seeds applied successfully."
echo "========================================================"
