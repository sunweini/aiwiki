# service_douyinservice_querycouponfromplatform

> 58 nodes · cohesion 0.09

## Key Concepts

- **ServerError()** (46 connections) — `backend/pkg/response/response.go`
- **OK()** (44 connections) — `backend/pkg/response/response.go`
- **MeituanService** (16 connections) — `backend/internal/service/meituan_service.go`
- **DouyinService** (15 connections) — `backend/internal/service/douyin_service.go`
- **DouyinHandler** (13 connections) — `backend/internal/handler/douyin.go`
- **MeituanHandler** (12 connections) — `backend/internal/handler/meituan.go`
- **.Dashboard()** (11 connections) — `backend/internal/handler/douyin.go`
- **request.ts** (11 connections) — `web-admin/src/api/request.ts`
- **updateConfig()** (10 connections) — `web-admin/src/api/douyin.ts`
- **stats_repo.go** (9 connections) — `backend/internal/repository/stats_repo.go`
- **StatsHandler** (9 connections) — `backend/internal/handler/stats.go`
- **douyin.ts** (9 connections) — `web-admin/src/api/douyin.ts`
- **meituan.ts** (9 connections) — `web-admin/src/api/meituan.ts`
- **listRecords()** (8 connections) — `web-admin/src/api/douyin.ts`
- **listSettlements()** (8 connections) — `web-admin/src/api/douyin.ts`
- **triggerSettlement()** (8 connections) — `web-admin/src/api/douyin.ts`
- **getConfig()** (7 connections) — `web-admin/src/api/douyin.ts`
- **parseDateRange()** (7 connections) — `backend/internal/handler/stats.go`
- **listStores()** (6 connections) — `web-admin/src/api/douyin.ts`
- **upsertStore()** (6 connections) — `web-admin/src/api/douyin.ts`
- **reviewRefund()** (6 connections) — `web-admin/src/api/orders.ts`
- **.RevokeVerify()** (6 connections) — `backend/internal/handler/douyin.go`
- **.VerifyCoupon()** (6 connections) — `backend/internal/handler/douyin.go`
- **FlowOverview** (5 connections) — `backend/internal/repository/stats_repo.go`
- **SalesByShop** (5 connections) — `backend/internal/repository/stats_repo.go`
- *... and 33 more nodes in this community*

## Relationships

- No strong cross-community connections detected

## Source Files

- `backend/internal/handler/douyin.go`
- `backend/internal/handler/meituan.go`
- `backend/internal/handler/order.go`
- `backend/internal/handler/settings.go`
- `backend/internal/handler/stats.go`
- `backend/internal/repository/stats_repo.go`
- `backend/internal/service/douyin_service.go`
- `backend/internal/service/meituan_service.go`
- `backend/internal/service/platform_client.go`
- `backend/internal/service/settings_service.go`
- `backend/pkg/response/response.go`
- `mini-merchant/pages/dashboard/dashboard.js`
- `web-admin/src/api/douyin.ts`
- `web-admin/src/api/meituan.ts`
- `web-admin/src/api/orders.ts`
- `web-admin/src/api/request.ts`

## Audit Trail

- EXTRACTED: 241 (64%)
- INFERRED: 136 (36%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*