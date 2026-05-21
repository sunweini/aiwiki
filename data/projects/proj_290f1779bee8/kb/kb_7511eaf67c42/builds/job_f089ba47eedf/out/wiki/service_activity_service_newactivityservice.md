# service_activity_service_newactivityservice

> 26 nodes · cohesion 0.10

## Key Concepts

- **Setup()** (59 connections) — `backend/internal/router/router.go`
- **response_test.go** (8 connections) — `backend/pkg/response/response_test.go`
- **JWTAuth()** (3 connections) — `backend/internal/middleware/jwt.go`
- **TestNotFound()** (3 connections) — `backend/pkg/response/response_test.go`
- **TestOK()** (3 connections) — `backend/pkg/response/response_test.go`
- **TestOKPage()** (3 connections) — `backend/pkg/response/response_test.go`
- **TestServerError()** (3 connections) — `backend/pkg/response/response_test.go`
- **TestUnauthorized()** (3 connections) — `backend/pkg/response/response_test.go`
- **Unauthorized()** (3 connections) — `backend/pkg/response/response.go`
- **order_repo.go** (2 connections) — `backend/internal/repository/order_repo.go`
- **NewEmployeeRepo()** (2 connections) — `backend/internal/repository/employee_repo.go`
- **NewOrderRepo()** (2 connections) — `backend/internal/repository/order_repo.go`
- **NewParkRepo()** (2 connections) — `backend/internal/repository/park_repo.go`
- **NewRefundRepo()** (2 connections) — `backend/internal/repository/refund_repo.go`
- **NewShopRepo()** (2 connections) — `backend/internal/repository/shop_repo.go`
- **TestError()** (2 connections) — `backend/pkg/response/response_test.go`
- **NewActivityService()** (2 connections) — `backend/internal/service/activity_service.go`
- **NewDouyinService()** (2 connections) — `backend/internal/service/douyin_service.go`
- **NewEmployeeService()** (2 connections) — `backend/internal/service/employee_service.go`
- **NewMeituanService()** (2 connections) — `backend/internal/service/meituan_service.go`
- **NewOrderService()** (2 connections) — `backend/internal/service/order_service.go`
- **NewParkService()** (2 connections) — `backend/internal/service/park_service.go`
- **NewPositionService()** (2 connections) — `backend/internal/service/position_service.go`
- **NewShopService()** (2 connections) — `backend/internal/service/shop_service.go`
- **NewUserService()** (2 connections) — `backend/internal/service/user_service.go`
- *... and 1 more nodes in this community*

## Relationships

- No strong cross-community connections detected

## Source Files

- `backend/internal/middleware/jwt.go`
- `backend/internal/repository/employee_repo.go`
- `backend/internal/repository/order_repo.go`
- `backend/internal/repository/park_repo.go`
- `backend/internal/repository/refund_repo.go`
- `backend/internal/repository/shop_repo.go`
- `backend/internal/router/router.go`
- `backend/internal/service/activity_service.go`
- `backend/internal/service/douyin_service.go`
- `backend/internal/service/employee_service.go`
- `backend/internal/service/meituan_service.go`
- `backend/internal/service/order_service.go`
- `backend/internal/service/park_service.go`
- `backend/internal/service/position_service.go`
- `backend/internal/service/shop_service.go`
- `backend/internal/service/user_service.go`
- `backend/pkg/response/response.go`
- `backend/pkg/response/response_test.go`

## Audit Trail

- EXTRACTED: 48 (40%)
- INFERRED: 73 (60%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*