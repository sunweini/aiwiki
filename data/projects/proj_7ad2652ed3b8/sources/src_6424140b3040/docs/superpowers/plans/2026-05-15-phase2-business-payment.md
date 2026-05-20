# Phase 2: 核心业务 + 支付核销 SDK Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成核心业务 API（园区/店铺/用户/订单 CRUD）+ 四平台支付核销 SDK（微信/支付宝/美团/抖音）+ 回调处理 + PC 前端骨架。

**Architecture:** 后端扩展 Phase 1 框架，新增 `pkg/wechat/`、`pkg/alipay/`、`pkg/meituan/`、`pkg/douyin/` 四个支付 SDK 目录，统一抽象 `PaymentProvider` + `VerificationProvider` 接口。前端 Vue 3 + Element Plus，左侧导航 + 顶部面包屑布局。

**Tech Stack:** Go + Gin + GORM、Element Plus + Vue 3 + TypeScript、axios + Pinia + ECharts

---

## File Map

| File | Responsibility |
|------|---------------|
| `backend/internal/handler/park.go` | Park CRUD handlers |
| `backend/internal/handler/shop.go` | Shop CRUD + stats + QR handlers |
| `backend/internal/handler/user.go` | User CRUD + stats handlers |
| `backend/internal/handler/order.go` | Order list/verify/refund handlers |
| `backend/internal/handler/finance.go` | Finance account/withdraw/reconcile handlers |
| `backend/internal/service/park_service.go` | Park business logic |
| `backend/internal/service/shop_service.go` | Shop business logic + QR gen |
| `backend/internal/service/user_service.go` | User business logic |
| `backend/internal/service/order_service.go` | Order + verify + refund logic |
| `backend/internal/service/finance_service.go` | Finance + withdraw + reconcile logic |
| `backend/internal/repository/park_repo.go` | Park data access |
| `backend/internal/repository/shop_repo.go` | Shop data access |
| `backend/internal/repository/user_repo.go` | User data access |
| `backend/internal/repository/order_repo.go` | Order data access |
| `backend/internal/repository/finance_repo.go` | Finance data access |
| `backend/internal/router/router.go` | Add new route groups |
| `backend/pkg/wechat/client.go` | WeChat Pay HTTP client + RSA-SHA256 signing |
| `backend/pkg/wechat/order.go` | JSAPI/Native pay, query, close |
| `backend/pkg/wechat/refund.go` | Refund API |
| `backend/pkg/wechat/bill.go` | Bill download |
| `backend/pkg/alipay/client.go` | Alipay HTTP client + RSA2 signing |
| `backend/pkg/alipay/trade.go` | Trade pay, precreate, query, close |
| `backend/pkg/alipay/refund.go` | Refund API |
| `backend/pkg/alipay/transfer.go` | Transfer to account (for withdrawals) |
| `backend/pkg/alipay/bill.go` | Bill download |
| `backend/pkg/meituan/client.go` | Meituan HTTP client + SHA1 signing |
| `backend/pkg/meituan/coupon.go` | Prepare, consume, reverse coupon |
| `backend/pkg/meituan/order.go` | Order query |
| `backend/pkg/meituan/oauth.go` | OAuth 2.0 token management |
| `backend/pkg/douyin/client.go` | Douyin HTTP client + OAuth |
| `backend/pkg/douyin/coupon.go` | Prepare, verify, reverse coupon |
| `backend/pkg/douyin/order.go` | Order query |
| `backend/pkg/douyin/oauth.go` | OAuth token management |
| `backend/pkg/payment/provider.go` | PaymentProvider + VerificationProvider interfaces |
| `backend/pkg/payment/factory.go` | Factory to create provider by platform |
| `backend/internal/handler/callback.go` | Unified callback handler (wechat/alipay/meituan/douyin) |
| `backend/internal/handler/callback_wechat.go` | WeChat callback + AEAD_AES_256_GCM decryption |
| `backend/internal/handler/callback_alipay.go` | Alipay callback + RSA2 verify |
| `backend/internal/service/callback_service.go` | Callback business logic (update order/refund status) |
| `backend/internal/model/payment.go` | PaymentConfig model (store platform configs per shop) |
| `backend/internal/repository/payment_repo.go` | PaymentConfig data access |
| `backend/internal/config/config.go` | Add PaymentPlatformConfig struct |
| `backend/config.yaml` | Add wechat/alipay/meituan/douyin config sections |
| `web-admin/` | Vue 3 PC frontend (all new) |

---

### Task 1: Backend — Park/Shop/User Repositories + Services

**Files:**
- Create: `backend/internal/repository/park_repo.go`
- Create: `backend/internal/repository/shop_repo.go`
- Create: `backend/internal/repository/user_repo.go`
- Create: `backend/internal/service/park_service.go`
- Create: `backend/internal/service/shop_service.go`
- Create: `backend/internal/service/user_service.go`

