---
type: community
cohesion: 0.67
members: 3
---

# backend_internal_handler_rbac_go

**Cohesion:** 0.67 - moderately connected
**Members:** 3 nodes

## Members
- [[InitRBAC()]] - code - backend/internal/middleware/rbac.go
- [[NewRBACHandler()]] - code - backend/internal/handler/rbac.go
- [[rbac.go]] - code - backend/internal/handler/rbac.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/backend_internal_handler_rbac_go
SORT file.name ASC
```

## Connections to other communities
- 2 edges to [[_COMMUNITY_response_response_test_testunauthorized]]
- 1 edge to [[_COMMUNITY_service_rbacservice_updaterolepermissions]]
- 1 edge to [[_COMMUNITY_middleware_rbac_requirepermission]]

## Top bridge nodes
- [[rbac.go]] - degree 4, connects to 2 communities
- [[NewRBACHandler()]] - degree 2, connects to 1 community
- [[InitRBAC()]] - degree 2, connects to 1 community