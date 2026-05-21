# service_auth_service_test_testauthservice_login_wrongpassword

> 37 nodes · cohesion 0.07

## Key Concepts

- **setupHandler()** (9 connections) — `backend/internal/handler/auth_test.go`
- **auth_test.go** (8 connections) — `backend/internal/handler/auth_test.go`
- **login()** (7 connections) — `web-admin/src/api/auth.ts`
- **oauth.go** (6 connections) — `backend/pkg/douyin/oauth.go`
- **NewAuthService()** (6 connections) — `backend/internal/service/auth_service.go`
- **auth_service_test.go** (5 connections) — `backend/internal/service/auth_service_test.go`
- **setMode()** (5 connections) — `mini-merchant/pages/verify/verify.js`
- **jwt.go** (4 connections) — `backend/internal/middleware/jwt.go`
- **AuthHandler** (4 connections) — `backend/internal/handler/auth.go`
- **logout()** (4 connections) — `mini-merchant/pages/me/me.js`
- **CORS()** (4 connections) — `backend/internal/middleware/cors.go`
- **GenerateToken()** (4 connections) — `backend/internal/middleware/jwt.go`
- **jwt_test.go** (3 connections) — `backend/internal/middleware/jwt_test.go`
- **NewAuthHandler()** (3 connections) — `backend/internal/handler/auth.go`
- **TestCORS()** (3 connections) — `backend/internal/middleware/cors_test.go`
- **TestCORSOptions()** (3 connections) — `backend/internal/middleware/cors_test.go`
- **TestParseToken()** (3 connections) — `backend/internal/middleware/jwt_test.go`
- **AuthService** (3 connections) — `backend/internal/service/auth_service.go`
- **cors_test.go** (2 connections) — `backend/internal/middleware/cors_test.go`
- **TestLoginInvalidJSON()** (2 connections) — `backend/internal/handler/auth_test.go`
- **TestLoginNonexistentUser()** (2 connections) — `backend/internal/handler/auth_test.go`
- **TestLoginSuccess()** (2 connections) — `backend/internal/handler/auth_test.go`
- **TestLoginWrongPassword()** (2 connections) — `backend/internal/handler/auth_test.go`
- **TestLogout()** (2 connections) — `backend/internal/handler/auth_test.go`
- **.Refresh()** (2 connections) — `backend/internal/handler/auth.go`
- *... and 12 more nodes in this community*

## Relationships

- No strong cross-community connections detected

## Source Files

- `backend/internal/handler/auth.go`
- `backend/internal/handler/auth_test.go`
- `backend/internal/middleware/cors.go`
- `backend/internal/middleware/cors_test.go`
- `backend/internal/middleware/jwt.go`
- `backend/internal/middleware/jwt_test.go`
- `backend/internal/repository/refund_repo.go`
- `backend/internal/service/auth_service.go`
- `backend/internal/service/auth_service_test.go`
- `backend/pkg/douyin/oauth.go`
- `mini-merchant/pages/me/me.js`
- `mini-merchant/pages/verify/verify.js`
- `web-admin/src/api/auth.ts`

## Audit Trail

- EXTRACTED: 79 (68%)
- INFERRED: 37 (32%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*