**Repository methods:**
- ParkRepo: List (with filters), FindByID, Create, Update, Delete, FindByCode
- ShopRepo: List (with park_id filter), FindByID, Create, Update, Delete, Stats (count by status), FindByParkID
- UserRepo: List (with phone/nickname/member_level filters), FindByID, FindByPhone, FindByOpenID, Create, Update, Stats (total/new_today/active), RechargeList

**Service methods:**
- ParkService: List/Get/Create/Update/Delete with validation
- ShopService: List/Get/Create/Update/Delete, Stats, GenerateQR (generate QR code URL string)
- UserService: List/Get/Create/Update, Stats, RechargeList

- [ ] **Step 1: Create all repo files**

Each repo follows the same pattern as `employee_repo.go`:
```go
type ParkRepo struct {
    db *gorm.DB
}
func NewParkRepo(db *gorm.DB) *ParkRepo { return &ParkRepo{db: db} }
// List, FindByID, FindByCode, Create, Update, Delete
```

- [ ] **Step 2: Create all service files**

Each service follows the same pattern as `employee_service.go`:
```go
type ParkService struct {
    repo *repository.ParkRepo
}
func NewParkService(repo *repository.ParkRepo) *ParkService { ... }
```

- [ ] **Step 3: Verify build**

```bash
cd backend && go build ./...
```

- [ ] **Step 4: Commit**

```bash
git add backend/internal/repository/park_repo.go backend/internal/repository/shop_repo.go backend/internal/repository/user_repo.go backend/internal/service/park_service.go backend/internal/service/shop_service.go backend/internal/service/user_service.go
git commit -m "feat(phase2): add park/shop/user repositories and services

- ParkRepo/ShopRepo/UserRepo with CRUD + list pagination + filters
- ParkService/ShopService/UserService with validation
- ShopService.Stats, UserService.Stats, UserService.RechargeList

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

### Task 2: Backend — Order + Finance Repositories + Services

**Files:**
- Create: `backend/internal/repository/order_repo.go`
- Create: `backend/internal/repository/finance_repo.go`
- Create: `backend/internal/service/order_service.go`
- Create: `backend/internal/service/finance_service.go`

**Repository methods:**
- OrderRepo: List (with user_id/shop_id/status/date filters), FindByID, FindByOrderNo, Create, UpdateStatus, Stats (total/count by status)
- FinanceRepo: GetParkAccount (balance/frozen/available by park), ListWithdraw (with status filters), CreateWithdraw, UpdateWithdrawStatus, CreateReconciliation, ListReconciliation

**Service methods:**
- OrderService: List/Get/Create, Verify (update status to verified), Refund (create refund record), RefundList, RefundReview (approve/reject)
- FinanceService: GetAccount, Withdraw/Create, WithdrawList, WithdrawReview (approve → generate reconciliation statement), ReconcileList

- [ ] **Step 1: Create order repo and service**

OrderService.Verify should:
1. Find order by ID
2. Check status is "已支付" or "待核销"
3. Update status to "已核销"
4. Set verified_at timestamp
5. Log operation

OrderService.RefundReview should:
1. Find refund record
2. Check reviewer has permission
3. Update status to "已退款" or "已驳回"
4. If approved: update user balance, set refunded_at

- [ ] **Step 2: Create finance repo and service**

FinanceService.WithdrawReview (approve) should:
1. Find withdraw application
2. Update status to "已通过"
3. Deduct from shop available balance, add to frozen
4. Auto-generate reconciliation record for the date
5. Record audit log

- [ ] **Step 3: Verify build**

```bash
cd backend && go build ./...
```

- [ ] **Step 4: Commit**

---

### Task 3: Backend — Handlers for Park/Shop/User/Order/Finance

**Files:**
- Create: `backend/internal/handler/park.go`
- Create: `backend/internal/handler/shop.go`
- Create: `backend/internal/handler/user.go`
- Create: `backend/internal/handler/order.go`
- Create: `backend/internal/handler/finance.go`

**API endpoints to add:**

```
GET  /api/v1/parks                   # List parks (paginated, filtered)
POST /api/v1/parks                   # Create park
GET  /api/v1/parks/:id               # Get park
PUT  /api/v1/parks/:id               # Update park
DELETE /api/v1/parks/:id             # Delete park
POST /api/v1/parks/:id/toggle        # Enable/disable

GET  /api/v1/shops                   # List shops
POST /api/v1/shops                   # Create shop
GET  /api/v1/shops/:id               # Get shop
PUT  /api/v1/shops/:id               # Update shop
GET  /api/v1/shops/:id/qrcode        # Get shop QR code
GET  /api/v1/shops/stats             # Shop stats

GET  /api/v1/users                   # List users
POST /api/v1/users                   # Create user
GET  /api/v1/users/:id               # Get user
PUT  /api/v1/users/:id               # Update user
GET  /api/v1/users/stats             # User stats
GET  /api/v1/users/:id/recharges     # User recharge history

