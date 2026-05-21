---
type: community
cohesion: 0.33
members: 6
---

# response_response_test_testforbidden

**Cohesion:** 0.33 - loosely connected
**Members:** 6 nodes

## Members
- [[Forbidden()]] - code - backend/pkg/response/response.go
- [[InitRBAC()]] - code - backend/internal/middleware/rbac.go
- [[NewRBACHandler()]] - code - backend/internal/handler/rbac.go
- [[RequirePermission()]] - code - backend/internal/middleware/rbac.go
- [[TestForbidden()]] - code - backend/pkg/response/response_test.go
- [[rbac.go]] - code - backend/internal/handler/rbac.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/response_response_test_testforbidden
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 1 edge to [[_COMMUNITY_backend_internal_repository_rbac_repo_go]]
- 1 edge to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 1 edge to [[_COMMUNITY_backend_pkg_payment_provider_go]]
- 1 edge to [[_COMMUNITY_response_response_test_testunauthorized]]

## Top bridge nodes
- [[Forbidden()]] - degree 4, connects to 2 communities
- [[TestForbidden()]] - degree 3, connects to 2 communities
- [[rbac.go]] - degree 4, connects to 1 community
- [[NewRBACHandler()]] - degree 2, connects to 1 community
- [[InitRBAC()]] - degree 2, connects to 1 community