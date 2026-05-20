---
type: community
cohesion: 0.14
members: 16
---

# backend_internal_database_database_go

**Cohesion:** 0.14 - loosely connected
**Members:** 16 nodes

## Members
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
- [[config.go]] - code - backend/internal/config/config.go
- [[database.go]] - code - backend/internal/database/database.go
- [[ensureDatabaseExists()]] - code - backend/cmd/seed/main.go
- [[main()]] - code - backend/cmd/seed/main.go
- [[main.go]] - code - backend/cmd/seed/main.go
- [[migrate.go]] - code - backend/internal/database/migrate.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/backend_internal_database_database_go
SORT file.name ASC
```
