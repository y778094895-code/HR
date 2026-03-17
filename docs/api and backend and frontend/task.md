# Sprint P0-1B: Schema & Operational Surface Recovery

## Phase A: Data Quality Schema Recovery
- [x] Verify `violations` schema and apply DB schema changes if needed.
- [x] Remove mock from [dataquality.repository.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/data/repositories/dataquality.repository.ts) ([listIssues](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/data/repositories/dataquality.repository.ts#22-25), [updateIssueStatus](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/services/business/dataquality.service.ts#50-53)).
- [x] Remove mock from [dataquality.service.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/services/business/dataquality.service.ts).
- [x] Verify [listIssues](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/data/repositories/dataquality.repository.ts#22-25) and [acknowledgeIssue](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/services/business/dataquality.service.ts#20-30) endpoints.

## Phase B: Help Knowledge Base Recovery
- [x] Add `helpFaqs` to [help.schema.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/data/models/help.schema.ts).
- [x] Create [db-recovery.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/scripts/db-recovery.js) to create/alter tables (`help_categories`, `help_articles`, `help_faqs`).
- [x] Remove mock from [help.repository.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/data/repositories/help.repository.ts) ([getCategories](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/services/business/help.service.ts#14-17), [listArticles](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/services/business/help.service.ts#18-21), [searchArticles](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/console-help.controller.ts#42-47), [getFAQs](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/client/src/services/resources/help.service.ts#132-145), etc).
- [x] Remove mock from [help.service.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/services/business/help.service.ts).
- [x] Create [seed-help.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/scripts/seed-help.js) script to supply initial baseline operational content.

## Phase C: Support Tickets Recovery
- [x] Move `helpTickets` from [settings.schema.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/data/models/settings.schema.ts) to [help.schema.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/data/models/help.schema.ts).
- [x] Add `helpTicketMessages` to [help.schema.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/data/models/help.schema.ts).
- [x] Update [db-recovery.js](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/scripts/db-recovery.js) to create `help_tickets` and `help_ticket_messages` tables.
- [x] Create [SupportRepository](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/data/repositories/support.repository.ts#7-48) and decouple from [SettingsRepository](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/data/repositories/settings.repository.ts#7-42).
- [x] Remove mock from [SettingsRepository](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/data/repositories/settings.repository.ts#7-42) for tickets.
- [x] Remove mock from [help.service.ts](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/services/business/help.service.ts) for [listTickets](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/data/repositories/support.repository.ts#13-19).
- [x] Implement [listTickets](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/data/repositories/support.repository.ts#13-19), [createTicket](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/api/controllers/console-help.controller.ts#77-82), [getTicket](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/services/business/help.service.ts#61-64), [addMessage](file:///d:/%D9%85%D8%B4%D8%B1%D9%88%D8%B9/14-2-2026/2026-2-13/smart_performance_system/server/data/repositories/support.repository.ts#35-43).

## Phase D: Final Runtime Safety & Build
- [x] `npm run tsc` on `client/` and `server/`.
- [x] Node smoke test verification to prove no 500s due to schema gaps.
- [x] Update walkthrough + sprint verdict.

**FINAL VERDICT:** SPRINT P0-1B CLOSED (Mocks Removed, Full Data Pipeline Recovered)