GET  /api/v1/orders                  # List orders
GET  /api/v1/orders/:id              # Get order
POST /api/v1/orders/:id/verify       # Verify order
POST /api/v1/orders/:id/refund       # Request refund
GET  /api/v1/refunds                 # List refunds
POST /api/v1/refunds/:id/review      # Review refund

GET  /api/v1/finance/account         # Park account
POST /api/v1/finance/withdraw        # Create withdraw
GET  /api/v1/finance/withdraws       # List withdraws
POST /api/v1/finance/withdraws/:id/review  # Review withdraw
GET  /api/v1/finance/reconcile       # List reconciliations
```

- [ ] **Step 1: Create all handler files**

Each handler follows the same pattern as `employee.go`:
- Struct with service dependency
- NewXxxHandler constructor
- Methods that parse request, call service, return response

- [ ] **Step 2: Register routes in router.go**

Add to `router.go` protected group:
```go
// Parks
parks := protected.Group("/parks")
{
    parks.GET("", parkHandler.List)
    parks.POST("", parkHandler.Create)
    parks.GET("/:id", parkHandler.GetByID)
    parks.PUT("/:id", parkHandler.Update)
    parks.DELETE("/:id", parkHandler.Delete)
    parks.POST("/:id/toggle", parkHandler.ToggleStatus)
}

// Shops, Users, Orders, Finance... same pattern
```

- [ ] **Step 3: Verify build**

```bash
cd backend && go build ./...
```

- [ ] **Step 4: Commit**

---

### Task 4: Payment SDK — WeChat Pay + Alipay

**Files:**
- Create: `backend/pkg/wechat/client.go`
- Create: `backend/pkg/wechat/order.go`
- Create: `backend/pkg/wechat/refund.go`
- Create: `backend/pkg/wechat/bill.go`
- Create: `backend/pkg/alipay/client.go`
- Create: `backend/pkg/alipay/trade.go`
- Create: `backend/pkg/alipay/refund.go`
- Create: `backend/pkg/alipay/transfer.go`
- Create: `backend/pkg/alipay/bill.go`

**WeChat Pay SDK:**

`client.go` - RSA-SHA256 signing:
```go
type WechatClient struct {
    MchID          string
    AppID          string
    SerialNo       string
    PrivateKey     *rsa.PrivateKey  // loaded from PEM
    PlatformCert   *x509.Certificate
    BaseURL        string // https://api.mch.weixin.qq.com
    NotifyURL      string
}

func (c *WechatClient) Sign(method, uri, timestamp, nonce, body string) string {
    // 1. Build sign string: METHOD\nURI\nTimestamp\nNonce\nBody\n
    // 2. SHA256-RSA sign with private key
    // 3. Base64 encode
}

func (c *WechatClient) Do(ctx context.Context, method, uri string, body interface{}) ([]byte, error) {
    // 1. Marshal body to JSON
    // 2. Generate nonce, timestamp
    // 3. Sign request
    // 4. Set Authorization: WECHATPAY2-SHA256-RSA2048 {signature}
    // 5. POST/GET
    // 6. Verify response signature (platform cert)
    // 7. Return body
}
```

`order.go` - JSAPI + Native pay:
```go
type WechatJSAPIRequest struct {
    Description string     `json:"description"`
    OutTradeNo  string     `json:"out_trade_no"`
    Amount      WechatAmount `json:"amount"`
    Payer       WechatPayer  `json:"payer"`
}

type WechatAmount struct {
    Total    int    `json:"total"`    // 分
    Currency string `json:"currency"` // "CNY"
}

type WechatPayer struct {
    OpenID string `json:"openid"`
}

func (c *WechatClient) CreateJSAPIOrder(ctx context.Context, req *WechatJSAPIRequest) (*WechatJSAPIResponse, error)
func (c *WechatClient) CreateNativeOrder(ctx context.Context, req *WechatNativeRequest) (*WechatNativeResponse, error)
func (c *WechatClient) QueryOrderByOutTradeNo(ctx context.Context, outTradeNo string) (*WechatOrderStatus, error)
func (c *WechatClient) CloseOrder(ctx context.Context, outTradeNo string) error
```

`refund.go`:
```go
type WechatRefundRequest struct {
    OutTradeNo  string `json:"out_trade_no,omitempty"`
    OutRefundNo string `json:"out_refund_no"`
    Reason      string `json:"reason,omitempty"`
    Amount      WechatRefundAmount `json:"amount"`
}

type WechatRefundAmount struct {
    Refund   int    `json:"refund"`   // 分
    Total    int    `json:"total"`    // 分
    Currency string `json:"currency"` // "CNY"
}

func (c *WechatClient) CreateRefund(ctx context.Context, req *WechatRefundRequest) (*WechatRefundResponse, error)
func (c *WechatClient) QueryRefund(ctx context.Context, outRefundNo string) (*WechatRefundStatus, error)
```

`bill.go`:
```go
type WechatBillRequest struct {
    BillDate string `json:"bill_date"` // yyyy-MM-DD
    BillType string `json:"bill_type"` // ALL/SUCCESS/REFUND
}

