---
type: community
cohesion: 0.33
members: 6
---

# backend_internal_model_meituan_go

**Cohesion:** 0.33 - loosely connected
**Members:** 6 nodes

## Members
- [[MeituanApiConfig]] - code - backend/internal/model/meituan.go
- [[MeituanSettlement]] - code - backend/internal/model/meituan.go
- [[MeituanStoreMapping]] - code - backend/internal/model/meituan.go
- [[MeituanVerifyRecord]] - code - backend/internal/model/meituan.go
- [[NewMeituanHandler()]] - code - backend/internal/handler/meituan.go
- [[meituan.go]] - code - backend/internal/model/meituan.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/backend_internal_model_meituan_go
SORT file.name ASC
```

## Connections to other communities
- 4 edges to [[_COMMUNITY_backend_internal_model_shop_type_go]]
- 2 edges to [[_COMMUNITY_yfsc_platform_v2_meituan_assets_pc_data_js]]
- 1 edge to [[_COMMUNITY_service_douyinservice_querycouponfromplatform]]
- 1 edge to [[_COMMUNITY_backend_internal_repository_order_repo_go]]

## Top bridge nodes
- [[MeituanSettlement]] - degree 3, connects to 2 communities
- [[MeituanVerifyRecord]] - degree 3, connects to 2 communities
- [[meituan.go]] - degree 6, connects to 1 community
- [[NewMeituanHandler()]] - degree 2, connects to 1 community
- [[MeituanApiConfig]] - degree 2, connects to 1 community