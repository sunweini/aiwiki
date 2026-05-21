---
type: community
cohesion: 0.28
members: 9
---

# middleware_rbac_requirepermission

**Cohesion:** 0.28 - loosely connected
**Members:** 9 nodes

## Members
- [[.Error()]] - code - backend/pkg/meituan/coupon.go
- [[APIError]] - code - backend/pkg/meituan/coupon.go
- [[DouyinError]] - code - backend/pkg/douyin/coupon.go
- [[Forbidden()]] - code - backend/pkg/response/response.go
- [[NotFound()]] - code - backend/pkg/response/response.go
- [[PageData]] - code - backend/pkg/response/response.go
- [[RequirePermission()]] - code - backend/internal/middleware/rbac.go
- [[Response]] - code - backend/pkg/response/response.go
- [[response.go]] - code - backend/pkg/response/response.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/middleware_rbac_requirepermission
SORT file.name ASC
```

## Connections to other communities
- 4 edges to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 4 edges to [[_COMMUNITY_service_douyinservice_querycouponfromplatform]]
- 3 edges to [[_COMMUNITY_response_response_test_testunauthorized]]
- 2 edges to [[_COMMUNITY_backend_pkg_payment_provider_go]]
- 1 edge to [[_COMMUNITY_backend_internal_handler_rbac_go]]

## Top bridge nodes
- [[response.go]] - degree 9, connects to 3 communities
- [[NotFound()]] - degree 7, connects to 3 communities
- [[.Error()]] - degree 6, connects to 1 community
- [[Forbidden()]] - degree 4, connects to 1 community
- [[DouyinError]] - degree 2, connects to 1 community