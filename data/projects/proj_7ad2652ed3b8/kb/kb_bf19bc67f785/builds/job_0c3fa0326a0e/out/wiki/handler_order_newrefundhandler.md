# handler_order_newrefundhandler

> 14 nodes · cohesion 0.14

## Key Concepts

- **order.go** (15 connections) — `backend/pkg/wechat/order.go`
- **NewOrderHandler()** (2 connections) — `backend/internal/handler/order.go`
- **NewRefundHandler()** (2 connections) — `backend/internal/handler/order.go`
- **Order** (2 connections) — `backend/internal/model/order.go`
- **OrderInfo** (1 connections) — `backend/pkg/douyin/order.go`
- **OrderQueryResponse** (1 connections) — `backend/pkg/douyin/order.go`
- **OrderProduct** (1 connections) — `backend/pkg/meituan/order.go`
- **OrderQueryRequest** (1 connections) — `backend/pkg/meituan/order.go`
- **Amount** (1 connections) — `backend/pkg/wechat/order.go`
- **JSAPIRequest** (1 connections) — `backend/pkg/wechat/order.go`
- **JSAPIResponse** (1 connections) — `backend/pkg/wechat/order.go`
- **NativeRequest** (1 connections) — `backend/pkg/wechat/order.go`
- **NativeResponse** (1 connections) — `backend/pkg/wechat/order.go`
- **Payer** (1 connections) — `backend/pkg/wechat/order.go`

## Relationships

- No strong cross-community connections detected

## Source Files

- `backend/internal/handler/order.go`
- `backend/internal/model/order.go`
- `backend/pkg/douyin/order.go`
- `backend/pkg/meituan/order.go`
- `backend/pkg/wechat/order.go`

## Audit Trail

- EXTRACTED: 29 (94%)
- INFERRED: 2 (6%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*