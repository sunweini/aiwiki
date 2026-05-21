---
type: community
cohesion: 0.27
members: 14
---

# service_stats_service_newstatsservice

**Cohesion:** 0.27 - loosely connected
**Members:** 14 nodes

## Members
- [[ActivityList.vue]] - code - docs/INTEGRATION.md
- [[Databoardindex.vue]] - code - docs/INTEGRATION.md
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
- [[mini-admin]] - code - docs/INTEGRATION.md
- [[stats.ts]] - code - docs/INTEGRATION.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/service_stats_service_newstatsservice
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 1 edge to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 1 edge to [[_COMMUNITY_web_admin_src_components_layout_viewswitch_vue]]
- 1 edge to [[_COMMUNITY_mini_admin_pages_index_index_js]]

## Top bridge nodes
- [[stats.ts]] - degree 11, connects to 1 community
- [[StatsRepo]] - degree 8, connects to 1 community
- [[mini-admin]] - degree 2, connects to 1 community
- [[NewStatsService()]] - degree 2, connects to 1 community