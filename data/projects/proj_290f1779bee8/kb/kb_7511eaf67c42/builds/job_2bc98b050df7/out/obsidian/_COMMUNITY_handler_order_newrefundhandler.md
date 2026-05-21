---
type: community
cohesion: 0.15
members: 13
---

# handler_order_newrefundhandler

**Cohesion:** 0.15 - loosely connected
**Members:** 13 nodes

## Members
- [[Amount]] - code - backend/pkg/wechat/order.go
- [[JSAPIRequest]] - code - backend/pkg/wechat/order.go
- [[JSAPIResponse]] - code - backend/pkg/wechat/order.go
- [[NativeRequest]] - code - backend/pkg/wechat/order.go
- [[NativeResponse]] - code - backend/pkg/wechat/order.go
- [[NewOrderHandler()]] - code - backend/internal/handler/order.go
- [[NewRefundHandler()]] - code - backend/internal/handler/order.go
- [[OrderInfo]] - code - backend/pkg/douyin/order.go
- [[OrderProduct]] - code - backend/pkg/meituan/order.go
- [[OrderQueryRequest]] - code - backend/pkg/meituan/order.go
- [[OrderQueryResponse]] - code - backend/pkg/douyin/order.go
- [[Payer]] - code - backend/pkg/wechat/order.go
- [[order.go]] - code - backend/pkg/wechat/order.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/handler_order_newrefundhandler
SORT file.name ASC
```

## Connections to other communities
- 2 edges to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 2 edges to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 1 edge to [[_COMMUNITY_yfsc_platform_v2_meituan_assets_pc_data_js]]

## Top bridge nodes
- [[order.go]] - degree 15, connects to 2 communities
- [[NewOrderHandler()]] - degree 2, connects to 1 community
- [[NewRefundHandler()]] - degree 2, connects to 1 community