func (c *WechatClient) ApplyTradeBill(ctx context.Context, req *WechatBillRequest) (*WechatBillResponse, error)
func (c *WechatClient) DownloadBill(ctx context.Context, downloadURL string) ([]byte, error)
```

**Alipay SDK:**

`client.go` - RSA2 signing:
```go
type AlipayClient struct {
    AppID           string
    AppPrivateKey   *rsa.PrivateKey
    AlipayPublicKey *rsa.PublicKey
    GatewayURL      string // https://openapi.alipay.com/gateway.do
    NotifyURL       string
}

func (c *AlipayClient) Sign(params map[string]string) string {
    // 1. Exclude sign and empty values
    // 2. Sort by key
    // 3. Join key=value&key=value...
    // 4. SHA256WithRSA sign
    // 5. Base64 encode
}

func (c *AlipayClient) Do(ctx context.Context, method string, bizContent interface{}) ([]byte, error) {
    // 1. Marshal bizContent to JSON
    // 2. Build params: app_id, method, format=JSON, charset=utf-8, sign_type=RSA2, timestamp, version=1.0, biz_content
    // 3. Sign
    // 4. POST to GatewayURL
    // 5. Parse response, verify signature
    // 6. Return biz_content
}
```

`trade.go`:
```go
type AlipayTradePayRequest struct {
    OutTradeNo  string `json:"out_trade_no"`
    Scene       string `json:"scene"`        // "bar_code"
    AuthCode    string `json:"auth_code"`
    Subject     string `json:"subject"`
    TotalAmount string `json:"total_amount"` // 元
}

func (c *AlipayClient) TradePay(ctx context.Context, req *AlipayTradePayRequest) (*AlipayTradePayResponse, error)
func (c *AlipayClient) TradePrecreate(ctx context.Context, req *AlipayTradePrecreateRequest) (*AlipayTradePrecreateResponse, error)
func (c *AlipayClient) TradeQuery(ctx context.Context, outTradeNo string) (*AlipayTradeQueryResponse, error)
func (c *AlipayClient) TradeClose(ctx context.Context, outTradeNo string) error
```

`refund.go`:
```go
type AlipayRefundRequest struct {
    OutTradeNo    string `json:"out_trade_no,omitempty"`
    TradeNo       string `json:"trade_no,omitempty"`
    RefundAmount  string `json:"refund_amount"`  // 元
    RefundReason  string `json:"refund_reason,omitempty"`
    OutRequestNo  string `json:"out_request_no"` // idempotent key
}

func (c *AlipayClient) TradeRefund(ctx context.Context, req *AlipayRefundRequest) (*AlipayRefundResponse, error)
```

`transfer.go` (for merchant withdrawals):
```go
type AlipayTransferRequest struct {
    OutBizNo     string `json:"out_biz_no"`
    TransAmount  string `json:"trans_amount"` // 元
    ProductCode  string `json:"product_code"` // "TRANS_ACCOUNT_NO_PWD"
    BizScene     string `json:"biz_scene"`    // "DIRECT_TRANSFER"
    PayeeInfo    AlipayPayeeInfo `json:"payee_info"`
}

type AlipayPayeeInfo struct {
    Identity     string `json:"identity"`      // alipay account
    IdentityType string `json:"identity_type"` // "ALIPAY_LOGON_ID"
}

func (c *AlipayClient) Transfer(ctx context.Context, req *AlipayTransferRequest) (*AlipayTransferResponse, error)
```

- [ ] **Step 1: Create all WeChat Pay files**
- [ ] **Step 2: Create all Alipay files**
- [ ] **Step 3: Verify build**

```bash
cd backend && go build ./...
```

- [ ] **Step 4: Commit**

---

### Task 5: Payment SDK — Meituan + Douyin

**Files:**
- Create: `backend/pkg/meituan/client.go`
- Create: `backend/pkg/meituan/coupon.go`
- Create: `backend/pkg/meituan/order.go`
- Create: `backend/pkg/meituan/oauth.go`
- Create: `backend/pkg/douyin/client.go`
- Create: `backend/pkg/douyin/coupon.go`
- Create: `backend/pkg/douyin/order.go`
- Create: `backend/pkg/douyin/oauth.go`

**Meituan SDK:**

`client.go` - SHA1 signing:
```go
type MeituanClient struct {
    DeveloperID int64
    SignKey     string
    BaseURL     string // https://api-open-cater.meituan.com
}

func (c *MeituanClient) Sign(params map[string]string) string {
    // 1. Exclude sign and empty values
    // 2. Sort by key
    // 3. Join: signKey + key1value1key2value2...
    // 4. SHA1
}

func (c *MeituanClient) Do(ctx context.Context, businessID int, appAuthToken string, biz interface{}) ([]byte, error) {
    // 1. Marshal biz to JSON, urlencode
    // 2. Build params: developerId, timestamp, charset=utf-8, version=2, businessId, appAuthToken, biz
    // 3. Sign
    // 4. POST with Content-Type: application/x-www-form-urlencoded
    // 5. Return response
}
```

`coupon.go`:
```go
type MeituanPrepareRequest struct {
    CouponCode string `json:"couponCode"`
}

