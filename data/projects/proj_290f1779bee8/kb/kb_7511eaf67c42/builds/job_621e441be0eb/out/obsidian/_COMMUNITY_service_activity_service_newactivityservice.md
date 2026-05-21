---
type: community
cohesion: 0.05
members: 84
---

# service_activity_service_newactivityservice

**Cohesion:** 0.05 - loosely connected
**Members:** 84 nodes

## Members
- [[.Approve()]] - code - backend/internal/repository/refund_repo.go
- [[.Create()]] - code - backend/internal/handler/park.go
- [[.CreateGate()]] - code - backend/internal/service/gate_service.go
- [[.CreateRefund()]] - code - backend/pkg/wechat/refund.go
- [[.Delete()]] - code - backend/internal/handler/park.go
- [[.DeleteFaceRecord()]] - code - backend/internal/handler/gate.go
- [[.DeleteGate()]] - code - backend/internal/service/gate_service.go
- [[.FindActivity()]] - code - backend/internal/service/activity_service.go
- [[.FindByCode()]] - code - backend/internal/repository/park_repo.go
- [[.FindByID()]] - code - backend/internal/repository/shop_repo.go
- [[.FindByOpenID()]] - code - backend/internal/repository/user_repo.go
- [[.FindByOrderNo()]] - code - backend/internal/repository/order_repo.go
- [[.FindByParkID()]] - code - backend/internal/repository/shop_repo.go
- [[.FindByPhone()]] - code - backend/internal/repository/user_repo.go
- [[.FindByUsername()]] - code - backend/internal/handler/auth_test.go
- [[.FindGate()]] - code - backend/internal/service/gate_service.go
- [[.GetByID()]] - code - backend/internal/handler/park.go
- [[.GetEntries()]] - code - backend/internal/handler/gate.go
- [[.GetEntryRecords()]] - code - backend/internal/handler/gate.go
- [[.GetFaceRecords()]] - code - backend/internal/handler/gate.go
- [[.GetGateEntries()]] - code - backend/internal/service/gate_service.go
- [[.GetQRCode()]] - code - backend/internal/handler/shop.go
- [[.GetRecharges()]] - code - backend/internal/handler/user.go
- [[.GetStats()]] - code - backend/internal/handler/douyin.go
- [[.IncrementBalance()]] - code - backend/internal/repository/user_repo.go
- [[.List()]] - code - backend/internal/handler/park.go
- [[.ListEntryRecords()]] - code - backend/internal/service/gate_service.go
- [[.ListFaceRecords()]] - code - backend/internal/service/gate_service.go
- [[.ListGates()]] - code - backend/internal/service/gate_service.go
- [[.RechargeList()]] - code - backend/internal/repository/user_repo.go
- [[.ResetPassword()]] - code - backend/internal/handler/employee.go
- [[.Stats()]] - code - backend/internal/handler/user.go
- [[.ToggleStatus()]] - code - backend/internal/handler/park.go
- [[.Update()]] - code - backend/internal/handler/park.go
- [[.UpdateStatus()]] - code - backend/internal/repository/order_repo.go
- [[.Verify()]] - code - backend/internal/handler/order.go
- [[.findPosition()]] - code - backend/internal/service/position_service.go
- [[Activity]] - code - backend/internal/model/activity.go
- [[ActivityHandler]] - code - backend/internal/handler/activity.go
- [[ActivityService]] - code - backend/internal/service/activity_service.go
- [[EmployeeHandler]] - code - backend/internal/handler/employee.go
- [[EmployeeRepo]] - code - backend/internal/repository/employee_repo.go
- [[EmployeeService]] - code - backend/internal/service/employee_service.go
- [[GateHandler]] - code - backend/internal/handler/gate.go
- [[GateService]] - code - backend/internal/service/gate_service.go
- [[NewActivityService()]] - code - backend/internal/service/activity_service.go
- [[NewEmployeeRepo()]] - code - backend/internal/repository/employee_repo.go
- [[NewEmployeeService()]] - code - backend/internal/service/employee_service.go
- [[NewGateService()]] - code - backend/internal/service/gate_service.go
- [[NewOrderService()]] - code - backend/internal/service/order_service.go
- [[NewParkHandler()]] - code - backend/internal/handler/park.go
- [[NewParkRepo()]] - code - backend/internal/repository/park_repo.go
- [[NewParkService()]] - code - backend/internal/service/park_service.go
- [[NewPositionHandler()]] - code - backend/internal/handler/position.go
- [[NewPositionService()]] - code - backend/internal/service/position_service.go
- [[NewRefundRepo()]] - code - backend/internal/repository/refund_repo.go
- [[NewShopRepo()]] - code - backend/internal/repository/shop_repo.go
- [[NewShopService()]] - code - backend/internal/service/shop_service.go
- [[NewUserRepo()]] - code - backend/internal/repository/user_repo.go
- [[NewUserService()]] - code - backend/internal/service/user_service.go
- [[OKPage()]] - code - backend/pkg/response/response.go
- [[OrderHandler]] - code - backend/internal/handler/order.go
- [[OrderRepo]] - code - backend/internal/repository/order_repo.go
- [[OrderService]] - code - backend/internal/service/order_service.go
- [[Park]] - code - backend/internal/model/park.go
- [[ParkHandler]] - code - backend/internal/handler/park.go
- [[ParkRepo]] - code - backend/internal/repository/park_repo.go
- [[ParkService]] - code - backend/internal/service/park_service.go
- [[Position]] - code - backend/internal/model/position.go
- [[PositionHandler]] - code - backend/internal/handler/position.go
- [[PositionService]] - code - backend/internal/service/position_service.go
- [[RefundRepo]] - code - backend/internal/repository/refund_repo.go
- [[ShopHandler]] - code - backend/internal/handler/shop.go
- [[ShopRepo]] - code - backend/internal/repository/shop_repo.go
- [[ShopService]] - code - backend/internal/service/shop_service.go
- [[UpdateEmployeeRequest]] - code - backend/internal/service/employee_service.go
- [[UserHandler]] - code - backend/internal/handler/user.go
- [[UserRepo]] - code - backend/internal/repository/user_repo.go
- [[UserService]] - code - backend/internal/service/user_service.go
- [[authTestRepo]] - code - backend/internal/handler/auth_test.go
- [[handleScan()]] - code - mini-merchant/pages/verify/verify.js
- [[listRefunds()]] - code - web-admin/src/api/orders.ts
- [[mockAuthRepo]] - code - backend/internal/service/auth_service_test.go
- [[park.go]] - code - backend/internal/model/park.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/service_activity_service_newactivityservice
SORT file.name ASC
```

## Connections to other communities
- 31 edges to [[_COMMUNITY_service_douyinservice_querycouponfromplatform]]
- 18 edges to [[_COMMUNITY_backend_internal_repository_order_repo_go]]
- 4 edges to [[_COMMUNITY_service_auth_service_test_testauthservice_login_wrongpassword]]
- 4 edges to [[_COMMUNITY_middleware_rbac_requirepermission]]
- 3 edges to [[_COMMUNITY_backend_internal_model_shop_type_go]]
- 2 edges to [[_COMMUNITY_payment_provider_test_testnewverificationproviderunsupported]]
- 2 edges to [[_COMMUNITY_repository_financerepo_createreconciliation]]
- 1 edge to [[_COMMUNITY_assets_pc_pages_1_switchdataboardperiod]]
- 1 edge to [[_COMMUNITY_backend_internal_model_user_go]]
- 1 edge to [[_COMMUNITY_handler_order_newrefundhandler]]
- 1 edge to [[_COMMUNITY_mini_merchant_pages_finance_finance_js]]
- 1 edge to [[_COMMUNITY_service_rbacservice_updaterolepermissions]]
- 1 edge to [[_COMMUNITY_backend_internal_model_gate_go]]
- 1 edge to [[_COMMUNITY_backend_internal_model_shop_go]]
- 1 edge to [[_COMMUNITY_web_admin_src_api_orders_ts]]

## Top bridge nodes
- [[OKPage()]] - degree 13, connects to 4 communities
- [[OrderHandler]] - degree 7, connects to 3 communities
- [[.Verify()]] - degree 7, connects to 3 communities
- [[.Update()]] - degree 26, connects to 2 communities
- [[.GetByID()]] - degree 12, connects to 2 communities