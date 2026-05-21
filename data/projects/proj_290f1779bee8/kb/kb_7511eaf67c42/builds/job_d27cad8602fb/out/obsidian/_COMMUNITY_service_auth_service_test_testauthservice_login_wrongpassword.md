---
type: community
cohesion: 0.07
members: 37
---

# service_auth_service_test_testauthservice_login_wrongpassword

**Cohesion:** 0.07 - loosely connected
**Members:** 37 nodes

## Members
- [[.Refresh()]] - code - backend/internal/handler/auth.go
- [[.Reject()]] - code - backend/internal/repository/refund_repo.go
- [[AuthHandler]] - code - backend/internal/handler/auth.go
- [[AuthService]] - code - backend/internal/service/auth_service.go
- [[CORS()]] - code - backend/internal/middleware/cors.go
- [[Claims]] - code - backend/internal/middleware/jwt.go
- [[EmpInfo]] - code - backend/internal/handler/auth.go
- [[EmployeeRepoInterface]] - code - backend/internal/service/auth_service.go
- [[GenerateToken()]] - code - backend/internal/middleware/jwt.go
- [[LoginRequest]] - code - backend/internal/handler/auth.go
- [[LoginResponse]] - code - backend/internal/handler/auth.go
- [[NewAuthHandler()]] - code - backend/internal/handler/auth.go
- [[NewAuthService()]] - code - backend/internal/service/auth_service.go
- [[ParseToken()]] - code - backend/internal/middleware/jwt.go
- [[TestAuthService_Login_NotFound()]] - code - backend/internal/service/auth_service_test.go
- [[TestAuthService_Login_Success()]] - code - backend/internal/service/auth_service_test.go
- [[TestAuthService_Login_WrongPassword()]] - code - backend/internal/service/auth_service_test.go
- [[TestCORS()]] - code - backend/internal/middleware/cors_test.go
- [[TestCORSOptions()]] - code - backend/internal/middleware/cors_test.go
- [[TestGenerateToken()]] - code - backend/internal/middleware/jwt_test.go
- [[TestLoginInvalidJSON()]] - code - backend/internal/handler/auth_test.go
- [[TestLoginNonexistentUser()]] - code - backend/internal/handler/auth_test.go
- [[TestLoginSuccess()]] - code - backend/internal/handler/auth_test.go
- [[TestLoginWrongPassword()]] - code - backend/internal/handler/auth_test.go
- [[TestLogout()]] - code - backend/internal/handler/auth_test.go
- [[TestParseToken()]] - code - backend/internal/middleware/jwt_test.go
- [[auth_service_test.go]] - code - backend/internal/service/auth_service_test.go
- [[auth_test.go]] - code - backend/internal/handler/auth_test.go
- [[cors.go]] - code - backend/internal/middleware/cors.go
- [[cors_test.go]] - code - backend/internal/middleware/cors_test.go
- [[jwt.go]] - code - backend/internal/middleware/jwt.go
- [[jwt_test.go]] - code - backend/internal/middleware/jwt_test.go
- [[login()]] - code - web-admin/src/api/auth.ts
- [[logout()]] - code - mini-merchant/pages/me/me.js
- [[oauth.go]] - code - backend/pkg/douyin/oauth.go
- [[setMode()]] - code - mini-merchant/pages/verify/verify.js
- [[setupHandler()]] - code - backend/internal/handler/auth_test.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/service_auth_service_test_testauthservice_login_wrongpassword
SORT file.name ASC
```

## Connections to other communities
- 5 edges to [[_COMMUNITY_backend_internal_repository_order_repo_go]]
- 4 edges to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 3 edges to [[_COMMUNITY_assets_pc_pages_1_switchdataboardperiod]]
- 3 edges to [[_COMMUNITY_service_douyinservice_querycouponfromplatform]]
- 2 edges to [[_COMMUNITY_mini_merchant_pages_finance_finance_js]]
- 1 edge to [[_COMMUNITY_mini_merchant_pages_withdraw_account_withdraw_account_js]]
- 1 edge to [[_COMMUNITY_web_admin_src_components_layout_viewswitch_vue]]
- 1 edge to [[_COMMUNITY_service_rbacservice_updaterolepermissions]]

## Top bridge nodes
- [[login()]] - degree 7, connects to 3 communities
- [[logout()]] - degree 4, connects to 3 communities
- [[auth_test.go]] - degree 8, connects to 2 communities
- [[auth_service_test.go]] - degree 5, connects to 2 communities
- [[setMode()]] - degree 5, connects to 2 communities