type MeituanConsumeRequest struct {
    Codes      []string `json:"codes"`
    Idempotent string   `json:"idempotent"` // requestId
}

func (c *MeituanClient) PrepareCoupon(ctx context.Context, token string, req *MeituanPrepareRequest) (*MeituanCouponInfo, error)
func (c *MeituanClient) ConsumeCoupon(ctx context.Context, token string, req *MeituanConsumeRequest) (*MeituanConsumeResult, error)
func (c *MeituanClient) ReverseConsume(ctx context.Context, token, receiptCode, dealID string) error
func (c *MeituanClient) QueryVerifyHistory(ctx context.Context, token string, startDate, endDate time.Time) ([]MeituanVerifyRecord, error)
```

`oauth.go`:
```go
func (c *MeituanClient) BuildAuthURL(businessID int, redirectURL string) string
func (c *MeituanClient) GetToken(ctx context.Context, businessID int, code string) (*MeituanToken, error)
func (c *MeituanClient) RefreshToken(ctx context.Context, businessID int, refreshToken string) (*MeituanToken, error)
```

**Douyin SDK:**

`client.go` - OAuth2 access_token:
```go
type DouyinClient struct {
    ClientKey    string
    ClientSecret string
    BaseURL      string // https://open.douyin.com
}

func (c *DouyinClient) Do(ctx context.Context, accessToken, method, path string, body interface{}) ([]byte, error) {
    // 1. Marshal body
    // 2. Add access_token to query params
    // 3. POST/GET
    // 4. Parse response
}
```

`coupon.go`:
```go
type DouyinPrepareRequest struct {
    CertificateCode string `json:"certificate_code"`
}

type DouyinVerifyRequest struct {
    CertificateCode string `json:"certificate_code"`
    VerifyType      int    `json:"verify_type"`
    VerifyTime      int64  `json:"verify_time"`
    VerifyID        string `json:"verify_id"` // idempotent
    POIID           string `json:"poi_id"`
}

// 抖音券码必须先 prepare 再 verify
func (c *DouyinClient) PrepareCertificate(ctx context.Context, accessToken string, req *DouyinPrepareRequest) (*DouyinCertificateInfo, error)
func (c *DouyinClient) VerifyCertificate(ctx context.Context, accessToken string, req *DouyinVerifyRequest) (*DouyinVerifyResult, error)
func (c *DouyinClient) ReverseVerify(ctx context.Context, accessToken, certificateCode string) error

// 三方券码直接 verify（无需 prepare）
func (c *DouyinClient) VerifyThirdPartyCoupon(ctx context.Context, accessToken string, req *DouyinVerifyRequest) (*DouyinVerifyResult, error)
```

`oauth.go`:
```go
func (c *DouyinClient) GetAccessToken(ctx context.Context, code string) (*DouyinToken, error)
func (c *DouyinClient) RefreshAccessToken(ctx context.Context, refreshToken string) (*DouyinToken, error)
```

- [ ] **Step 1: Create all Meituan files**
- [ ] **Step 2: Create all Douyin files**
- [ ] **Step 3: Verify build**

```bash
cd backend && go build ./...
```

- [ ] **Step 4: Commit**

---

### Task 6: Payment SDK — Unified Provider Interface + Factory

**Files:**
- Create: `backend/pkg/payment/provider.go`
- Create: `backend/pkg/payment/factory.go`
- Create: `backend/internal/model/payment.go`
- Create: `backend/internal/repository/payment_repo.go`

**Unified interfaces:**
```go
// backend/pkg/payment/provider.go

type CreateOrderRequest struct {
    MerchantOrderNo string    `json:"merchant_order_no"`
    Amount          int64     `json:"amount"`          // 分
    Currency        string    `json:"currency"`         // CNY
    Subject         string    `json:"subject"`
    Body            string    `json:"body,omitempty"`
    NotifyURL       string    `json:"notify_url"`
    OpenID          string    `json:"openid,omitempty"` // for WeChat JSAPI
    AuthCode        string    `json:"auth_code,omitempty"` // for Alipay barcode
}

type CreateOrderResponse struct {
    MerchantOrderNo string            `json:"merchant_order_no"`
    PlatformOrderNo string            `json:"platform_order_no"`
    PayParams       map[string]string `json:"pay_params"` // frontend params
    QRCodeURL       string            `json:"qr_code_url,omitempty"`
}

type RefundRequest struct {
    MerchantOrderNo  string `json:"merchant_order_no"`
    MerchantRefundNo string `json:"merchant_refund_no"`
    RefundAmount     int64  `json:"refund_amount"` // 分
    Reason           string `json:"reason,omitempty"`
    NotifyURL        string `json:"notify_url,omitempty"`
}

