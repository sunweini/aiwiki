---
type: community
cohesion: 0.31
members: 9
---

# service_platformclientfactory_createmeituanclient

**Cohesion:** 0.31 - loosely connected
**Members:** 9 nodes

## Members
- [[.CreateDouyinClient()]] - code - backend/internal/service/platform_client.go
- [[.CreateMeituanClient()]] - code - backend/internal/service/platform_client.go
- [[.GetStoreToken()]] - code - backend/internal/service/platform_client.go
- [[.RefreshDouyinToken()]] - code - backend/internal/service/platform_client.go
- [[.RefreshMeituanToken()]] - code - backend/internal/service/platform_client.go
- [[NewPlatformClientFactory()]] - code - backend/internal/service/platform_client.go
- [[PlatformClientFactory]] - code - backend/internal/service/platform_client.go
- [[parseInt64()]] - code - backend/internal/service/platform_client.go
- [[platform_client.go]] - code - backend/internal/service/platform_client.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/service_platformclientfactory_createmeituanclient
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_service_douyinservice_querycouponfromplatform]]
- 1 edge to [[_COMMUNITY_response_response_test_testunauthorized]]

## Top bridge nodes
- [[platform_client.go]] - degree 4, connects to 1 community
- [[NewPlatformClientFactory()]] - degree 2, connects to 1 community