<!--
constitution-sync:
  version-delta: null → 1.0.0
  change-type: INITIAL
  modified-principles: all (new)
  added-sections: Core Principles, Architecture Standards, Governance
  removed-sections: none
  template-status: standalone (spec-kit templates pending init)
  deferred-todos: []
  rationale: Initial constitution established for Smart Performance System
  suggested-commit: "docs: add project constitution v1.0.0"
-->

# Smart Performance System Constitution

## Core Principles

### 1. Code Quality

Every line of code merged to `main` must meet a defined quality bar before review is requested.
All TypeScript (client/server) must compile without errors or `any` casts introduced by the author.
NestJS modules, services, and controllers must follow single-responsibility boundaries — one domain concept per file.
Drizzle schema changes require a corresponding migration file; direct DB mutations outside migrations are prohibited.
Dead code, unused imports, and commented-out blocks must be removed before merge.
ESLint and Prettier rules are non-negotiable; CI failures on lint block merge.

### 2. Testing Standards

Every new feature or bug-fix must ship with a test that would have caught the regression.
Unit tests cover pure functions and service logic in isolation (no network, no DB).
Integration tests in `tests/` hit a real PostgreSQL instance — no mocked DB drivers.
ML service endpoints (`/predict/turnover`, `/predict/survival`) require contract tests validating schema stability.
E2E (Playwright) coverage is required for all critical user paths: Login, Dashboard KPIs, Employee Detail, Risk Score display.
Test coverage for new server modules must not fall below 80 % branch coverage.
CI must run the full test suite on every PR; no merging with failing tests.

### 3. User Experience Consistency

All UI components must use the shared Tailwind design tokens defined in `client/tailwind.config.ts` — no inline hex values or arbitrary spacing.
Loading states, error boundaries, and empty-state illustrations must be present on every data-fetching page.
Risk scores and performance metrics displayed in the frontend must exactly match the values returned by the backend API — no client-side rounding or transformation without explicit product approval.
Forms must provide real-time validation feedback; submit buttons are disabled until the form is valid.
Navigation and page transitions must be responsive at 1280 px, 1024 px, and 768 px breakpoints.
Accessibility: interactive elements must have ARIA labels; color alone must not convey meaning (WCAG AA).

### 4. Performance Requirements

Backend API p95 response time must not exceed **300 ms** for list endpoints and **150 ms** for single-resource endpoints under nominal load (50 concurrent users).
ML service `/predict/turnover` must return within **500 ms** p95; longer predictions must be offloaded to the RabbitMQ queue and delivered asynchronously.
Frontend Lighthouse Performance score must remain ≥ 85 on the Dashboard route; bundle size regressions > 10 % require explicit justification.
Database queries touching `employees`, `performance_reviews`, or `salary_snapshots` must use indexed columns in `WHERE` clauses; full-table scans on tables > 10 k rows are prohibited without caching.
Redis cache TTL for ML predictions is **15 minutes**; cache invalidation must be triggered on any write to the underlying employee record.
Docker images must start and pass health checks within **30 seconds** in CI.

---

## Architecture Standards

- All inter-service communication goes through the Nginx gateway (port 80); direct service-to-service calls bypass auth and are forbidden in production.
- Shared types live in `shared/`; duplicating type definitions across `client/` and `server/` is not permitted.
- Environment-specific configuration uses `.env` files only — no hard-coded URLs, secrets, or ports in source code.
- Breaking changes to the REST API contract require a version bump in the route prefix (e.g., `/api/v2/...`) and a deprecation notice in `docs/`.

## Governance Rules

1. Amendments to this constitution require a PR with at least one maintainer approval and a version bump following semver.
2. Exceptions to any principle must be documented inline with a `// CONSTITUTION-EXCEPTION: <reason> | approved by: <name> | expires: <YYYY-MM-DD>` comment.
3. The constitution is reviewed at the start of each quarterly milestone and updated to reflect decisions made during that cycle.

---

**Version**: 1.0.0 | **Ratified**: 2026-03-18 | **Last Amended**: 2026-03-18
