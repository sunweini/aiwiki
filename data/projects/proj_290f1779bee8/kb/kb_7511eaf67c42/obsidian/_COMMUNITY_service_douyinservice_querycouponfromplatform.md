---
type: community
cohesion: 0.11
members: 39
---

# service_douyinservice_querycouponfromplatform

**Cohesion:** 0.11 - loosely connected
**Members:** 39 nodes

## Members
- [[.EnrichDashboard()]] - code - backend/internal/service/douyin_service.go
- [[.GetMPConfig()]] - code - backend/internal/handler/settings.go
- [[.GetVerifyByShop()]] - code - backend/internal/service/douyin_service.go
- [[.GetVerifyTrend()]] - code - backend/internal/service/douyin_service.go
- [[.ListStoreMappings()]] - code - backend/internal/service/douyin_service.go
- [[.QueryCoupon()]] - code - backend/internal/handler/douyin.go
- [[.QueryCouponFromPlatform()]] - code - backend/internal/service/douyin_service.go
- [[.RevokeVerify()]] - code - backend/internal/handler/douyin.go
- [[.UpsertStoreMapping()]] - code - backend/internal/service/douyin_service.go
- [[.VerifyCouponOnPlatform()]] - code - backend/internal/service/douyin_service.go
- [[DouyinHandler]] - code - backend/internal/handler/douyin.go
- [[DouyinService]] - code - backend/internal/service/douyin_service.go
- [[MeituanHandler]] - code - backend/internal/handler/meituan.go
- [[MeituanService]] - code - backend/internal/service/meituan_service.go
- [[NewSettingsHandler()]] - code - backend/internal/handler/settings.go
- [[NewSettingsService()]] - code - backend/internal/service/settings_service.go
- [[SettingsHandler]] - code - backend/internal/handler/settings.go
- [[SettingsService]] - code - backend/internal/service/settings_service.go
- [[VerifyTrendPoint]] - code - backend/internal/service/meituan_service.go
- [[createPark()]] - code - web-admin/src/api/parks.ts
- [[deletePark()]] - code - web-admin/src/api/parks.ts
- [[douyin.ts]] - code - web-admin/src/api/douyin.ts
- [[getConfig()]] - code - web-admin/src/api/douyin.ts
- [[getDashboard()]] - code - web-admin/src/api/douyin.ts
- [[getPark()]] - code - web-admin/src/api/parks.ts
- [[instance]] - code - web-admin/src/api/request.ts
- [[listParks()]] - code - web-admin/src/api/parks.ts
- [[listRecords()]] - code - web-admin/src/api/douyin.ts
- [[listSettlements()]] - code - web-admin/src/api/douyin.ts
- [[listStores()]] - code - web-admin/src/api/douyin.ts
- [[meituan.ts]] - code - web-admin/src/api/meituan.ts
- [[parks.ts]] - code - web-admin/src/api/parks.ts
- [[request.ts]] - code - web-admin/src/api/request.ts
- [[settings.go]] - code - backend/internal/handler/settings.go
- [[togglePark()]] - code - web-admin/src/api/parks.ts
- [[triggerSettlement()]] - code - web-admin/src/api/douyin.ts
- [[updateConfig()]] - code - web-admin/src/api/douyin.ts
- [[updatePark()]] - code - web-admin/src/api/parks.ts
- [[upsertStore()]] - code - web-admin/src/api/douyin.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/service_douyinservice_querycouponfromplatform
SORT file.name ASC
```

## Connections to other communities
- 22 edges to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 4 edges to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 3 edges to [[_COMMUNITY_mini_merchant_pages_withdraw_account_withdraw_account_js]]
- 2 edges to [[_COMMUNITY_douyin_client_verifythirdpartycoupon]]
- 2 edges to [[_COMMUNITY_web_admin_src_views_douyin_settlement_vue]]
- 1 edge to [[_COMMUNITY_backend_internal_model_shop_type_go]]
- 1 edge to [[_COMMUNITY_backend_internal_model_meituan_go]]
- 1 edge to [[_COMMUNITY_service_platformclientfactory_createmeituanclient]]
- 1 edge to [[_COMMUNITY_web_admin_src_components_layout_viewswitch_vue]]
- 1 edge to [[_COMMUNITY_service_stats_service_newstatsservice]]
- 1 edge to [[_COMMUNITY_repository_financerepo_createreconciliation]]
- 1 edge to [[_COMMUNITY_service_rbacservice_updaterolepermissions]]

## Top bridge nodes
- [[request.ts]] - degree 11, connects to 6 communities
- [[DouyinHandler]] - degree 13, connects to 4 communities
- [[MeituanHandler]] - degree 12, connects to 3 communities
- [[MeituanService]] - degree 16, connects to 1 community
- [[DouyinService]] - degree 15, connects to 1 community