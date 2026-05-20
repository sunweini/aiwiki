---
type: community
cohesion: 0.33
members: 6
---

# backend_internal_model_douyin_go

**Cohesion:** 0.33 - loosely connected
**Members:** 6 nodes

## Members
- [[DouyinApiConfig]] - code - backend/internal/model/douyin.go
- [[DouyinSettlement]] - code - backend/internal/model/douyin.go
- [[DouyinStoreMapping]] - code - backend/internal/model/douyin.go
- [[DouyinVerifyRecord]] - code - backend/internal/model/douyin.go
- [[NewDouyinHandler()]] - code - backend/internal/handler/douyin.go
- [[douyin.go]] - code - backend/internal/model/douyin.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/backend_internal_model_douyin_go
SORT file.name ASC
```

## Connections to other communities
- 4 edges to [[_COMMUNITY_backend_internal_model_shop_type_go]]
- 2 edges to [[_COMMUNITY_yfsc_platform_v2_meituan_assets_pc_data_js]]
- 1 edge to [[_COMMUNITY_service_douyinservice_querycouponfromplatform]]
- 1 edge to [[_COMMUNITY_backend_internal_repository_order_repo_go]]

## Top bridge nodes
- [[DouyinSettlement]] - degree 3, connects to 2 communities
- [[DouyinVerifyRecord]] - degree 3, connects to 2 communities
- [[douyin.go]] - degree 6, connects to 1 community
- [[NewDouyinHandler()]] - degree 2, connects to 1 community
- [[DouyinApiConfig]] - degree 2, connects to 1 community