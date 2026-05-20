# backend_internal_database_database_go

> 16 nodes · cohesion 0.14

## Key Concepts

- **config.go** (7 connections) — `backend/internal/config/config.go`
- **main()** (6 connections) — `backend/cmd/seed/main.go`
- **main.go** (2 connections) — `backend/cmd/seed/main.go`
- **database.go** (2 connections) — `backend/internal/database/database.go`
- **Load()** (2 connections) — `backend/internal/config/config.go`
- **MustConnect()** (2 connections) — `backend/internal/database/database.go`
- **MustConnectRedis()** (2 connections) — `backend/internal/database/database.go`
- **RunMigrate()** (2 connections) — `backend/internal/database/migrate.go`
- **ensureDatabaseExists()** (2 connections) — `backend/cmd/seed/main.go`
- **migrate.go** (1 connections) — `backend/internal/database/migrate.go`
- **AppConfig** (1 connections) — `backend/internal/config/config.go`
- **Config** (1 connections) — `backend/internal/config/config.go`
- **DatabaseConfig** (1 connections) — `backend/internal/config/config.go`
- **JWTConfig** (1 connections) — `backend/internal/config/config.go`
- **RedisConfig** (1 connections) — `backend/internal/config/config.go`
- **WeChatConfig** (1 connections) — `backend/internal/config/config.go`

## Relationships

- No strong cross-community connections detected

## Source Files

- `backend/cmd/seed/main.go`
- `backend/internal/config/config.go`
- `backend/internal/database/database.go`
- `backend/internal/database/migrate.go`

## Audit Trail

- EXTRACTED: 26 (76%)
- INFERRED: 8 (24%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*