# payment_provider_test_testnewpaymentproviderunsupported

> 50 nodes · cohesion 0.06

## Key Concepts

- **Client** (33 connections) — `backend/pkg/alipay/trade.go`
- **factory.go** (8 connections) — `backend/pkg/payment/factory.go`
- **AlipayProvider** (7 connections) — `backend/pkg/payment/factory.go`
- **WechatProvider** (7 connections) — `backend/pkg/payment/factory.go`
- **.VerifyCoupon()** (6 connections) — `backend/internal/handler/douyin.go`
- **DouyinProvider** (5 connections) — `backend/pkg/payment/factory.go`
- **MeituanProvider** (5 connections) — `backend/pkg/payment/factory.go`
- **trade.go** (4 connections) — `backend/pkg/alipay/trade.go`
- **.Do()** (3 connections) — `backend/pkg/alipay/client.go`
- **.Sign()** (3 connections) — `backend/pkg/alipay/client.go`
- **.Transfer()** (3 connections) — `backend/pkg/alipay/transfer.go`
- **.QueryOrder()** (3 connections) — `backend/pkg/douyin/order.go`
- **.PrepareCoupon()** (3 connections) — `backend/pkg/meituan/coupon.go`
- **.QueryVerifyHistory()** (3 connections) — `backend/pkg/meituan/order.go`
- **.CloseOrder()** (3 connections) — `backend/pkg/wechat/order.go`
- **.CreateJSAPIOrder()** (3 connections) — `backend/pkg/wechat/order.go`
- **.CreateNativeOrder()** (3 connections) — `backend/pkg/wechat/order.go`
- **.QueryRefund()** (3 connections) — `backend/pkg/wechat/refund.go`
- **TradePrecreateRequest** (2 connections) — `backend/pkg/alipay/trade.go`
- **.Get()** (2 connections) — `backend/pkg/douyin/client.go`
- **.VerifyCertificate()** (2 connections) — `backend/pkg/douyin/coupon.go`
- **.VerifyThirdPartyCoupon()** (2 connections) — `backend/pkg/douyin/coupon.go`
- **.DoWithPath()** (2 connections) — `backend/pkg/meituan/client.go`
- **.ReverseCoupon()** (2 connections) — `backend/pkg/payment/factory.go`
- **NewPaymentProvider()** (2 connections) — `backend/pkg/payment/factory.go`
- *... and 25 more nodes in this community*

## Relationships

- No strong cross-community connections detected

## Source Files

- `backend/internal/handler/douyin.go`
- `backend/pkg/alipay/bill.go`
- `backend/pkg/alipay/client.go`
- `backend/pkg/alipay/refund.go`
- `backend/pkg/alipay/trade.go`
- `backend/pkg/alipay/transfer.go`
- `backend/pkg/douyin/client.go`
- `backend/pkg/douyin/coupon.go`
- `backend/pkg/douyin/oauth.go`
- `backend/pkg/douyin/order.go`
- `backend/pkg/meituan/client.go`
- `backend/pkg/meituan/coupon.go`
- `backend/pkg/meituan/oauth.go`
- `backend/pkg/meituan/order.go`
- `backend/pkg/payment/factory.go`
- `backend/pkg/payment/provider_test.go`
- `backend/pkg/wechat/bill.go`
- `backend/pkg/wechat/order.go`
- `backend/pkg/wechat/refund.go`

## Audit Trail

- EXTRACTED: 142 (97%)
- INFERRED: 4 (3%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*