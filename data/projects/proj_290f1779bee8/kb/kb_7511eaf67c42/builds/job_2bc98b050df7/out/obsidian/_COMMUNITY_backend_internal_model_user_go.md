---
type: community
cohesion: 1.00
members: 2
---

# backend_internal_model_user_go

**Cohesion:** 1.00 - tightly connected
**Members:** 2 nodes

## Members
- [[NewUserHandler()]] - code - backend/internal/handler/user.go
- [[user.go]] - code - backend/internal/model/user.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/backend_internal_model_user_go
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 1 edge to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 1 edge to [[_COMMUNITY_yfsc_platform_v2_meituan_assets_pc_data_js]]

## Top bridge nodes
- [[user.go]] - degree 3, connects to 2 communities
- [[NewUserHandler()]] - degree 2, connects to 1 community