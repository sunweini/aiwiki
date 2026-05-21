---
type: community
cohesion: 0.06
members: 100
---

# backend_internal_repository_stats_repo_go

**Cohesion:** 0.06 - loosely connected
**Members:** 100 nodes

## Members
- [[.Approve()]] - code - backend/internal/repository/refund_repo.go
- [[.Create()]] - code - backend/internal/handler/park.go
- [[.Delete()]] - code - backend/internal/handler/park.go
- [[.DeleteFaceRecord()]] - code - backend/internal/handler/gate.go
- [[.FindActivity()]] - code - backend/internal/service/activity_service.go
- [[.FindByCode()]] - code - backend/internal/repository/park_repo.go
- [[.FindByID()]] - code - backend/internal/repository/shop_repo.go
- [[.FindByOpenID()]] - code - backend/internal/repository/user_repo.go
- [[.FindByOrderNo()]] - code - backend/internal/repository/order_repo.go
- [[.FindByParkID()]] - code - backend/internal/repository/shop_repo.go
- [[.FindByPhone()]] - code - backend/internal/repository/user_repo.go
- [[.FindByUsername()]] - code - backend/internal/handler/auth_test.go
- [[.FlowHeatmap()]] - code - backend/internal/handler/stats.go
- [[.FlowTrend()]] - code - backend/internal/handler/stats.go
- [[.GetByID()]] - code - backend/internal/handler/park.go
- [[.GetEntries()]] - code - backend/internal/handler/gate.go
- [[.GetEntryRecords()]] - code - backend/internal/handler/gate.go
- [[.GetFaceRecords()]] - code - backend/internal/handler/gate.go
- [[.GetMPConfig()]] - code - backend/internal/handler/settings.go
- [[.GetQRCode()]] - code - backend/internal/handler/shop.go
- [[.GetRecharges()]] - code - backend/internal/handler/user.go
- [[.GetStats()]] - code - backend/internal/handler/douyin.go
- [[.IncrementBalance()]] - code - backend/internal/repository/user_repo.go
- [[.List()]] - code - backend/internal/handler/park.go
- [[.ListAllPermissions()]] - code - backend/internal/repository/rbac_repo.go
- [[.ListLogs()]] - code - backend/internal/handler/settings.go
- [[.RechargeList()]] - code - backend/internal/repository/user_repo.go
- [[.ResetPassword()]] - code - backend/internal/handler/employee.go
- [[.Review()]] - code - backend/internal/handler/order.go
- [[.SalesTrend()]] - code - backend/internal/handler/stats.go
- [[.SetRolePermissions()]] - code - backend/internal/repository/rbac_repo.go
- [[.Stats()]] - code - backend/internal/handler/user.go
- [[.ToggleStatus()]] - code - backend/internal/handler/park.go
- [[.Update()]] - code - backend/internal/handler/park.go
- [[.UpdateRolePermissions()]] - code - backend/internal/service/rbac_service.go
- [[.UpdateStatus()]] - code - backend/internal/repository/order_repo.go
- [[.Verify()]] - code - backend/internal/handler/order.go
- [[.findPosition()]] - code - backend/internal/service/position_service.go
- [[ActivityHandler]] - code - backend/internal/handler/activity.go
- [[ActivityService]] - code - backend/internal/service/activity_service.go
- [[EmployeeHandler]] - code - backend/internal/handler/employee.go
- [[EmployeeRepo]] - code - backend/internal/repository/employee_repo.go
- [[EmployeeService]] - code - backend/internal/service/employee_service.go
- [[FinanceAccount.vue]] - code - docs/INTEGRATION.md
- [[FinanceReconcile.vue]] - code - docs/INTEGRATION.md
- [[FinanceWithdraw.vue]] - code - docs/INTEGRATION.md
- [[FinanceHandler]] - code - backend/internal/handler/finance.go
- [[FinanceService]] - code - backend/internal/service/finance_service.go
- [[FlowOverview]] - code - backend/internal/repository/stats_repo.go
- [[FlowTrendPoint]] - code - backend/internal/repository/stats_repo.go
- [[GateHandler]] - code - backend/internal/handler/gate.go
- [[HeatmapPoint]] - code - backend/internal/repository/stats_repo.go
- [[NewStatsRepo()]] - code - backend/internal/repository/stats_repo.go
- [[NewUserRepo()]] - code - backend/internal/repository/user_repo.go
- [[NotFound()]] - code - backend/pkg/response/response.go
- [[OK()]] - code - backend/pkg/response/response.go
- [[OKPage()]] - code - backend/pkg/response/response.go
- [[OrderHandler]] - code - backend/internal/handler/order.go
- [[OrderRepo]] - code - backend/internal/repository/order_repo.go
- [[OrderService]] - code - backend/internal/service/order_service.go
- [[PageData]] - code - backend/pkg/response/response.go
- [[ParkHandler]] - code - backend/internal/handler/park.go
- [[ParkRepo]] - code - backend/internal/repository/park_repo.go
- [[ParkService]] - code - backend/internal/service/park_service.go
- [[PermissionHandler]] - code - backend/internal/handler/permission.go
- [[PositionHandler]] - code - backend/internal/handler/position.go
- [[PositionService]] - code - backend/internal/service/position_service.go
- [[REFUNDS]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[RefundHandler]] - code - backend/internal/handler/order.go
- [[RefundRepo]] - code - backend/internal/repository/refund_repo.go
- [[Response]] - code - backend/pkg/response/response.go
- [[SalesByShop]] - code - backend/internal/repository/stats_repo.go
- [[SalesOverview]] - code - backend/internal/repository/stats_repo.go
- [[SalesTrendPoint]] - code - backend/internal/repository/stats_repo.go
- [[ServerError()]] - code - backend/pkg/response/response.go
- [[SettingsHandler]] - code - backend/internal/handler/settings.go
- [[SettingsService]] - code - backend/internal/service/settings_service.go
- [[ShopHandler]] - code - backend/internal/handler/shop.go
- [[ShopRepo]] - code - backend/internal/repository/shop_repo.go
- [[ShopService]] - code - backend/internal/service/shop_service.go
- [[StatsHandler]] - code - backend/internal/handler/stats.go
- [[UpdateEmployeeRequest]] - code - backend/internal/service/employee_service.go
- [[UserGrowthStats]] - code - backend/internal/repository/stats_repo.go
- [[UserHandler]] - code - backend/internal/handler/user.go
- [[UserRepo]] - code - backend/internal/repository/user_repo.go
- [[UserService]] - code - backend/internal/service/user_service.go
- [[authTestRepo]] - code - backend/internal/handler/auth_test.go
- [[createWithdraw()]] - code - web-admin/src/api/finance.ts
- [[finance.ts]] - code - docs/INTEGRATION.md
- [[getAccount()]] - code - web-admin/src/api/finance.ts
- [[handleScan()]] - code - mini-merchant/pages/verify/verify.js
- [[listReconcile()]] - code - web-admin/src/api/finance.ts
- [[listRefunds()]] - code - web-admin/src/api/orders.ts
- [[listWithdraws()]] - code - web-admin/src/api/finance.ts
- [[parseDateRange()]] - code - backend/internal/handler/stats.go
- [[response.go]] - code - backend/pkg/response/response.go
- [[reviewRefund()]] - code - web-admin/src/api/orders.ts
- [[reviewWithdraw()]] - code - web-admin/src/api/finance.ts
- [[stats.go]] - code - backend/internal/handler/stats.go
- [[stats_repo.go]] - code - backend/internal/repository/stats_repo.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/backend_internal_repository_stats_repo_go
SORT file.name ASC
```

## Connections to other communities
- 21 edges to [[_COMMUNITY_web_admin_src_components_layout_viewswitch_vue]]
- 18 edges to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 7 edges to [[_COMMUNITY_yfsc_platform_v2_meituan_assets_pc_data_js]]
- 7 edges to [[_COMMUNITY_backend_internal_repository_rbac_repo_go]]
- 5 edges to [[_COMMUNITY_payment_provider_test_testnewpaymentproviderunsupported]]
- 5 edges to [[_COMMUNITY_response_response_test_testunauthorized]]
- 4 edges to [[_COMMUNITY_repository_refundrepo_reject]]
- 3 edges to [[_COMMUNITY_service_auth_service_test_testauthservice_login_wrongpassword]]
- 3 edges to [[_COMMUNITY_service_gateservice_listentryrecords]]
- 3 edges to [[_COMMUNITY_repository_financerepo_createreconciliation]]
- 3 edges to [[_COMMUNITY_backend_pkg_payment_provider_go]]
- 3 edges to [[_COMMUNITY_integration_admin_order_list]]
- 2 edges to [[_COMMUNITY_handler_order_newrefundhandler]]
- 2 edges to [[_COMMUNITY_handler_douyinhandler_dashboard]]
- 1 edge to [[_COMMUNITY_assets_pc_pages_1_switchdataboardperiod]]
- 1 edge to [[_COMMUNITY_backend_internal_model_user_go]]
- 1 edge to [[_COMMUNITY_backend_internal_handler_callback_go]]
- 1 edge to [[_COMMUNITY_mini_merchant_pages_finance_finance_js]]
- 1 edge to [[_COMMUNITY_handler_employee_newemployeehandler]]
- 1 edge to [[_COMMUNITY_handler_position_newpositionhandler]]
- 1 edge to [[_COMMUNITY_service_stats_service_newstatsservice]]
- 1 edge to [[_COMMUNITY_backend_internal_repository_order_repo_go]]
- 1 edge to [[_COMMUNITY_response_response_test_testforbidden]]

## Top bridge nodes
- [[ServerError()]] - degree 46, connects to 7 communities
- [[OK()]] - degree 44, connects to 7 communities
- [[response.go]] - degree 9, connects to 3 communities
- [[OKPage()]] - degree 13, connects to 2 communities
- [[finance.ts]] - degree 10, connects to 2 communities