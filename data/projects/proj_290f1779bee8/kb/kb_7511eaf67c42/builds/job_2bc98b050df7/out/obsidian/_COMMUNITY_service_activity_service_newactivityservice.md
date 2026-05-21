---
type: community
cohesion: 0.10
members: 21
---

# service_activity_service_newactivityservice

**Cohesion:** 0.10 - loosely connected
**Members:** 21 nodes

## Members
- [[NewActivityService()]] - code - backend/internal/service/activity_service.go
- [[NewDouyinHandler()]] - code - backend/internal/handler/douyin.go
- [[NewDouyinService()]] - code - backend/internal/service/douyin_service.go
- [[NewEmployeeRepo()]] - code - backend/internal/repository/employee_repo.go
- [[NewEmployeeService()]] - code - backend/internal/service/employee_service.go
- [[NewFinanceHandler()]] - code - backend/internal/handler/finance.go
- [[NewFinanceService()]] - code - backend/internal/service/finance_service.go
- [[NewMeituanHandler()]] - code - backend/internal/handler/meituan.go
- [[NewMeituanService()]] - code - backend/internal/service/meituan_service.go
- [[NewOrderService()]] - code - backend/internal/service/order_service.go
- [[NewParkRepo()]] - code - backend/internal/repository/park_repo.go
- [[NewParkService()]] - code - backend/internal/service/park_service.go
- [[NewPositionService()]] - code - backend/internal/service/position_service.go
- [[NewRefundRepo()]] - code - backend/internal/repository/refund_repo.go
- [[NewSettingsHandler()]] - code - backend/internal/handler/settings.go
- [[NewSettingsService()]] - code - backend/internal/service/settings_service.go
- [[NewShopRepo()]] - code - backend/internal/repository/shop_repo.go
- [[NewShopService()]] - code - backend/internal/service/shop_service.go
- [[NewUserService()]] - code - backend/internal/service/user_service.go
- [[Setup()]] - code - backend/internal/router/router.go
- [[settings.go]] - code - backend/internal/handler/settings.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/service_activity_service_newactivityservice
SORT file.name ASC
```

## Connections to other communities
- 18 edges to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 8 edges to [[_COMMUNITY_response_response_test_testunauthorized]]
- 7 edges to [[_COMMUNITY_yfsc_platform_v2_meituan_assets_pc_data_js]]
- 4 edges to [[_COMMUNITY_service_auth_service_test_testauthservice_login_wrongpassword]]
- 3 edges to [[_COMMUNITY_response_response_test_testforbidden]]
- 2 edges to [[_COMMUNITY_handler_order_newrefundhandler]]
- 2 edges to [[_COMMUNITY_backend_internal_repository_rbac_repo_go]]
- 2 edges to [[_COMMUNITY_web_admin_src_components_layout_viewswitch_vue]]
- 1 edge to [[_COMMUNITY_backend_internal_model_user_go]]
- 1 edge to [[_COMMUNITY_backend_internal_handler_callback_go]]
- 1 edge to [[_COMMUNITY_handler_employee_newemployeehandler]]
- 1 edge to [[_COMMUNITY_handler_position_newpositionhandler]]
- 1 edge to [[_COMMUNITY_backend_internal_middleware_logger_go]]
- 1 edge to [[_COMMUNITY_repository_financerepo_createreconciliation]]
- 1 edge to [[_COMMUNITY_repository_paymentrepo_findbyshopandplatform]]
- 1 edge to [[_COMMUNITY_backend_internal_repository_order_repo_go]]
- 1 edge to [[_COMMUNITY_service_platformclientfactory_createmeituanclient]]
- 1 edge to [[_COMMUNITY_service_gateservice_listentryrecords]]
- 1 edge to [[_COMMUNITY_service_callback_service_newcallbackservice]]
- 1 edge to [[_COMMUNITY_service_stats_service_newstatsservice]]
- 1 edge to [[_COMMUNITY_backend_internal_database_database_go]]

## Top bridge nodes
- [[Setup()]] - degree 59, connects to 20 communities
- [[settings.go]] - degree 2, connects to 1 community
- [[NewDouyinHandler()]] - degree 2, connects to 1 community
- [[NewFinanceHandler()]] - degree 2, connects to 1 community
- [[NewMeituanHandler()]] - degree 2, connects to 1 community