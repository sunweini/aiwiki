---
type: community
cohesion: 0.40
members: 11
---

# service_stats_service_newstatsservice

**Cohesion:** 0.40 - moderately connected
**Members:** 11 nodes

## Members
- [[NewStatsService()]] - code - backend/internal/service/stats_service.go
- [[StatsRepo]] - code - backend/internal/repository/stats_repo.go
- [[StatsService]] - code - backend/internal/service/stats_service.go
- [[getFlowHeatmap()]] - code - web-admin/src/api/stats.ts
- [[getFlowOverview()]] - code - web-admin/src/api/stats.ts
- [[getFlowTrend()]] - code - web-admin/src/api/stats.ts
- [[getSalesByShop()]] - code - web-admin/src/api/stats.ts
- [[getSalesOverview()]] - code - web-admin/src/api/stats.ts
- [[getSalesTrend()]] - code - web-admin/src/api/stats.ts
- [[getUserGrowth()]] - code - web-admin/src/api/stats.ts
- [[stats.ts]] - code - web-admin/src/api/stats.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/service_stats_service_newstatsservice
SORT file.name ASC
```

## Connections to other communities
- 2 edges to [[_COMMUNITY_service_douyinservice_querycouponfromplatform]]
- 1 edge to [[_COMMUNITY_backend_internal_repository_order_repo_go]]

## Top bridge nodes
- [[StatsRepo]] - degree 8, connects to 1 community
- [[stats.ts]] - degree 8, connects to 1 community
- [[NewStatsService()]] - degree 2, connects to 1 community