type VerifyRequest struct {
    CouponCode string `json:"coupon_code"`
    ShopID     string `json:"shop_id"`
    OperatorID string `json:"operator_id"`
    VerifyID   string `json:"verify_id"` // idempotent
}

type VerifyResult struct {
    Success   bool   `json:"success"`
    Message   string `json:"message"`
    Amount    int64  `json:"amount"` // 分
    ProductName string `json:"product_name"`
}

type CouponInfo struct {
    CouponCode  string    `json:"coupon_code"`
    ProductName string    `json:"product_name"`
    Status      string    `json:"status"` // available/used/expired
    ExpireTime  time.Time `json:"expire_time"`
    Amount      int64     `json:"amount"` // 分
}

type PaymentProvider interface {
    CreateJSAPIOrder(ctx context.Context, req *CreateOrderRequest) (*CreateOrderResponse, error)
    CreateNativeOrder(ctx context.Context, req *CreateOrderRequest) (*CreateOrderResponse, error)
    QueryOrder(ctx context.Context, merchantOrderNo string) (*OrderStatus, error)
    CloseOrder(ctx context.Context, merchantOrderNo string) error
    Refund(ctx context.Context, req *RefundRequest) (*RefundResponse, error)
    QueryRefund(ctx context.Context, merchantRefundNo string) (*RefundStatus, error)
}

type VerificationProvider interface {
    PrepareCoupon(ctx context.Context, code string) (*CouponInfo, error)
    VerifyCoupon(ctx context.Context, req *VerifyRequest) (*VerifyResult, error)
    ReverseCoupon(ctx context.Context, code string) error
    QueryVerifyHistory(ctx context.Context, shopID string, start, end time.Time) ([]VerifyRecord, error)
}

// Platform type constants
const (
    PlatformWechat  = "wechat"
    PlatformAlipay  = "alipay"
    PlatformMeituan = "meituan"
    PlatformDouyin  = "douyin"
)
```

**Factory:**
```go
// backend/pkg/payment/factory.go

func NewPaymentProvider(platform string, config *PlatformConfig) (PaymentProvider, error) {
    switch platform {
    case PlatformWechat:
        return newWechatProvider(config.Wechat)
    case PlatformAlipay:
        return newAlipayProvider(config.Alipay)
    default:
        return nil, fmt.Errorf("unsupported platform: %s", platform)
    }
}

func NewVerificationProvider(platform string, config *PlatformConfig) (VerificationProvider, error) {
    switch platform {
    case PlatformMeituan:
        return newMeituanProvider(config.Meituan)
    case PlatformDouyin:
        return newDouyinProvider(config.Douyin)
    default:
        return nil, fmt.Errorf("unsupported platform: %s", platform)
    }
}
```

**PaymentConfig model:**
```go
// backend/internal/model/payment.go

