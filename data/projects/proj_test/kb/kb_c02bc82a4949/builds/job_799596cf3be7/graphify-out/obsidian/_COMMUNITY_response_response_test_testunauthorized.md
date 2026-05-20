---
type: community
cohesion: 0.18
members: 17
---

# response_response_test_testunauthorized

**Cohesion:** 0.18 - loosely connected
**Members:** 17 nodes

## Members
- [[JWTAuth()]] - code - backend/internal/middleware/jwt.go
- [[Logger()]] - code - backend/internal/middleware/logger.go
- [[NewDouyinService()]] - code - backend/internal/service/douyin_service.go
- [[NewSettingsHandler()]] - code - backend/internal/handler/settings.go
- [[Setup()]] - code - backend/internal/router/router.go
- [[TestError()]] - code - backend/pkg/response/response_test.go
- [[TestForbidden()]] - code - backend/pkg/response/response_test.go
- [[TestNotFound()]] - code - backend/pkg/response/response_test.go
- [[TestOK()]] - code - backend/pkg/response/response_test.go
- [[TestOKPage()]] - code - backend/pkg/response/response_test.go
- [[TestServerError()]] - code - backend/pkg/response/response_test.go
- [[TestUnauthorized()]] - code - backend/pkg/response/response_test.go
- [[Unauthorized()]] - code - backend/pkg/response/response.go
- [[logger.go]] - code - backend/internal/middleware/logger.go
- [[response_test.go]] - code - backend/pkg/response/response_test.go
- [[router.go]] - code - backend/internal/router/router.go
- [[settings.go]] - code - backend/internal/handler/settings.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/response_response_test_testunauthorized
SORT file.name ASC
```

## Connections to other communities
- 17 edges to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 8 edges to [[_COMMUNITY_service_douyinservice_querycouponfromplatform]]
- 5 edges to [[_COMMUNITY_service_auth_service_test_testauthservice_login_wrongpassword]]
- 4 edges to [[_COMMUNITY_service_rbacservice_updaterolepermissions]]
- 3 edges to [[_COMMUNITY_middleware_rbac_requirepermission]]
- 2 edges to [[_COMMUNITY_backend_internal_handler_rbac_go]]
- 2 edges to [[_COMMUNITY_handler_order_newrefundhandler]]
- 2 edges to [[_COMMUNITY_repository_financerepo_createreconciliation]]
- 1 edge to [[_COMMUNITY_backend_internal_model_finance_go]]
- 1 edge to [[_COMMUNITY_backend_internal_model_user_go]]
- 1 edge to [[_COMMUNITY_backend_internal_handler_callback_go]]
- 1 edge to [[_COMMUNITY_backend_internal_model_payment_go]]
- 1 edge to [[_COMMUNITY_backend_internal_model_meituan_go]]
- 1 edge to [[_COMMUNITY_backend_internal_model_gate_go]]
- 1 edge to [[_COMMUNITY_backend_internal_model_shop_go]]
- 1 edge to [[_COMMUNITY_repository_paymentrepo_findbyshopandplatform]]
- 1 edge to [[_COMMUNITY_backend_internal_repository_order_repo_go]]
- 1 edge to [[_COMMUNITY_service_platformclientfactory_createmeituanclient]]
- 1 edge to [[_COMMUNITY_service_callback_service_newcallbackservice]]
- 1 edge to [[_COMMUNITY_service_stats_service_newstatsservice]]

## Top bridge nodes
- [[Setup()]] - degree 59, connects to 19 communities
- [[JWTAuth()]] - degree 3, connects to 1 community
- [[TestForbidden()]] - degree 3, connects to 1 community
- [[TestNotFound()]] - degree 3, connects to 1 community
- [[TestOK()]] - degree 3, connects to 1 community