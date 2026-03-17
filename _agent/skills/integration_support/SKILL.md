---
name: integration_support
description: Support for synchronizing and troubleshooting data integration with external systems like ERPNext.
---

# Integration Support Skill

This skill assists in maintaining the data flow between the `smart_performance_system` and external ERP systems.

## Key Responsibilities

### 1. ERPNext Sync
- **Mapping**: Ensuring `Employee` records in ERPNext map correctly to internal models.
- **Troubleshooting**: Identifying failures in the `integration-service`.
- **Validation**: Verifying that field-level data (e.g., Joining Date, Department) matches after synchronization.

### 2. Service Monitoring
- Monitor the `bridge/` service (if applicable) for connectivity issues.
- Validate API contract compliance for integration endpoints.

## Tools & Commands
- **Check Integration Status**: Inspect `/api/settings/integration` status.
- **Log Inspection**: Filter `gateway.log` for "IntegrationService" or "ERPNext" tags.
