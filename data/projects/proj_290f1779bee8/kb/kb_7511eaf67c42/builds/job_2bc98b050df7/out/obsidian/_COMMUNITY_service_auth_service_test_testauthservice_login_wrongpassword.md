---
type: community
cohesion: 0.10
members: 26
---

# service_auth_service_test_testauthservice_login_wrongpassword

**Cohesion:** 0.10 - loosely connected
**Members:** 26 nodes

## Members
- [[AuthService]] - code - backend/internal/service/auth_service.go
- [[CORS()]] - code - backend/internal/middleware/cors.go
- [[EmpInfo]] - code - backend/internal/handler/auth.go
- [[EmployeeRepoInterface]] - code - backend/internal/service/auth_service.go
- [[LoginRequest]] - code - backend/internal/handler/auth.go
- [[LoginResponse]] - code - backend/internal/handler/auth.go
- [[NewAuthHandler()]] - code - backend/internal/handler/auth.go
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
- [[oauth.go]] - code - backend/pkg/douyin/oauth.go
- [[setMode()]] - code - mini-merchant/pages/verify/verify.js
- [[setupHandler()]] - code - backend/internal/handler/auth_test.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/service_auth_service_test_testauthservice_login_wrongpassword
SORT file.name ASC
```

## Connections to other communities
- 4 edges to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 3 edges to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 2 edges to [[_COMMUNITY_assets_pc_pages_1_switchdataboardperiod]]
- 2 edges to [[_COMMUNITY_repository_refundrepo_reject]]
- 1 edge to [[_COMMUNITY_web_admin_src_components_layout_viewswitch_vue]]

## Top bridge nodes
- [[auth_test.go]] - degree 8, connects to 2 communities
- [[oauth.go]] - degree 6, connects to 2 communities
- [[setMode()]] - degree 5, connects to 2 communities
- [[NewAuthService()]] - degree 6, connects to 1 community
- [[auth_service_test.go]] - degree 5, connects to 1 community