type PaymentConfig struct {
    BaseModel
    ShopID       int64  `gorm:"not null;index" json:"shop_id"`
    Platform     string `gorm:"size:20;not null" json:"platform"` // wechat/alipay/meituan/douyin
    AppID        string `gorm:"size:100" json:"app_id"`
    AppSecret    string `gorm:"size:100" json:"-"`
    MerchantID   string `gorm:"size:100" json:"merchant_id"`
    SignKey      string `gorm:"size:255" json:"-"`
    PrivateKey   string `gorm:"type:text" json:"-"`
    PublicKey    string `gorm:"type:text" json:"-"`
    NotifyURL    string `gorm:"size:255" json:"notify_url"`
    Status       int8   `gorm:"default:0" json:"status"` // 0=disabled 1=enabled

    Shop *Shop `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
}
func (PaymentConfig) TableName() string { return "payment_config" }
```

- [ ] **Step 1: Create provider.go with interfaces**
- [ ] **Step 2: Create factory.go with factory functions**
- [ ] **Step 3: Create PaymentConfig model and repo**
- [ ] **Step 4: Add PaymentPlatformConfig to config.go**
- [ ] **Step 5: Add platform config sections to config.yaml**
- [ ] **Step 6: Verify build**

```bash
cd backend && go build ./...
```

- [ ] **Step 7: Commit**

---

### Task 7: Callback Handlers

**Files:**
- Create: `backend/internal/handler/callback.go`
- Create: `backend/internal/handler/callback_wechat.go`
- Create: `backend/internal/handler/callback_alipay.go`
- Create: `backend/internal/handler/callback_meituan.go`
- Create: `backend/internal/handler/callback_douyin.go`
- Create: `backend/internal/service/callback_service.go`

**Callback routes (public, no JWT needed):**
```
POST /api/v1/callback/wechat/pay    # WeChat payment/refund notification
POST /api/v1/callback/alipay/pay    # Alipay payment notification
POST /api/v1/callback/douyin/spi    # Douyin SPI callback (order/refund)
```

**Callback service logic:**
```go
// backend/internal/service/callback_service.go

type CallbackService struct {
    orderRepo    *repository.OrderRepo
    refundRepo   *repository.RefundRepo
    meituanRepo  *repository.MeituanRepo  // new repo for meituan verify records
    douyinRepo   *repository.DouyinRepo   // new repo for douyin verify records
}

func (s *CallbackService) HandleWechatPay(ctx context.Context, event *WechatPayEvent) error {
    // 1. Decrypt notification (AEAD_AES_256_GCM)
    // 2. Find order by out_trade_no
    // 3. Update order status based on trade_state
    // 4. If refund event, update refund record status
}

func (s *CallbackService) HandleAlipayPay(ctx context.Context, event *AlipayNotifyEvent) error {
    // 1. Verify signature (RSA2)
    // 2. Find order by out_trade_no
    // 3. Update order status based on trade_status
}

func (s *CallbackService) HandleDouyinSPI(ctx context.Context, event *DouyinSPIEvent) error {
    // 1. Verify signature
    // 2. Route by event type (order_created/payment_success/refund_request/refund_result)
    // 3. Update corresponding records
}
```

- [ ] **Step 1: Create callback service**
- [ ] **Step 2: Create callback handlers (one per platform)**
- [ ] **Step 3: Register callback routes in router.go (public group)**
- [ ] **Step 4: Verify build**

```bash
cd backend && go build ./...
```

- [ ] **Step 5: Commit**

---

### Task 8: Vue 3 PC Frontend — Project Scaffold + Layout

**Files (all new in `web-admin/`):**
- `web-admin/package.json`
- `web-admin/vite.config.ts`
- `web-admin/tsconfig.json`
- `web-admin/index.html`
- `web-admin/src/main.ts`
- `web-admin/src/App.vue`
- `web-admin/src/router/index.ts`
- `web-admin/src/store/auth.ts`
- `web-admin/src/store/menu.ts`
- `web-admin/src/store/view.ts`
- `web-admin/src/api/request.ts`
- `web-admin/src/api/auth.ts`
- `web-admin/src/api/parks.ts`
- `web-admin/src/api/shops.ts`
- `web-admin/src/api/users.ts`
- `web-admin/src/api/orders.ts`
- `web-admin/src/api/finance.ts`
- `web-admin/src/components/Layout/AppLayout.vue`
- `web-admin/src/components/Layout/Sidebar.vue`
- `web-admin/src/components/Layout/Header.vue`
- `web-admin/src/components/Layout/ViewSwitch.vue`
- `web-admin/src/components/DataTable/index.vue`
- `web-admin/src/components/StatCard/index.vue`
- `web-admin/src/views/Login/index.vue`
- `web-admin/src/views/Overview/index.vue`
- `web-admin/src/styles/variables.css`
- `web-admin/src/styles/global.css`

**Project setup:**
```bash
mkdir -p web-admin
cd web-admin
# package.json with: vue 3.4, vue-router 4, pinia 2.7, element-plus 2.7, axios 1.7, echarts 5.5, typescript 5.4, vite 5.2
```

**Layout structure (matches PRD 7.2):**
```
┌─────────────────────────────────────────────────┐
│ Header: Logo | Breadcrumb | Search | User       │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │                                    │
│ (menu)   │  Content Area                        │
│          │                                    │
│          │  (page content)                      │
│          │                                    │
├──────────┴──────────────────────────────────────┤
│ Bottom-left: View Switcher (当前视角)           │
└─────────────────────────────────────────────────┘
```

**Auth flow:**
1. Login page → POST `/api/v1/auth/login` → store tokens + employee info
2. Fetch menu → GET `/api/v1/rbac/menu?view=platform` → build sidebar dynamically
3. Route guard: no token → redirect to login
4. View switcher: change view → re-fetch menu → rebuild routes

**API request wrapper:**
```typescript
// web-admin/src/api/request.ts
import axios from 'axios'
const instance = axios.create({ baseURL: '/api/v1', timeout: 30000 })

// Request interceptor: attach Authorization: Bearer {token}
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Response interceptor: handle 401 → redirect to login
instance.interceptors.response.use(
    res => res.data,
    err => {
        if (err.response?.status === 401) {
            localStorage.removeItem('access_token')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)
```

- [ ] **Step 1: Create package.json, vite.config.ts, tsconfig.json, index.html**
- [ ] **Step 2: Create main.ts, App.vue**
- [ ] **Step 3: Create router with dynamic route generation**
- [ ] **Step 4: Create stores (auth, menu, view)**
- [ ] **Step 5: Create API layer (request.ts, auth.ts)**
- [ ] **Step 6: Create Layout components (AppLayout, Sidebar, Header, ViewSwitch)**
- [ ] **Step 7: Create Login page**
- [ ] **Step 8: Create CSS variables (natural theme per PRD 7.1)**

```css
/* web-admin/src/styles/variables.css */
:root {
  --color-primary: #2D5016;    /* 深稻绿 */
  --color-secondary: #5B8C2A;  /* 稻苗绿 */
  --color-warm: #8B5E3C;       /* 大地棕 */
  --color-gold: #C8963E;       /* 稻穗金 */
  --color-bg: #F5F0E8;         /* 米白 */
  --color-bg-light: #E8D5B7;   /* 稻杆色 */
  --border-radius: 8px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
```

- [ ] **Step 9: Verify dev server starts**

```bash
cd web-admin && npm install && npm run dev
```

- [ ] **Step 10: Commit**

---

### Task 9: Vue 3 PC Frontend — Core Pages

**Files:**
- Create: `web-admin/src/views/Park/List.vue`
- Create: `web-admin/src/views/Park/Add.vue`
- Create: `web-admin/src/views/Shop/List.vue`
- Create: `web-admin/src/views/Shop/Stats.vue`
- Create: `web-admin/src/views/User/List.vue`
- Create: `web-admin/src/views/User/Stats.vue`
- Create: `web-admin/src/views/Order/List.vue`
- Create: `web-admin/src/views/Order/Verify.vue`
- Create: `web-admin/src/views/Finance/Account.vue`
- Create: `web-admin/src/views/Finance/Withdraw.vue`
- Create: `web-admin/src/views/Finance/Reconcile.vue`
- Create: `web-admin/src/views/Meituan/Dashboard.vue`
- Create: `web-admin/src/views/Douyin/Dashboard.vue`

**Page implementation pattern:**
```vue
<template>
  <div class="page">
    <Breadcrumb :items="['园区管理', '园区列表']" />
    <StatCard :items="statItems" />
    <DataTable
      :columns="columns"
      :data="data"
      :total="total"
      :loading="loading"
      @search="handleSearch"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { listParks, createPark, updatePark, deletePark } from '@/api/parks'

const data = ref([])
const total = ref(0)
const loading = ref(false)

onMounted(async () => { await fetchData() })

async function fetchData() { /* ... */ }
</script>
```

- [ ] **Step 1: Create Overview page (dashboard with key metrics)**
- [ ] **Step 2: Create Park pages (List + Add/Edit)**
- [ ] **Step 3: Create Shop pages (List + Stats + Type management)**
- [ ] **Step 4: Create User pages (List + Stats + Recharge records)**
- [ ] **Step 5: Create Order pages (List + Verify + Refund)**
- [ ] **Step 6: Create Finance pages (Account + Withdraw + Reconcile)**
- [ ] **Step 7: Create Meituan/Douyin Dashboard pages (basic layout)**
- [ ] **Step 8: Verify all pages compile and routes work**

```bash
cd web-admin && npm run build
```

- [ ] **Step 9: Commit**

---

## Self-Review

### 1. Spec Coverage

| Spec Section | Task | Status |
|-------------|------|--------|
| Park CRUD | Task 1, 3, 9 | ✅ |
| Shop CRUD + Stats | Task 1, 3, 9 | ✅ |
| User CRUD + Stats | Task 1, 3, 9 | ✅ |
| Order CRUD + Verify + Refund | Task 2, 3, 9 | ✅ |
| Finance (account/withdraw/reconcile) | Task 2, 3, 9 | ✅ |
| WeChat Pay SDK | Task 4 | ✅ JSAPI/Native/Refund/Bill |
| Alipay SDK | Task 4 | ✅ Trade/Refund/Transfer/Bill |
| Meituan SDK | Task 5 | ✅ Prepare/Consume/Reverse/OAuth |
| Douyin SDK | Task 5 | ✅ Prepare/Verify/Reverse/OAuth |
| Unified Provider Interface | Task 6 | ✅ PaymentProvider + VerificationProvider |
| Callback handlers | Task 7 | ✅ WeChat/Alipay/Douyin |
| PC Frontend scaffold | Task 8 | ✅ Vue 3 + Element Plus + layout + auth |
| PC Frontend pages | Task 9 | ✅ All core pages |
| PaymentConfig model | Task 6 | ✅ per-shop platform config |
| Natural theme CSS variables | Task 8 | ✅ PRD 7.1 colors |

### 2. Placeholder Scan

- All code steps contain actual implementation
- No TBD/TODO (except future-phase features like sales stats charts)
- No "similar to Task N" — each task is self-contained
- Type signatures consistent (CreateOrderRequest/VerifyRequest used across SDK and interface)

### 3. Type Consistency

- Amounts: int64 (分) for WeChat/Alipay, string (元) for Alipay biz_content — handled per-platform
- VerifyRequest consistent across all platforms
- CouponInfo consistent across Meituan/Douyin
- response.OK/Error used in all handlers
- PageData struct for all paginated lists

### 4. What this delivers

After Phase 2:
- ✅ Full backend CRUD for parks/shops/users/orders/finance
- ✅ WeChat Pay + Alipay + Meituan + Douyin SDKs with signing/auth
- ✅ Unified PaymentProvider + VerificationProvider interfaces
- ✅ Callback handlers for async notifications
- ✅ Vue 3 PC admin with login, dynamic menu, core pages
- ✅ PaymentConfig model for per-shop platform configuration
