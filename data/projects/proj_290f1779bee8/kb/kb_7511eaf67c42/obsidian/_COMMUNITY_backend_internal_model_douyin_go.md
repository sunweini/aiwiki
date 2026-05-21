---
type: community
cohesion: 0.21
members: 13
---

# backend_internal_model_douyin_go

**Cohesion:** 0.21 - loosely connected
**Members:** 13 nodes

## Members
- [[.TableName()]] - code - backend/internal/model/park.go
- [[DouyinApiConfig]] - code - backend/internal/model/douyin.go
- [[DouyinSettlement]] - code - backend/internal/model/douyin.go
- [[DouyinStoreMapping]] - code - backend/internal/model/douyin.go
- [[DouyinVerifyRecord]] - code - backend/internal/model/douyin.go
- [[MiniProgramConfig]] - code - backend/internal/model/system.go
- [[NewDouyinHandler()]] - code - backend/internal/handler/douyin.go
- [[OperationLog]] - code - backend/internal/model/system.go
- [[Role]] - code - backend/internal/model/role.go
- [[RolePermission]] - code - backend/internal/model/role_permission.go
- [[douyin.go]] - code - backend/internal/model/douyin.go
- [[role.go]] - code - backend/internal/model/role.go
- [[system.go]] - code - backend/internal/model/system.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/backend_internal_model_douyin_go
SORT file.name ASC
```

## Connections to other communities
- 4 edges to [[_COMMUNITY_backend_internal_model_meituan_go]]
- 3 edges to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 3 edges to [[_COMMUNITY_backend_internal_model_gate_go]]
- 2 edges to [[_COMMUNITY_yfsc_platform_v2_meituan_assets_pc_data_js]]
- 2 edges to [[_COMMUNITY_service_rbacservice_updaterolepermissions]]
- 2 edges to [[_COMMUNITY_backend_internal_model_finance_go]]
- 1 edge to [[_COMMUNITY_service_douyinservice_querycouponfromplatform]]
- 1 edge to [[_COMMUNITY_response_response_test_testunauthorized]]
- 1 edge to [[_COMMUNITY_backend_internal_model_user_go]]
- 1 edge to [[_COMMUNITY_backend_internal_model_shop_type_go]]
- 1 edge to [[_COMMUNITY_handler_order_newrefundhandler]]
- 1 edge to [[_COMMUNITY_backend_internal_model_payment_go]]
- 1 edge to [[_COMMUNITY_backend_pkg_payment_provider_go]]
- 1 edge to [[_COMMUNITY_backend_internal_model_shop_go]]
- 1 edge to [[_COMMUNITY_assets_pc_data_recharges]]

## Top bridge nodes
- [[.TableName()]] - degree 29, connects to 12 communities
- [[douyin.go]] - degree 6, connects to 1 community
- [[DouyinSettlement]] - degree 3, connects to 1 community
- [[DouyinVerifyRecord]] - degree 3, connects to 1 community
- [[NewDouyinHandler()]] - degree 2, connects to 1 community