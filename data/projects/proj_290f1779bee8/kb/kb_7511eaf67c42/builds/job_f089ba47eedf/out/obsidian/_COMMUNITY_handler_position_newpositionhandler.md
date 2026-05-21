---
type: community
cohesion: 1.00
members: 2
---

# handler_position_newpositionhandler

**Cohesion:** 1.00 - tightly connected
**Members:** 2 nodes

## Members
- [[NewPositionHandler()]] - code - backend/internal/handler/position.go
- [[Position]] - code - backend/internal/model/position.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/handler_position_newpositionhandler
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 1 edge to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 1 edge to [[_COMMUNITY_backend_internal_model_shop_type_go]]

## Top bridge nodes
- [[Position]] - degree 3, connects to 2 communities
- [[NewPositionHandler()]] - degree 2, connects to 1 community