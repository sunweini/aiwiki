---
type: community
cohesion: 0.67
members: 3
---

# backend_internal_model_user_go

**Cohesion:** 0.67 - moderately connected
**Members:** 3 nodes

## Members
- [[NewUserHandler()]] - code - backend/internal/handler/user.go
- [[User]] - code - backend/internal/model/user.go
- [[user.go]] - code - backend/internal/model/user.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/backend_internal_model_user_go
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 1 edge to [[_COMMUNITY_response_response_test_testunauthorized]]
- 1 edge to [[_COMMUNITY_backend_internal_model_payment_go]]

## Top bridge nodes
- [[user.go]] - degree 3, connects to 1 community
- [[NewUserHandler()]] - degree 2, connects to 1 community
- [[User]] - degree 2, connects to 1 community