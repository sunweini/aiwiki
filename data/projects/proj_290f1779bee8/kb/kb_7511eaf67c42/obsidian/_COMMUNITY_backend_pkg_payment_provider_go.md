---
type: community
cohesion: 0.09
members: 24
---

# backend_pkg_payment_provider_go

**Cohesion:** 0.09 - loosely connected
**Members:** 24 nodes

## Members
- [[CertificateInfo]] - code - backend/pkg/douyin/coupon.go
- [[ConsumeRequest]] - code - backend/pkg/meituan/coupon.go
- [[ConsumeResponse]] - code - backend/pkg/meituan/coupon.go
- [[ConsumeResult]] - code - backend/pkg/meituan/coupon.go
- [[CouponInfo]] - code - backend/pkg/payment/provider.go
- [[CreateOrderRequest]] - code - backend/pkg/payment/provider.go
- [[CreateOrderResponse]] - code - backend/pkg/payment/provider.go
- [[ExtraInfo]] - code - backend/pkg/douyin/coupon.go
- [[OrderStatus]] - code - backend/pkg/payment/provider.go
- [[PaymentProvider]] - code - backend/pkg/payment/provider.go
- [[PrepareRequest]] - code - backend/pkg/douyin/coupon.go
- [[PrepareResponse]] - code - backend/pkg/douyin/coupon.go
- [[RefundAmount]] - code - backend/pkg/wechat/refund.go
- [[RefundRecord]] - code - backend/internal/model/refund.go
- [[RefundRequest]] - code - backend/pkg/alipay/refund.go
- [[RefundResponse]] - code - backend/pkg/payment/provider.go
- [[RefundStatus]] - code - backend/pkg/payment/provider.go
- [[VerifyRecord]] - code - backend/pkg/payment/provider.go
- [[VerifyRequest]] - code - backend/pkg/douyin/coupon.go
- [[VerifyResponse]] - code - backend/pkg/douyin/coupon.go
- [[VerifyResult]] - code - backend/pkg/douyin/coupon.go
- [[coupon.go]] - code - backend/pkg/douyin/coupon.go
- [[provider.go]] - code - backend/pkg/payment/provider.go
- [[refund.go]] - code - backend/pkg/alipay/refund.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/backend_pkg_payment_provider_go
SORT file.name ASC
```

## Connections to other communities
- 2 edges to [[_COMMUNITY_middleware_rbac_requirepermission]]
- 1 edge to [[_COMMUNITY_backend_internal_model_shop_type_go]]
- 1 edge to [[_COMMUNITY_payment_provider_test_testnewverificationproviderunsupported]]

## Top bridge nodes
- [[coupon.go]] - degree 13, connects to 1 community
- [[provider.go]] - degree 12, connects to 1 community
- [[RefundRecord]] - degree 2, connects to 1 community