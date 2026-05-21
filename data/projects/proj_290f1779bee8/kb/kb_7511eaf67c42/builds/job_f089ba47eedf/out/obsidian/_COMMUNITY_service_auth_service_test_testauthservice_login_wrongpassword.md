---
type: community
cohesion: 0.14
members: 21
---

# service_auth_service_test_testauthservice_login_wrongpassword

**Cohesion:** 0.14 - loosely connected
**Members:** 21 nodes

## Members
- [[AuthService]] - code - backend/internal/service/auth_service.go
- [[CORS()]] - code - backend/internal/middleware/cors.go
- [[EmployeeRepoInterface]] - code - backend/internal/service/auth_service.go
- [[NewAuthService()]] - code - backend/internal/service/auth_service.go
- [[TestAuthService_Login_NotFound()]] - code - backend/internal/service/auth_service_test.go
- [[TestAuthService_Login_Success()]] - code - backend/internal/service/auth_service_test.go
- [[TestAuthService_Login_WrongPassword()]] - code - backend/internal/service/auth_service_test.go
- [[TestCORS()]] - code - backend/internal/middleware/cors_test.go
- [[TestCORSOptions()]] - code - backend/internal/middleware/cors_test.go
- [[TestLoginInvalidJSON()]] - code - backend/internal/handler/auth_test.go
- [[TestLoginNonexistentUser()]] - code - backend/internal/handler/auth_test.go
- [[TestLoginSuccess()]] - code - backend/internal/handler/auth_test.go
- [[TestLoginWrongPassword()]] - code - backend/internal/handler/auth_test.go
- [[TestLogout()]] - code - backend/internal/handler/auth_test.go
- [[auth_service_test.go]] - code - backend/internal/service/auth_service_test.go
- [[auth_test.go]] - code - backend/internal/handler/auth_test.go
- [[cors.go]] - code - backend/internal/middleware/cors.go
- [[cors_test.go]] - code - backend/internal/middleware/cors_test.go
- [[mockAuthRepo]] - code - backend/internal/service/auth_service_test.go
- [[setMode()]] - code - mini-merchant/pages/verify/verify.js
- [[setupHandler()]] - code - backend/internal/handler/auth_test.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/service_auth_service_test_testauthservice_login_wrongpassword
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 3 edges to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 2 edges to [[_COMMUNITY_assets_pc_pages_1_switchdataboardperiod]]
- 2 edges to [[_COMMUNITY_mini_merchant_pages_withdraw_account_withdraw_account_js]]

## Top bridge nodes
- [[auth_test.go]] - degree 8, connects to 2 communities
- [[setMode()]] - degree 5, connects to 2 communities
- [[setupHandler()]] - degree 9, connects to 1 community
- [[NewAuthService()]] - degree 6, connects to 1 community
- [[auth_service_test.go]] - degree 5, connects to 1 community