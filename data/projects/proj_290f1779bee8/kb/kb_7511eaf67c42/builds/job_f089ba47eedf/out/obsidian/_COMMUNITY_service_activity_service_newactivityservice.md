---
type: community
cohesion: 0.10
members: 26
---

# service_activity_service_newactivityservice

**Cohesion:** 0.10 - loosely connected
**Members:** 26 nodes

## Members
- [[JWTAuth()]] - code - backend/internal/middleware/jwt.go
- [[NewActivityService()]] - code - backend/internal/service/activity_service.go
- [[NewDouyinService()]] - code - backend/internal/service/douyin_service.go
- [[NewEmployeeRepo()]] - code - backend/internal/repository/employee_repo.go
- [[NewEmployeeService()]] - code - backend/internal/service/employee_service.go
- [[NewMeituanService()]] - code - backend/internal/service/meituan_service.go
- [[NewOrderRepo()]] - code - backend/internal/repository/order_repo.go
- [[NewOrderService()]] - code - backend/internal/service/order_service.go
- [[NewParkRepo()]] - code - backend/internal/repository/park_repo.go
- [[NewParkService()]] - code - backend/internal/service/park_service.go
- [[NewPositionService()]] - code - backend/internal/service/position_service.go
- [[NewRefundRepo()]] - code - backend/internal/repository/refund_repo.go
- [[NewShopRepo()]] - code - backend/internal/repository/shop_repo.go
- [[NewShopService()]] - code - backend/internal/service/shop_service.go
- [[NewUserService()]] - code - backend/internal/service/user_service.go
- [[Setup()]] - code - backend/internal/router/router.go
- [[TestError()]] - code - backend/pkg/response/response_test.go
- [[TestNotFound()]] - code - backend/pkg/response/response_test.go
- [[TestOK()]] - code - backend/pkg/response/response_test.go
- [[TestOKPage()]] - code - backend/pkg/response/response_test.go
- [[TestServerError()]] - code - backend/pkg/response/response_test.go
- [[TestUnauthorized()]] - code - backend/pkg/response/response_test.go
- [[Unauthorized()]] - code - backend/pkg/response/response.go
- [[order_repo.go]] - code - backend/internal/repository/order_repo.go
- [[response_test.go]] - code - backend/pkg/response/response_test.go
- [[router.go]] - code - backend/internal/router/router.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/service_activity_service_newactivityservice
SORT file.name ASC
```

## Connections to other communities
- 21 edges to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 4 edges to [[_COMMUNITY_service_rbacservice_updaterolepermissions]]
- 4 edges to [[_COMMUNITY_response_response_test_testforbidden]]
- 4 edges to [[_COMMUNITY_service_douyinservice_querycouponfromplatform]]
- 3 edges to [[_COMMUNITY_service_auth_service_test_testauthservice_login_wrongpassword]]
- 2 edges to [[_COMMUNITY_mini_merchant_pages_withdraw_account_withdraw_account_js]]
- 2 edges to [[_COMMUNITY_handler_order_newrefundhandler]]
- 2 edges to [[_COMMUNITY_repository_financerepo_createreconciliation]]
- 1 edge to [[_COMMUNITY_backend_internal_model_park_go]]
- 1 edge to [[_COMMUNITY_backend_internal_model_finance_go]]
- 1 edge to [[_COMMUNITY_backend_internal_model_user_go]]
- 1 edge to [[_COMMUNITY_backend_internal_handler_callback_go]]
- 1 edge to [[_COMMUNITY_backend_internal_model_shop_type_go]]
- 1 edge to [[_COMMUNITY_backend_internal_model_meituan_go]]
- 1 edge to [[_COMMUNITY_backend_internal_model_gate_go]]
- 1 edge to [[_COMMUNITY_handler_position_newpositionhandler]]
- 1 edge to [[_COMMUNITY_backend_internal_model_shop_go]]
- 1 edge to [[_COMMUNITY_backend_internal_middleware_logger_go]]
- 1 edge to [[_COMMUNITY_repository_paymentrepo_findbyshopandplatform]]
- 1 edge to [[_COMMUNITY_service_platformclientfactory_createmeituanclient]]
- 1 edge to [[_COMMUNITY_service_gateservice_listentryrecords]]
- 1 edge to [[_COMMUNITY_service_callback_service_newcallbackservice]]
- 1 edge to [[_COMMUNITY_service_stats_service_newstatsservice]]

## Top bridge nodes
- [[Setup()]] - degree 59, connects to 23 communities
- [[response_test.go]] - degree 8, connects to 1 community
- [[JWTAuth()]] - degree 3, connects to 1 community
- [[TestNotFound()]] - degree 3, connects to 1 community
- [[TestOK()]] - degree 3, connects to 1 community