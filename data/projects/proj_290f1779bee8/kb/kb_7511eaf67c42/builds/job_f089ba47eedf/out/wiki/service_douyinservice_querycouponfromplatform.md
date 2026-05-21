# service_douyinservice_querycouponfromplatform

> 39 nodes · cohesion 0.11

## Key Concepts

- **MeituanService** (16 connections) — `backend/internal/service/meituan_service.go`
- **DouyinService** (15 connections) — `backend/internal/service/douyin_service.go`
- **DouyinHandler** (13 connections) — `backend/internal/handler/douyin.go`
- **MeituanHandler** (12 connections) — `backend/internal/handler/meituan.go`
- **request.ts** (11 connections) — `web-admin/src/api/request.ts`
- **updateConfig()** (10 connections) — `web-admin/src/api/douyin.ts`
- **douyin.ts** (9 connections) — `web-admin/src/api/douyin.ts`
- **meituan.ts** (9 connections) — `web-admin/src/api/meituan.ts`
- **listRecords()** (8 connections) — `web-admin/src/api/douyin.ts`
- **listSettlements()** (8 connections) — `web-admin/src/api/douyin.ts`
- **triggerSettlement()** (8 connections) — `web-admin/src/api/douyin.ts`
- **getConfig()** (7 connections) — `web-admin/src/api/douyin.ts`
- **parks.ts** (7 connections) — `web-admin/src/api/parks.ts`
- **listStores()** (6 connections) — `web-admin/src/api/douyin.ts`
- **upsertStore()** (6 connections) — `web-admin/src/api/douyin.ts`
- **.RevokeVerify()** (6 connections) — `backend/internal/handler/douyin.go`
- **getDashboard()** (4 connections) — `web-admin/src/api/douyin.ts`
- **.QueryCoupon()** (4 connections) — `backend/internal/handler/douyin.go`
- **SettingsHandler** (4 connections) — `backend/internal/handler/settings.go`
- **.GetMPConfig()** (4 connections) — `backend/internal/handler/settings.go`
- **SettingsService** (4 connections) — `backend/internal/service/settings_service.go`
- **.VerifyCouponOnPlatform()** (3 connections) — `backend/internal/service/douyin_service.go`
- **settings.go** (2 connections) — `backend/internal/handler/settings.go`
- **NewSettingsHandler()** (2 connections) — `backend/internal/handler/settings.go`
- **.EnrichDashboard()** (2 connections) — `backend/internal/service/douyin_service.go`
- *... and 14 more nodes in this community*

## Relationships

- No strong cross-community connections detected

## Source Files

- `backend/internal/handler/douyin.go`
- `backend/internal/handler/meituan.go`
- `backend/internal/handler/settings.go`
- `backend/internal/service/douyin_service.go`
- `backend/internal/service/meituan_service.go`
- `backend/internal/service/settings_service.go`
- `web-admin/src/api/douyin.ts`
- `web-admin/src/api/meituan.ts`
- `web-admin/src/api/parks.ts`
- `web-admin/src/api/request.ts`

## Audit Trail

- EXTRACTED: 178 (89%)
- INFERRED: 22 (11%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*