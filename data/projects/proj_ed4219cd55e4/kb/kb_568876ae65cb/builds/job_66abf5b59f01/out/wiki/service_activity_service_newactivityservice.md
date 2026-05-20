# service_activity_service_newactivityservice

> 84 nodes · cohesion 0.05

## Key Concepts

- **.List()** (26 connections) — `backend/internal/handler/park.go`
- **.Update()** (26 connections) — `backend/internal/handler/park.go`
- **.Create()** (22 connections) — `backend/internal/handler/park.go`
- **.Delete()** (17 connections) — `backend/internal/handler/park.go`
- **OKPage()** (13 connections) — `backend/pkg/response/response.go`
- **.GetByID()** (12 connections) — `backend/internal/handler/park.go`
- **.Stats()** (10 connections) — `backend/internal/handler/user.go`
- **UserRepo** (10 connections) — `backend/internal/repository/user_repo.go`
- **GateService** (10 connections) — `backend/internal/service/gate_service.go`
- **GateHandler** (9 connections) — `backend/internal/handler/gate.go`
- **EmployeeService** (9 connections) — `backend/internal/service/employee_service.go`
- **EmployeeHandler** (8 connections) — `backend/internal/handler/employee.go`
- **ShopHandler** (8 connections) — `backend/internal/handler/shop.go`
- **OrderRepo** (8 connections) — `backend/internal/repository/order_repo.go`
- **ShopRepo** (8 connections) — `backend/internal/repository/shop_repo.go`
- **OrderService** (8 connections) — `backend/internal/service/order_service.go`
- **ShopService** (8 connections) — `backend/internal/service/shop_service.go`
- **ActivityHandler** (7 connections) — `backend/internal/handler/activity.go`
- **authTestRepo** (7 connections) — `backend/internal/handler/auth_test.go`
- **.GetStats()** (7 connections) — `backend/internal/handler/douyin.go`
- **OrderHandler** (7 connections) — `backend/internal/handler/order.go`
- **.Verify()** (7 connections) — `backend/internal/handler/order.go`
- **ParkHandler** (7 connections) — `backend/internal/handler/park.go`
- **.ToggleStatus()** (7 connections) — `backend/internal/handler/park.go`
- **UserHandler** (7 connections) — `backend/internal/handler/user.go`
- *... and 59 more nodes in this community*

## Relationships

- No strong cross-community connections detected

## Source Files

- `backend/internal/handler/activity.go`
- `backend/internal/handler/auth_test.go`
- `backend/internal/handler/douyin.go`
- `backend/internal/handler/employee.go`
- `backend/internal/handler/gate.go`
- `backend/internal/handler/order.go`
- `backend/internal/handler/park.go`
- `backend/internal/handler/position.go`
- `backend/internal/handler/shop.go`
- `backend/internal/handler/user.go`
- `backend/internal/model/activity.go`
- `backend/internal/model/park.go`
- `backend/internal/model/position.go`
- `backend/internal/repository/employee_repo.go`
- `backend/internal/repository/order_repo.go`
- `backend/internal/repository/park_repo.go`
- `backend/internal/repository/refund_repo.go`
- `backend/internal/repository/shop_repo.go`
- `backend/internal/repository/user_repo.go`
- `backend/internal/service/activity_service.go`

## Audit Trail

- EXTRACTED: 367 (86%)
- INFERRED: 61 (14%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*