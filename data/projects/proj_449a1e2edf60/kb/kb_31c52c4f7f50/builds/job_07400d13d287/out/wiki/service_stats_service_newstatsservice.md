# service_stats_service_newstatsservice

> 11 nodes · cohesion 0.40

## Key Concepts

- **StatsRepo** (8 connections) — `backend/internal/repository/stats_repo.go`
- **StatsService** (8 connections) — `backend/internal/service/stats_service.go`
- **stats.ts** (8 connections) — `web-admin/src/api/stats.ts`
- **getFlowHeatmap()** (3 connections) — `web-admin/src/api/stats.ts`
- **getFlowOverview()** (3 connections) — `web-admin/src/api/stats.ts`
- **getFlowTrend()** (3 connections) — `web-admin/src/api/stats.ts`
- **getSalesByShop()** (3 connections) — `web-admin/src/api/stats.ts`
- **getSalesOverview()** (3 connections) — `web-admin/src/api/stats.ts`
- **getSalesTrend()** (3 connections) — `web-admin/src/api/stats.ts`
- **getUserGrowth()** (3 connections) — `web-admin/src/api/stats.ts`
- **NewStatsService()** (2 connections) — `backend/internal/service/stats_service.go`

## Relationships

- No strong cross-community connections detected

## Source Files

- `backend/internal/repository/stats_repo.go`
- `backend/internal/service/stats_service.go`
- `web-admin/src/api/stats.ts`

## Audit Trail

- EXTRACTED: 46 (98%)
- INFERRED: 1 (2%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*