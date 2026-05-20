---
type: community
cohesion: 0.15
members: 16
---

# backend_internal_model_shop_type_go

**Cohesion:** 0.15 - loosely connected
**Members:** 16 nodes

## Members
- [[.TableName()]] - code - backend/internal/model/park.go
- [[FaceRecord]] - code - backend/internal/model/gate.go
- [[GateDevice]] - code - backend/internal/model/gate.go
- [[GateEntryRecord]] - code - backend/internal/model/gate.go
- [[MiniProgramConfig]] - code - backend/internal/model/system.go
- [[NewGateHandler()]] - code - backend/internal/handler/gate.go
- [[OperationLog]] - code - backend/internal/model/system.go
- [[PaymentConfig]] - code - backend/internal/model/payment.go
- [[Role]] - code - backend/internal/model/role.go
- [[RolePermission]] - code - backend/internal/model/role_permission.go
- [[ShopType]] - code - backend/internal/model/shop_type.go
- [[gate.go]] - code - backend/internal/model/gate.go
- [[payment.go]] - code - backend/internal/model/payment.go
- [[role.go]] - code - backend/internal/model/role.go
- [[shop_type.go]] - code - backend/internal/model/shop_type.go
- [[system.go]] - code - backend/internal/model/system.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/backend_internal_model_shop_type_go
SORT file.name ASC
```

## Connections to other communities
- 4 edges to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 4 edges to [[_COMMUNITY_backend_internal_model_douyin_go]]
- 4 edges to [[_COMMUNITY_backend_internal_model_meituan_go]]
- 2 edges to [[_COMMUNITY_service_rbacservice_updaterolepermissions]]
- 2 edges to [[_COMMUNITY_backend_internal_model_finance_go]]
- 1 edge to [[_COMMUNITY_backend_internal_repository_order_repo_go]]
- 1 edge to [[_COMMUNITY_backend_internal_model_user_go]]
- 1 edge to [[_COMMUNITY_handler_order_newrefundhandler]]
- 1 edge to [[_COMMUNITY_backend_pkg_payment_provider_go]]
- 1 edge to [[_COMMUNITY_backend_internal_model_shop_go]]
- 1 edge to [[_COMMUNITY_assets_pc_data_recharges]]

## Top bridge nodes
- [[.TableName()]] - degree 29, connects to 10 communities
- [[gate.go]] - degree 5, connects to 1 community
- [[NewGateHandler()]] - degree 2, connects to 1 community