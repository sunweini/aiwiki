---
type: community
cohesion: 0.10
members: 24
---

# backend_internal_database_database_go

**Cohesion:** 0.10 - loosely connected
**Members:** 24 nodes

## Members
- [[handler]] - code - docs/superpowers/plans/2026-05-15-phase1-foundation.md
- [[internalmodel]] - code - docs/superpowers/plans/2026-05-15-phase1-foundation.md
- [[middleware]] - code - docs/superpowers/plans/2026-05-15-phase1-foundation.md
- [[repository]] - code - docs/superpowers/plans/2026-05-15-phase1-foundation.md
- [[service]] - code - docs/superpowers/plans/2026-05-15-phase1-foundation.md
- [[AppConfig]] - code - backend/internal/config/config.go
- [[Config]] - code - backend/internal/config/config.go
- [[DatabaseConfig]] - code - backend/internal/config/config.go
- [[JWTConfig]] - code - backend/internal/config/config.go
- [[Load()]] - code - backend/internal/config/config.go
- [[MustConnect()]] - code - backend/internal/database/database.go
- [[MustConnectRedis()]] - code - backend/internal/database/database.go
- [[RedisConfig]] - code - backend/internal/config/config.go
- [[RunMigrate()]] - code - backend/internal/database/migrate.go
- [[WeChatConfig]] - code - backend/internal/config/config.go
- [[cmdseedmain.go]] - code - docs/superpowers/plans/2026-05-15-phase1-foundation.md
- [[config.go]] - code - docs/superpowers/plans/2026-05-15-phase1-foundation.md
- [[database.go]] - code - backend/internal/database/database.go
- [[database.go & migrate.go]] - code - docs/superpowers/plans/2026-05-15-phase1-foundation.md
- [[ensureDatabaseExists()]] - code - backend/cmd/seed/main.go
- [[main()]] - code - backend/cmd/seed/main.go
- [[main.go]] - code - docs/superpowers/plans/2026-05-15-phase1-foundation.md
- [[migrate.go]] - code - backend/internal/database/migrate.go
- [[router.go]] - code - docs/superpowers/plans/2026-05-15-phase1-foundation.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/backend_internal_database_database_go
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_service_activity_service_newactivityservice]]

## Top bridge nodes
- [[router.go]] - degree 4, connects to 1 community