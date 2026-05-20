---
type: community
cohesion: 0.25
members: 8
---

# service_callback_service_newcallbackservice

**Cohesion:** 0.25 - loosely connected
**Members:** 8 nodes

## Members
- [[.HandleAlipayPay()]] - code - backend/internal/service/callback_service.go
- [[.HandleDouyinSPI()]] - code - backend/internal/service/callback_service.go
- [[.HandleWechatPay()]] - code - backend/internal/service/callback_service.go
- [[AlipayNotifyEvent]] - code - backend/internal/service/callback_service.go
- [[CallbackService]] - code - backend/internal/service/callback_service.go
- [[DouyinSPIEvent]] - code - backend/internal/service/callback_service.go
- [[NewCallbackService()]] - code - backend/internal/service/callback_service.go
- [[WechatPayEvent]] - code - backend/internal/service/callback_service.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/service_callback_service_newcallbackservice
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_backend_internal_repository_order_repo_go]]

## Top bridge nodes
- [[NewCallbackService()]] - degree 2, connects to 1 community