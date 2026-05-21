---
type: community
cohesion: 0.05
members: 57
---

# payment_provider_test_testnewverificationproviderunsupported

**Cohesion:** 0.05 - loosely connected
**Members:** 57 nodes

## Members
- [[.ApplyTradeBill()]] - code - backend/pkg/wechat/bill.go
- [[.BuildAuthURL()]] - code - backend/pkg/douyin/oauth.go
- [[.CloseOrder()]] - code - backend/pkg/wechat/order.go
- [[.ConsumeCoupon()]] - code - backend/pkg/meituan/coupon.go
- [[.CreateJSAPIOrder()]] - code - backend/pkg/wechat/order.go
- [[.CreateNativeOrder()]] - code - backend/pkg/wechat/order.go
- [[.Do()]] - code - backend/pkg/alipay/client.go
- [[.DoWithPath()]] - code - backend/pkg/meituan/client.go
- [[.Get()]] - code - backend/pkg/douyin/client.go
- [[.GetAccessToken()]] - code - backend/pkg/douyin/oauth.go
- [[.PrepareCertificate()]] - code - backend/pkg/douyin/coupon.go
- [[.PrepareCoupon()]] - code - backend/pkg/meituan/coupon.go
- [[.QueryBillURL()]] - code - backend/pkg/alipay/bill.go
- [[.QueryOrder()]] - code - backend/pkg/douyin/order.go
- [[.QueryOrderByOutTradeNo()]] - code - backend/pkg/wechat/order.go
- [[.QueryRefund()]] - code - backend/pkg/wechat/refund.go
- [[.QueryVerifyHistory()]] - code - backend/pkg/meituan/order.go
- [[.RefreshAccessToken()]] - code - backend/pkg/douyin/oauth.go
- [[.RefreshToken()]] - code - backend/pkg/meituan/oauth.go
- [[.ReverseConsume()]] - code - backend/pkg/meituan/coupon.go
- [[.ReverseCoupon()]] - code - backend/pkg/payment/factory.go
- [[.ReverseVerify()]] - code - backend/pkg/douyin/coupon.go
- [[.Sign()]] - code - backend/pkg/alipay/client.go
- [[.TradeClose()]] - code - backend/pkg/alipay/trade.go
- [[.TradePay()]] - code - backend/pkg/alipay/trade.go
- [[.TradeQuery()]] - code - backend/pkg/alipay/trade.go
- [[.TradeRefund()]] - code - backend/pkg/alipay/refund.go
- [[.Transfer()]] - code - backend/pkg/alipay/transfer.go
- [[.VerifyCertificate()]] - code - backend/pkg/douyin/coupon.go
- [[.VerifyThirdPartyCoupon()]] - code - backend/pkg/douyin/coupon.go
- [[AlipayProvider]] - code - backend/pkg/payment/factory.go
- [[Client]] - code - backend/pkg/alipay/trade.go
- [[DouyinProvider]] - code - backend/pkg/payment/factory.go
- [[MeituanProvider]] - code - backend/pkg/payment/factory.go
- [[NewClient()]] - code - backend/pkg/alipay/client.go
- [[NewPaymentProvider()]] - code - backend/pkg/payment/factory.go
- [[PayeeInfo]] - code - backend/pkg/alipay/transfer.go
- [[PlatformConfig]] - code - backend/pkg/payment/factory.go
- [[PlatformConfigProvider]] - code - backend/pkg/payment/factory.go
- [[REFUNDS]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[TestCreateOrderRequest()]] - code - backend/pkg/payment/provider_test.go
- [[TestNewPaymentProviderUnsupported()]] - code - backend/pkg/payment/provider_test.go
- [[TestNewVerificationProviderDouyin()]] - code - backend/pkg/payment/provider_test.go
- [[TestNewVerificationProviderMeituan()]] - code - backend/pkg/payment/provider_test.go
- [[TestNewVerificationProviderUnsupported()]] - code - backend/pkg/payment/provider_test.go
- [[TestPlatformConstants()]] - code - backend/pkg/payment/provider_test.go
- [[TestVerifyRequest()]] - code - backend/pkg/payment/provider_test.go
- [[TradePayRequest]] - code - backend/pkg/alipay/trade.go
- [[TradePayResponse]] - code - backend/pkg/alipay/trade.go
- [[TradePrecreateRequest]] - code - backend/pkg/alipay/trade.go
- [[TradePrecreateResponse]] - code - backend/pkg/alipay/trade.go
- [[TransferRequest]] - code - backend/pkg/alipay/transfer.go
- [[VerificationProvider]] - code - backend/pkg/payment/provider.go
- [[WechatProvider]] - code - backend/pkg/payment/factory.go
- [[factory.go]] - code - backend/pkg/payment/factory.go
- [[provider_test.go]] - code - backend/pkg/payment/provider_test.go
- [[trade.go]] - code - backend/pkg/alipay/trade.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/payment_provider_test_testnewverificationproviderunsupported
SORT file.name ASC
```

## Connections to other communities
- 4 edges to [[_COMMUNITY_service_douyinservice_querycouponfromplatform]]
- 2 edges to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 1 edge to [[_COMMUNITY_yfsc_platform_v2_meituan_assets_pc_data_js]]
- 1 edge to [[_COMMUNITY_mini_merchant_pages_finance_finance_js]]
- 1 edge to [[_COMMUNITY_backend_pkg_payment_provider_go]]

## Top bridge nodes
- [[REFUNDS]] - degree 6, connects to 3 communities
- [[Client]] - degree 33, connects to 2 communities
- [[DouyinProvider]] - degree 5, connects to 1 community
- [[MeituanProvider]] - degree 5, connects to 1 community
- [[VerificationProvider]] - degree 5, connects to 1 community