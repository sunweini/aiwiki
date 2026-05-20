---
type: community
cohesion: 0.67
members: 3
---

# backend_internal_model_shop_go

**Cohesion:** 0.67 - moderately connected
**Members:** 3 nodes

## Members
- [[NewShopHandler()]] - code - backend/internal/handler/shop.go
- [[Shop]] - code - backend/internal/model/shop.go
- [[shop.go]] - code - backend/internal/model/shop.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/backend_internal_model_shop_go
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 1 edge to [[_COMMUNITY_response_response_test_testunauthorized]]
- 1 edge to [[_COMMUNITY_backend_internal_model_payment_go]]

## Top bridge nodes
- [[shop.go]] - degree 3, connects to 1 community
- [[NewShopHandler()]] - degree 2, connects to 1 community
- [[Shop]] - degree 2, connects to 1 community