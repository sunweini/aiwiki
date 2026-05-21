---
type: community
cohesion: 0.09
members: 58
---

# service_douyinservice_querycouponfromplatform

**Cohesion:** 0.09 - loosely connected
**Members:** 58 nodes

## Members
- [[.Dashboard()]] - code - backend/internal/handler/douyin.go
- [[.EnrichDashboard()]] - code - backend/internal/service/douyin_service.go
- [[.FlowHeatmap()]] - code - backend/internal/handler/stats.go
- [[.FlowTrend()]] - code - backend/internal/handler/stats.go
- [[.GetMPConfig()]] - code - backend/internal/handler/settings.go
- [[.GetVerifyByShop()]] - code - backend/internal/service/douyin_service.go
- [[.GetVerifyTrend()]] - code - backend/internal/service/douyin_service.go
- [[.ListLogs()]] - code - backend/internal/handler/settings.go
- [[.ListStoreMappings()]] - code - backend/internal/service/douyin_service.go
- [[.QueryCoupon()]] - code - backend/internal/handler/douyin.go
- [[.QueryCouponFromPlatform()]] - code - backend/internal/service/douyin_service.go
- [[.Review()]] - code - backend/internal/handler/order.go
- [[.RevokeVerify()]] - code - backend/internal/handler/douyin.go
- [[.SalesTrend()]] - code - backend/internal/handler/stats.go
- [[.UpsertStoreMapping()]] - code - backend/internal/service/douyin_service.go
- [[.VerifyCoupon()]] - code - backend/internal/handler/douyin.go
- [[.VerifyCouponOnPlatform()]] - code - backend/internal/service/douyin_service.go
- [[DouyinHandler]] - code - backend/internal/handler/douyin.go
- [[DouyinService]] - code - backend/internal/service/douyin_service.go
- [[FlowOverview]] - code - backend/internal/repository/stats_repo.go
- [[FlowTrendPoint]] - code - backend/internal/repository/stats_repo.go
- [[HeatmapPoint]] - code - backend/internal/repository/stats_repo.go
- [[MeituanHandler]] - code - backend/internal/handler/meituan.go
- [[MeituanService]] - code - backend/internal/service/meituan_service.go
- [[NewMeituanService()]] - code - backend/internal/service/meituan_service.go
- [[NewSettingsService()]] - code - backend/internal/service/settings_service.go
- [[NewStatsRepo()]] - code - backend/internal/repository/stats_repo.go
- [[OK()]] - code - backend/pkg/response/response.go
- [[PtrTime()]] - code - backend/internal/service/platform_client.go
- [[RefundHandler]] - code - backend/internal/handler/order.go
- [[SalesByShop]] - code - backend/internal/repository/stats_repo.go
- [[SalesOverview]] - code - backend/internal/repository/stats_repo.go
- [[SalesTrendPoint]] - code - backend/internal/repository/stats_repo.go
- [[ServerError()]] - code - backend/pkg/response/response.go
- [[SettingsHandler]] - code - backend/internal/handler/settings.go
- [[SettingsService]] - code - backend/internal/service/settings_service.go
- [[StatsHandler]] - code - backend/internal/handler/stats.go
- [[UserGrowthStats]] - code - backend/internal/repository/stats_repo.go
- [[VerifyTrendPoint]] - code - backend/internal/service/meituan_service.go
- [[douyin.ts]] - code - web-admin/src/api/douyin.ts
- [[getConfig()]] - code - web-admin/src/api/douyin.ts
- [[getDashboard()]] - code - web-admin/src/api/douyin.ts
- [[goFinance()]] - code - mini-merchant/pages/dashboard/dashboard.js
- [[goOrders()]] - code - mini-merchant/pages/dashboard/dashboard.js
- [[goVerify()]] - code - mini-merchant/pages/dashboard/dashboard.js
- [[instance]] - code - web-admin/src/api/request.ts
- [[listRecords()]] - code - web-admin/src/api/douyin.ts
- [[listSettlements()]] - code - web-admin/src/api/douyin.ts
- [[listStores()]] - code - web-admin/src/api/douyin.ts
- [[meituan.ts]] - code - web-admin/src/api/meituan.ts
- [[parseDateRange()]] - code - backend/internal/handler/stats.go
- [[request.ts]] - code - web-admin/src/api/request.ts
- [[reviewRefund()]] - code - web-admin/src/api/orders.ts
- [[stats.go]] - code - backend/internal/handler/stats.go
- [[stats_repo.go]] - code - backend/internal/repository/stats_repo.go
- [[triggerSettlement()]] - code - web-admin/src/api/douyin.ts
- [[updateConfig()]] - code - web-admin/src/api/douyin.ts
- [[upsertStore()]] - code - web-admin/src/api/douyin.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/service_douyinservice_querycouponfromplatform
SORT file.name ASC
```

## Connections to other communities
- 31 edges to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 10 edges to [[_COMMUNITY_service_rbacservice_updaterolepermissions]]
- 8 edges to [[_COMMUNITY_repository_financerepo_createreconciliation]]
- 7 edges to [[_COMMUNITY_response_response_test_testunauthorized]]
- 4 edges to [[_COMMUNITY_payment_provider_test_testnewverificationproviderunsupported]]
- 4 edges to [[_COMMUNITY_middleware_rbac_requirepermission]]
- 3 edges to [[_COMMUNITY_service_auth_service_test_testauthservice_login_wrongpassword]]
- 2 edges to [[_COMMUNITY_mini_merchant_pages_withdraw_account_withdraw_account_js]]
- 2 edges to [[_COMMUNITY_mini_admin_pages_index_index_js]]
- 2 edges to [[_COMMUNITY_service_stats_service_newstatsservice]]
- 2 edges to [[_COMMUNITY_web_admin_src_api_orders_ts]]
- 1 edge to [[_COMMUNITY_backend_internal_handler_callback_go]]
- 1 edge to [[_COMMUNITY_handler_order_newrefundhandler]]
- 1 edge to [[_COMMUNITY_backend_internal_model_shop_type_go]]
- 1 edge to [[_COMMUNITY_mini_merchant_pages_finance_finance_js]]
- 1 edge to [[_COMMUNITY_backend_internal_model_meituan_go]]
- 1 edge to [[_COMMUNITY_backend_internal_handler_settings_go]]
- 1 edge to [[_COMMUNITY_service_platformclientfactory_createmeituanclient]]
- 1 edge to [[_COMMUNITY_web_admin_src_components_layout_viewswitch_vue]]
- 1 edge to [[_COMMUNITY_web_admin_src_api_parks_ts]]
- 1 edge to [[_COMMUNITY_api_users_getuserrecharges]]

## Top bridge nodes
- [[OK()]] - degree 44, connects to 8 communities
- [[request.ts]] - degree 11, connects to 8 communities
- [[ServerError()]] - degree 46, connects to 7 communities
- [[.Dashboard()]] - degree 11, connects to 3 communities
- [[DouyinHandler]] - degree 13, connects to 2 communities