# Migration Fix - Docker Volume Mount
Current working directory: d:/مشروع/14-2-2026/2026-2-13/smart_performance_system

## Steps:
- [x] 1. Edit docker-compose.yml: Add `./postgres:/app/postgres:ro` volume to backend service
- [x] 2. Updated package.json: "migrate:versioned" now uses compiled "node dist/scripts/migrate.js" (no ts-node)
- [ ] 3. Rebuild/restart: `docker compose down & docker compose up -d --build postgres backend`
- [ ] 4. Test: `docker compose exec backend npm run migrate:versioned`
- [ ] 5. Verify DB tables & health
- [ ] 4. Verify: Check logs, test DB connectivity/health endpoint
- [ ] 5. Complete task

**Next step: 3/5**  
**CRITICAL: Rebuild required** Run: `docker compose down && docker compose up -d --build postgres backend`  
Then test: `docker compose exec backend npm run migrate:versioned` (should use node dist/scripts/migrate.js)

