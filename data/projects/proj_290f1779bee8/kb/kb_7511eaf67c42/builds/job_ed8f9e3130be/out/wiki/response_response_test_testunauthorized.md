# response_response_test_testunauthorized

> 15 nodes · cohesion 0.21

## Key Concepts

- **Setup()** (59 connections) — `backend/internal/router/router.go`
- **response_test.go** (8 connections) — `backend/pkg/response/response_test.go`
- **JWTAuth()** (3 connections) — `backend/internal/middleware/jwt.go`
- **TestForbidden()** (3 connections) — `backend/pkg/response/response_test.go`
- **TestNotFound()** (3 connections) — `backend/pkg/response/response_test.go`
- **TestOK()** (3 connections) — `backend/pkg/response/response_test.go`
- **TestOKPage()** (3 connections) — `backend/pkg/response/response_test.go`
- **TestServerError()** (3 connections) — `backend/pkg/response/response_test.go`
- **TestUnauthorized()** (3 connections) — `backend/pkg/response/response_test.go`
- **Unauthorized()** (3 connections) — `backend/pkg/response/response.go`
- **Logger()** (2 connections) — `backend/internal/middleware/logger.go`
- **TestError()** (2 connections) — `backend/pkg/response/response_test.go`
- **NewDouyinService()** (2 connections) — `backend/internal/service/douyin_service.go`
- **logger.go** (1 connections) — `backend/internal/middleware/logger.go`
- **router.go** (1 connections) — `backend/internal/router/router.go`

## Relationships

- No strong cross-community connections detected

## Source Files

- `backend/internal/middleware/jwt.go`
- `backend/internal/middleware/logger.go`
- `backend/internal/router/router.go`
- `backend/internal/service/douyin_service.go`
- `backend/pkg/response/response.go`
- `backend/pkg/response/response_test.go`

## Audit Trail

- EXTRACTED: 37 (37%)
- INFERRED: 62 (63%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*