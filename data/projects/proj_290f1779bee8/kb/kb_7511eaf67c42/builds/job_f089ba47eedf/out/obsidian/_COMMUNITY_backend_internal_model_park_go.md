---
type: community
cohesion: 0.67
members: 3
---

# backend_internal_model_park_go

**Cohesion:** 0.67 - moderately connected
**Members:** 3 nodes

## Members
- [[NewParkHandler()]] - code - backend/internal/handler/park.go
- [[Park]] - code - backend/internal/model/park.go
- [[park.go]] - code - backend/internal/model/park.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/backend_internal_model_park_go
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 1 edge to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 1 edge to [[_COMMUNITY_backend_internal_model_shop_type_go]]

## Top bridge nodes
- [[park.go]] - degree 3, connects to 1 community
- [[NewParkHandler()]] - degree 2, connects to 1 community
- [[Park]] - degree 2, connects to 1 community