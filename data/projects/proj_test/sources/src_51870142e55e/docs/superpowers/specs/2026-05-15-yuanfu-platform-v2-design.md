# 袁夫稻田智慧园区综合管理平台 V2 — 架构设计文档

## 0. 概述

**目标：** 开发袁夫稻田智慧园区综合管理平台 V2，覆盖三层架构（总部→园区→商户）、四端（PC 后台 + 3 个小程序）、美团/抖音第三方集成、数据迁移。

**设计原则：** 严格遵循原型图（yfsc-platform-v2-meituan）的 UI/UX 和交互逻辑；PRD-V2 为功能规格依据；后端先行，按端分阶段实施。

## 1. 系统总览

### 1.1 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      前端层                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  PC 管理后台  │  │ 管理端小程序  │  │ 商户端小程序  │       │
│  │ Vue3+Element │  │  微信小程序   │  │  微信小程序   │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         └─────────────────┼─────────────────┘                │
│                           │                                  │
│  ┌──────────────┐         │                                  │
│  │ 客户端小程序  │         │                                  │
│  │  微信小程序   │         │                                  │
│  └──────┬───────┘         │                                  │
└─────────┼─────────────────┼──────────────────────────────────┘
          │ HTTP(S) + JSON  │
┌─────────┼─────────────────┼──────────────────────────────────┐
│         ▼                 ▼         后端层 (Go + Gin)         │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                   API Gateway / Router                 │    │
│  │         (JWT 鉴权 · RBAC · CORS · Rate Limit)         │    │
│  └────┬──────┬──────┬──────┬──────┬──────┬──────┬───┬───┘    │
│       │      │      │      │      │      │      │   │   │    │
│  ┌────▼──┐┌─▼───┐┌─▼───┐┌─▼───┐┌─▼───┐┌─▼───┐┌─▼─┐┌─▼─┐│    │
│  │ auth  ││rbac ││ park││ shop││ user││order││fin││ mt││    │
│  └───────┘└─────┘└─────┘└─────┘└─────┘└─────┘└───┘└───┘│    │
│  ┌───────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌───┐┌───┐│    │
│  │recharge││gate ││activity││migrate││ mp  ││sys││ dy││    │
│  └───────┘└─────┘└─────┘└──────┘└─────┘└───┘└───┘└───┘│    │
│       │      │      │      │      │      │      │   │        │
│  ┌────▼──────┴──────┴──────┴──────┴──────┴──────┴───┘      │
│  │                    Service Layer                          │
│  └────┬───────────────────────────────────────────────┘     │
│       │                                                      │
│  ┌────▼───────────────────────────────────────────────┐     │
│  │                  Repository Layer (GORM)             │     │
│  └────┬───────────────────────────────────────────────┘     │
└───────┼──────────────────────────────────────────────────────┘
        │
┌───────┼──────────────────────────────────────────────────────┐
│       ▼        基础设施层                                     │
│  ┌─────────┐  ┌──────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ MySQL 8 │  │Redis │  │阿里云 OSS│  │ 第三方 API         │  │
│  │         │  │      │  │          │  │ 美团 / 抖音 / 微信  │  │
│  └─────────┘  └──────┘  └──────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈

| 层级 | 技术 |
|------|------|
| PC 前端 | Vue 3 + TypeScript + Element Plus + Vue Router + Pinia |
| 小程序 | 微信小程序原生（3 个独立小程序：客户端、管理端、商户端） |
| 后端 | Go 1.21+ + Gin + GORM + go-redis |
| 数据库 | MySQL 8.0 |
| 缓存 | Redis 7.x |
| 对象存储 | 阿里云 OSS |
| 部署 | Docker + Docker Compose |
| 监控 | Prometheus + Grafana |

## 2. 数据库设计

### 2.1 核心表（基于 PRD 6.2 节 + 原型 pc-data.js）

**park** — 园区
```
id BIGINT PK AUTO_INCREMENT
name VARCHAR(100) NOT NULL
code VARCHAR(50) UNIQUE NOT NULL
address VARCHAR(255)
contact_name VARCHAR(50)
contact_phone VARCHAR(20)
status TINYINT DEFAULT 1  -- 0=关闭 1=营业中
business_hours VARCHAR(100)
logo VARCHAR(500)
description TEXT
created_at DATETIME
updated_at DATETIME
```

**shop** — 店铺
```
id BIGINT PK AUTO_INCREMENT
park_id BIGINT FK -> park.id
name VARCHAR(100) NOT NULL
address VARCHAR(255)
type_id BIGINT FK -> shop_type.id
status TINYINT DEFAULT 1  -- 0=关闭 1=营业中 2=休息
qr_code_url VARCHAR(500)
created_at DATETIME
updated_at DATETIME
```

**shop_type** — 店铺类型
```
id BIGINT PK AUTO_INCREMENT
name VARCHAR(50) NOT NULL
code VARCHAR(50) UNIQUE NOT NULL
description VARCHAR(255)
status TINYINT DEFAULT 1
```

**user** — C 端用户/会员
```
id BIGINT PK AUTO_INCREMENT
nickname VARCHAR(50)
phone VARCHAR(20) UNIQUE
openid VARCHAR(100) UNIQUE
avatar VARCHAR(500)
member_level VARCHAR(20) DEFAULT '普通'  -- 普通/VIP1/VIP2/VIP3
face_status TINYINT DEFAULT 0  -- 0=未录入 1=已录入
face_feature_id VARCHAR(100)
balance DECIMAL(10,2) DEFAULT 0
total_consumption DECIMAL(10,2) DEFAULT 0
total_purchases INT DEFAULT 0
points INT DEFAULT 0
registered_at DATETIME
created_at DATETIME
updated_at DATETIME
```

**employee** — 后台员工
```
id BIGINT PK AUTO_INCREMENT
username VARCHAR(50) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
real_name VARCHAR(50)
phone VARCHAR(20)
gender TINYINT DEFAULT 0  -- 0=未知 1=男 2=女
park_id BIGINT FK -> park.id
shop_id BIGINT FK -> shop.id
role VARCHAR(50) NOT NULL  -- 关联 roles.code
position VARCHAR(100)
status TINYINT DEFAULT 1  -- 0=禁用 1=启用
online_status TINYINT DEFAULT 0
created_at DATETIME
updated_at DATETIME
```

**role** — 角色
```
id BIGINT PK AUTO_INCREMENT
name VARCHAR(50) NOT NULL  -- 如"平台超级管理员"
code VARCHAR(50) UNIQUE NOT NULL  -- 如"ADMIN_PLATFORM"
layer VARCHAR(20) NOT NULL  -- 总部/园区/商户
description VARCHAR(255)
created_at DATETIME
```

**permission** — 权限
```
id BIGINT PK AUTO_INCREMENT
module VARCHAR(50) NOT NULL  -- 如"shops","users","meituan"
action VARCHAR(20) NOT NULL  -- view/edit/create/delete
label VARCHAR(100)
```

**role_permission** — 角色权限关系
```
role_id BIGINT FK -> role.id
permission_id BIGINT FK -> permission.id
PRIMARY KEY (role_id, permission_id)
```

**order** — 订单
```
id BIGINT PK AUTO_INCREMENT
order_no VARCHAR(100) UNIQUE NOT NULL
user_id BIGINT FK -> user.id
shop_id BIGINT FK -> shop.id
amount DECIMAL(10,2) NOT NULL
payment_method VARCHAR(20)  -- 微信/余额/混合/美团/抖音
status VARCHAR(20)  -- 待支付/已支付/已核销/已取消/退款处理中/已退款
remark VARCHAR(500)
paid_at DATETIME
verified_at DATETIME
cancelled_at DATETIME
created_at DATETIME
updated_at DATETIME
```

**recharge_record** — 充值记录
```
id BIGINT PK AUTO_INCREMENT
user_id BIGINT FK -> user.id
amount DECIMAL(10,2) NOT NULL
bonus_amount DECIMAL(10,2) DEFAULT 0  -- 赠送金额
status VARCHAR(20)  -- 成功/失败/退款
payment_method VARCHAR(20)
transaction_no VARCHAR(100)
remark VARCHAR(500)
created_at DATETIME
```

**refund_record** — 退款记录
```
id BIGINT PK AUTO_INCREMENT
order_id BIGINT FK -> order.id
user_id BIGINT FK -> user.id
amount DECIMAL(10,2) NOT NULL
reason VARCHAR(500)
status VARCHAR(20)  -- 待审核/审核通过/已退款/已驳回
reviewer_id BIGINT FK -> employee.id
review_note VARCHAR(500)
reviewed_at DATETIME
refunded_at DATETIME
created_at DATETIME
```

**activity** — 活动
```
id BIGINT PK AUTO_INCREMENT
title VARCHAR(200) NOT NULL
cover_url VARCHAR(500)
content TEXT  -- 富文本
type VARCHAR(20)  -- 优惠券/满减/限时折扣/节日活动/会员专享
start_at DATETIME
end_at DATETIME
applicable_parks VARCHAR(500)  -- JSON array of park IDs
applicable_shops VARCHAR(500)  -- JSON array of shop IDs
status TINYINT DEFAULT 0  -- 0=草稿 1=进行中 2=已结束
exposure_count INT DEFAULT 0
participant_count INT DEFAULT 0
conversion_orders INT DEFAULT 0
verification_rate DECIMAL(5,2)  -- 核销率
created_by BIGINT FK -> employee.id
created_at DATETIME
updated_at DATETIME
```

**gate_device** — 闸机设备
```
id BIGINT PK AUTO_INCREMENT
park_id BIGINT FK -> park.id
name VARCHAR(100) NOT NULL
type VARCHAR(20)  -- 入口/出口
direction VARCHAR(10)  -- 进/出
device_sn VARCHAR(50)
status TINYINT DEFAULT 1  -- 0=离线 1=在线 2=故障
created_at DATETIME
```

**gate_entry_record** — 进出记录
```
id BIGINT PK AUTO_INCREMENT
user_id BIGINT FK -> user.id
gate_id BIGINT FK -> gate_device.id
direction VARCHAR(10)  -- 进/出
similarity DECIMAL(5,2)  -- 人脸相似度
verify_method VARCHAR(10)  -- 人脸/扫码
entry_time DATETIME
```

**withdraw_application** — 提现申请
```
id BIGINT PK AUTO_INCREMENT
shop_id BIGINT FK -> shop.id
amount DECIMAL(10,2) NOT NULL
bank_name VARCHAR(50)
bank_account VARCHAR(100)
account_name VARCHAR(50)
status VARCHAR(20)  -- 待审核/已通过/已驳回/已打款
reviewer_id BIGINT FK -> employee.id
review_note VARCHAR(500)
reviewed_at DATETIME
paid_at DATETIME
created_at DATETIME
```

**reconciliation** — 对账单
```
id BIGINT PK AUTO_INCREMENT
park_id BIGINT FK -> park.id
shop_id BIGINT FK -> shop.id
date DATE NOT NULL
total_amount DECIMAL(10,2)
order_count INT
online_amount DECIMAL(10,2)
offline_amount DECIMAL(10,2)
meituan_amount DECIMAL(10,2)
douyin_amount DECIMAL(10,2)
recharge_amount DECIMAL(10,2)
withdraw_amount DECIMAL(10,2)
created_at DATETIME
```

**operation_log** — 操作日志
```
id BIGINT PK AUTO_INCREMENT
employee_id BIGINT FK -> employee.id
action VARCHAR(50)
module VARCHAR(50)
ip VARCHAR(50)
status TINYINT  -- 0=失败 1=成功
detail JSON
created_at DATETIME
```

**mini_program_config** — 小程序配置
```
id BIGINT PK AUTO_INCREMENT
type VARCHAR(20) UNIQUE NOT NULL  -- client/merchant/admin
app_id VARCHAR(100)
app_secret VARCHAR(100)
callback_url VARCHAR(255)
version VARCHAR(20)
status TINYINT DEFAULT 1
updated_at DATETIME
```

### 2.2 V2 新增表

**meituan_store_mapping** — 美团门店映射
```
id BIGINT PK AUTO_INCREMENT
shop_id BIGINT FK -> shop.id
external_store_id VARCHAR(100) NOT NULL  -- 美团门店 ID
external_store_name VARCHAR(200)
auth_status TINYINT DEFAULT 0  -- 0=未授权 1=已授权 2=已过期
sync_status TINYINT DEFAULT 0  -- 0=未同步 1=同步中 2=已同步
access_token VARCHAR(500)
token_expires_at DATETIME
created_at DATETIME
updated_at DATETIME
```

**meituan_verify_record** — 美团核销记录
```
id BIGINT PK AUTO_INCREMENT
verify_no VARCHAR(100) UNIQUE NOT NULL
shop_id BIGINT FK -> shop.id
coupon_name VARCHAR(200)
user_phone VARCHAR(20)  -- 脱敏
amount DECIMAL(10,2)
commission DECIMAL(10,2)  -- 10% 佣金
settlement_amount DECIMAL(10,2)
verified_at DATETIME
operator_id BIGINT FK -> employee.id
created_at DATETIME
```

**meituan_settlement** — 美团结算
```
id BIGINT PK AUTO_INCREMENT
batch_no VARCHAR(100) UNIQUE NOT NULL
shop_id BIGINT FK -> shop.id
verify_count INT
verify_total DECIMAL(10,2)
commission_total DECIMAL(10,2)
settlement_amount DECIMAL(10,2)
status VARCHAR(20)  -- 待结算/已结算/已打款
settlement_date DATE
created_at DATETIME
```

**meituan_api_config** — 美团 API 配置
```
id BIGINT PK AUTO_INCREMENT
app_id VARCHAR(100)
app_secret VARCHAR(100)
callback_url VARCHAR(255)
status TINYINT DEFAULT 0  -- 0=禁用 1=启用
updated_at DATETIME
```

**douyin_store_mapping** — 抖音门店映射
```
id BIGINT PK AUTO_INCREMENT
shop_id BIGINT FK -> shop.id
poi_id VARCHAR(100) NOT NULL  -- 抖音 POI ID
external_store_name VARCHAR(200)
auth_status TINYINT DEFAULT 0
sync_status TINYINT DEFAULT 0
access_token VARCHAR(500)
token_expires_at DATETIME
created_at DATETIME
updated_at DATETIME
```

**douyin_verify_record** — 抖音核销记录
```
id BIGINT PK AUTO_INCREMENT
verify_no VARCHAR(100) UNIQUE NOT NULL
shop_id BIGINT FK -> shop.id
coupon_name VARCHAR(200)
coupon_type VARCHAR(20)  -- 团购套餐/次卡/代金券/组合券包
user_phone VARCHAR(20)  -- 脱敏
amount DECIMAL(10,2)
commission DECIMAL(10,2)  -- 5% 佣金
settlement_amount DECIMAL(10,2)
verified_at DATETIME
operator_id BIGINT FK -> employee.id
created_at DATETIME
```

**douyin_settlement** — 抖音结算
```
id BIGINT PK AUTO_INCREMENT
batch_no VARCHAR(100) UNIQUE NOT NULL
shop_id BIGINT FK -> shop.id
verify_count INT
verify_total DECIMAL(10,2)
commission_total DECIMAL(10,2)
settlement_amount DECIMAL(10,2)
status VARCHAR(20)  -- 待结算/已结算/已打款
settlement_date DATE
created_at DATETIME
```

**douyin_api_config** — 抖音 API 配置
```
id BIGINT PK AUTO_INCREMENT
client_key VARCHAR(100)
client_secret VARCHAR(100)
callback_url VARCHAR(255)
status TINYINT DEFAULT 0
updated_at DATETIME
```

### 2.3 索引策略

- 所有 `*_id` 外键建 B+ 树索引
- `user.phone`, `user.openid`, `employee.username` 建唯一索引
- `order.order_no`, `order.status` 建联合索引
- `meituan_verify_record.verified_at`, `douyin_verify_record.verified_at` 建索引（按时间查询频繁）
- `reconciliation.date` 建索引

## 3. 后端 API 设计

### 3.1 目录结构

```
backend/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── config/          # 配置加载 (YAML/env)
│   ├── handler/         # HTTP handler (gin)
│   │   ├── auth.go
│   │   ├── rbac.go
│   │   ├── park.go
│   │   ├── shop.go
│   │   ├── user.go
│   │   ├── order.go
│   │   ├── recharge.go
│   │   ├── finance.go
│   │   ├── gate.go
│   │   ├── activity.go
│   │   ├── meituan.go
│   │   ├── douyin.go
│   │   ├── migrate.go
│   │   ├── mp.go
│   │   └── system.go
│   ├── service/         # 业务逻辑
│   │   ├── auth_service.go
│   │   ├── rbac_service.go
│   │   ├── ... (同上)
│   │   ├── meituan_service.go   # 美团 OAuth/验券/结算
│   │   └── douyin_service.go    # 抖音授权/宣券/验券/结算
│   ├── model/           # GORM model
│   │   └── ... (一表一文件)
│   ├── repository/      # 数据访问
│   │   └── ... (一表一文件)
│   ├── middleware/
│   │   ├── jwt.go       # JWT 鉴权
│   │   ├── rbac.go      # RBAC 权限检查
│   │   ├── cors.go
│   │   ├── ratelimit.go
│   │   └── logger.go
│   └── router/
│       └── router.go    # 路由注册
├── pkg/
│   ├── response/        # 统一响应格式
│   ├── meituan/         # 美团 SDK 封装
│   ├── douyin/          # 抖音 SDK 封装
│   └── wechat/          # 微信 SDK 封装
├── migrations/          # SQL 迁移文件
├── config.yaml          # 配置文件
├── go.mod
└── go.sum
```

### 3.2 统一响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": { ... },
  "timestamp": 1715760000
}
```

错误码：0=成功, 401=未登录, 403=无权限, 404=不存在, 500=内部错误

### 3.3 核心 API 路由

```
POST /api/v1/auth/login              # 员工登录
POST /api/v1/auth/wx-login           # 微信授权登录（小程序）
POST /api/v1/auth/sms-login          # 手机验证码登录
POST /api/v1/auth/refresh            # 刷新 token
POST /api/v1/auth/logout             # 登出

GET  /api/v1/rbac/menu               # 获取当前用户菜单（按视角裁剪）
GET  /api/v1/rbac/roles              # 角色列表
PUT  /api/v1/rbac/roles/:id/perms    # 配置角色权限

GET  /api/v1/parks                   # 园区列表
POST /api/v1/parks                   # 新增园区
GET  /api/v1/parks/:id               # 园区详情
PUT  /api/v1/parks/:id               # 编辑园区
POST /api/v1/parks/:id/toggle        # 启用/停用

GET  /api/v1/shops                   # 店铺列表
POST /api/v1/shops                   # 新增店铺
GET  /api/v1/shops/:id               # 店铺详情
PUT  /api/v1/shops/:id               # 编辑店铺
GET  /api/v1/shops/:id/qrcode        # 获取店铺二维码

GET  /api/v1/users                   # 用户列表
POST /api/v1/users                   # 新增用户
GET  /api/v1/users/:id               # 用户详情
PUT  /api/v1/users/:id               # 编辑用户
GET  /api/v1/users/stats             # 用户统计
GET  /api/v1/recharge-records        # 充值记录

GET  /api/v1/orders                  # 订单列表
POST /api/v1/orders/verify           # 核销订单
POST /api/v1/orders/refund           # 申请退款
GET  /api/v1/refunds                 # 退款列表
POST /api/v1/refunds/:id/review      # 审核退款

GET  /api/v1/finance/account         # 园区账户
POST /api/v1/finance/withdraw        # 提现申请
GET  /api/v1/finance/withdraws       # 提现列表
POST /api/v1/finance/withdraws/:id/review  # 审核提现
GET  /api/v1/finance/reconcile       # 对账单

GET  /api/v1/employees               # 员工列表
POST /api/v1/employees               # 新增员工
PUT  /api/v1/employees/:id           # 编辑员工

GET  /api/v1/gates                   # 闸机列表
GET  /api/v1/gates/entries           # 进出记录
POST /api/v1/gates/face              # 录入人脸

GET  /api/v1/activities              # 活动列表
POST /api/v1/activities              # 创建活动

# 美团核销
GET  /api/v1/meituan/dashboard       # 美团数据看板
GET  /api/v1/meituan/records         # 美团验券记录
GET  /api/v1/meituan/settlements     # 结算列表
POST /api/v1/meituan/settlements/trigger  # 手动触发结算
GET  /api/v1/meituan/stores          # 门店映射列表
POST /api/v1/meituan/stores/bind     # 绑定美团门店
GET  /api/v1/meituan/config          # API 配置
PUT  /api/v1/meituan/config          # 更新 API 配置
POST /api/v1/meituan/verify          # 美团验券

# 抖音核销
GET  /api/v1/douyin/dashboard        # 抖音数据看板
GET  /api/v1/douyin/records          # 抖音验券记录
GET  /api/v1/douyin/settlements      # 结算列表
POST /api/v1/douyin/settlements/trigger  # 手动触发结算
GET  /api/v1/douyin/stores           # 门店映射列表
POST /api/v1/douyin/stores/bind      # 绑定抖音门店
GET  /api/v1/douyin/config           # API 配置
PUT  /api/v1/douyin/config           # 更新 API 配置
POST /api/v1/douyin/pre-check        # 宣券预检
POST /api/v1/douyin/verify           # 抖音验券

# 小程序管理
GET  /api/v1/mp/client               # 客户端配置
GET  /api/v1/mp/merchant             # 商户端配置
GET  /api/v1/mp/admin                # 管理端配置
PUT  /api/v1/mp/:type                # 更新小程序配置

# 系统
GET  /api/v1/logs                    # 操作日志
GET  /api/v1/view-switch             # 切换视角
```

### 3.4 RBAC 中间件设计

```go
// JWT 中间件解析 token → employee_id → role → permissions
func JWTAuth() gin.HandlerFunc {
    // 1. 从 Header.Authorization 取 token
    // 2. 解析 JWT，获取 employee_id
    // 3. 查询 employee 获取 role
    // 4. 查询 role_permission 获取权限列表
    // 5. 存入 gin.Context: "employee_id", "role", "permissions"
}

// RBAC 中间件检查当前请求是否有权访问
func RequirePermission(module, action string) gin.HandlerFunc {
    // 1. 从 Context 取 permissions
    // 2. 检查 (module, action) 是否在权限列表中
    // 3. 无权限 → 403
}

// 动态菜单生成：根据当前角色 + 视角返回可见菜单
func GET /api/v1/rbac/menu {
    // 1. 当前视角 (platform/park/shop)
    // 2. 查询 MENU_VISIBILITY[视角]
    // 3. 查询 role_permission
    // 4. 取交集，返回可见菜单树
}
```

### 3.5 美团/抖音集成层

**美团 SDK 封装 (pkg/meituan/)**
```
- OAuthAuthorize()       → 获取 access_token
- StoreBind(shopID, mtStoreID) → 建立门店映射
- VerifyCoupon(token)    → 验券，返回券信息+金额
- GetSettlement(batchNo) → 查询结算状态
- TriggerSettlement(shopID, date) → T+1 结算
```

**抖音 SDK 封装 (pkg/douyin/)**
```
- OAuthAuthorize()       → 获取 access_token
- StoreBind(shopID, poiID) → 建立 POI 映射
- PreCheckCoupon(token)  → 宣券预检，返回券状态
- VerifyCoupon(token)    → 验券
- GetCoupons(shopID)     → 拉取团购券列表
- TriggerSettlement(shopID, date) → T+1 结算
```

### 3.6 数据迁移服务

```
GET  /api/v1/migrate/config     # 查看迁移配置
POST /api/v1/migrate/dry-run    # 试运行迁移
POST /api/v1/migrate/run        # 正式执行迁移
GET  /api/v1/migrate/progress   # 查看迁移进度
GET  /api/v1/migrate/report     # 迁移结果校验报告
```

## 4. PC 前端架构

### 4.1 技术选型

Vue 3 + TypeScript + Element Plus + Vue Router + Pinia + ECharts

### 4.2 目录结构

```
web-admin/
├── src/
│   ├── api/              # API 请求封装 (axios)
│   ├── components/       # 公共组件
│   │   ├── Layout/       # 整体布局 (sidebar + header + content)
│   │   ├── DataTable/    # 通用表格组件
│   │   ├── StatCard/     # 统计卡片
│   │   └── ViewSwitch/   # 视角切换组件
│   ├── views/            # 页面
│   │   ├── Overview/     # 园区总览
│   │   ├── Databoard/    # 数据看板
│   │   ├── Park/         # 园区管理
│   │   ├── Shop/         # 店铺管理
│   │   ├── User/         # 客户管理
│   │   ├── Consumption/  # 消费管理
│   │   ├── SalesStats/   # 销售统计
│   │   ├── FlowStats/    # 客流统计
│   │   ├── Finance/      # 财务管理
│   │   ├── Employee/     # 员工管理
│   │   ├── Gate/         # 闸机管理
│   │   ├── Activity/     # 活动管理
│   │   ├── Meituan/      # 美团核销
│   │   ├── Douyin/       # 抖音核销
│   │   ├── MiniProgram/  # 小程序管理
│   │   ├── Permission/   # 权限管理
│   │   ├── DataMigrate/  # 数据迁移
│   │   ├── Settings/     # 系统设置
│   │   └── Login/        # 登录页
│   ├── router/           # 路由（动态生成，基于菜单权限）
│   ├── store/            # Pinia stores
│   │   ├── auth.ts
│   │   ├── menu.ts       # 动态菜单
│   │   ├── view.ts       # 视角状态
│   │   └── user.ts
│   ├── styles/           # 全局样式（自然田园主题变量）
│   ├── utils/
│   │   ├── request.ts    # axios 封装
│   │   ├── auth.ts       # token 管理
│   │   └── format.ts     # 日期/金额格式化
│   ├── App.vue
│   └── main.ts
├── public/
├── index.html
├── vite.config.ts
├── package.json
└── tsconfig.json
```

### 4.3 核心交互逻辑

**视角切换：** 用户通过左下角下拉框切换视角 → 调用 `GET /api/v1/rbac/menu` → 动态替换左侧导航 → 刷新页面数据

**动态菜单：** 登录后获取用户角色 → 根据 MENU_VISIBILITY + role_permission 计算可见菜单 → 写入 Pinia store → router.addRoute() 动态注册

**数据权限：** 所有列表 API 根据当前视角自动过滤数据范围（总部=全量, 园区=本园区, 商户=本店铺）

## 5. 小程序端架构

### 5.1 客户端小程序

**底部 5 Tab：** 首页 | 商品分类 | 会员码(中央凸起) | 购物车 | 个人中心

**核心页面：**
- 首页：企微客服横幅 + 9宫格分类 + 新品专区 + 品类专区
- 商品分类：左侧分类导航 + 右侧商品列表
- 商品详情：轮播图 + SKU + 加购 + 立即购买
- 购物车：勾选 + 数量修改 + 结算
- 下单：地址/用餐时间 + 备注 + 支付
- 充值：档位选择 + 微信支付
- 会员码：动态二维码 + 条形码 + 30秒自动刷新
- 活动：列表 + 详情 + 参与
- 闸机通行：扫码通行 + 人脸通行
- 个人中心：资产 + 订单 + 功能列表

### 5.2 管理端小程序（园区管理员）

**底部 5 Tab：** 首页 | 商户 | 扫码 | 消息 | 我的

**核心页面：**
- 首页：数据卡片 + 快捷功能 + 今日动态
- 商户：商户列表 + 商户切换 + 排行
- 扫码：订单核销 / 收款核销 / 美团验券 / 抖音验券（4种模式）
- 消息：通知中心（退款/活动/提现/系统）
- 我的：个人信息 + 权限 + 园区设置 + 切换园区

### 5.3 商户端小程序

**底部 5 Tab：** 经营 | 订单 | 核销 | 收益 | 我的

**核心页面：**
- 经营：今日指标 + 趋势图 + 快捷入口
- 订单：列表 + 状态筛选
- 核销：4种模式（同管理端）
- 收益：余额 + 提现 + 收益明细
- 菜单上架（V2 新增）：菜品列表 + 上下架
- 经营数据清单（V2 新增）：日报/周报/月报
- 提现账户管理（V2 新增）：账户列表 + 新增
- 我的：个人信息 + 店铺信息 + 退出

### 5.4 小程序通用架构

```
mini-program-xxx/
├── pages/
│   ├── index/          # 首页
│   ├── ...             # 各页面
│   └── me/             # 个人中心
├── components/         # 公共组件
├── utils/
│   ├── request.js      # wx.request 封装
│   ├── auth.js         # 登录/鉴权
│   └── format.js       # 格式化
├── store/              # 简单状态管理（或 getApp().globalData）
├── app.js
├── app.json
├── app.wxss
└── project.config.json
```

## 6. 部署架构

### 6.1 Docker Compose

```yaml
services:
  mysql:
    image: mysql:8.0
    volumes:
      - mysql_data:/var/lib/mysql
      - ./migrations:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - mysql
      - redis
    environment:
      - DB_HOST=mysql
      - REDIS_HOST=redis

  frontend:
    build: ./web-admin
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### 6.2 开发阶段

- MySQL 本地运行
- Redis 本地运行
- Go 后端 `go run cmd/server/main.go`
- Vue 前端 `npm run dev` (Vite HMR)
- 小程序使用微信开发者工具

### 6.3 生产环境

- 阿里云 ECS
- Docker Compose 部署
- Nginx 反向代理 + HTTPS
- 阿里云 RDS MySQL
- 阿里云 Redis
- 阿里云 OSS 图片存储

## 7. 开发阶段规划

### Phase 1: 基础架构（第 1-2 周）
- [ ] 数据库建表 + GORM model
- [ ] Go 后端基础框架 + JWT 鉴权
- [ ] RBAC 中间件 + 动态菜单 API
- [ ] 员工 CRUD + 登录流程

### Phase 2: 核心业务（第 3-4 周）
- [ ] 园区/店铺 CRUD
- [ ] 用户/会员 CRUD
- [ ] 订单/充值/退款流程
- [ ] PC 前端基础布局 + 视角切换

### Phase 3: 运营模块（第 5-6 周）
- [ ] 财务管理（账户/提现/对账）
- [ ] 闸机管理
- [ ] 活动管理
- [ ] 数据看板（ECharts）

### Phase 4: 第三方集成（第 7-8 周）
- [ ] 美团 OAuth + 验券 + 结算
- [ ] 抖音 OAuth + 宣券预检 + 验券 + 结算
- [ ] 门店映射配置

### Phase 5: 小程序端（第 9-11 周）
- [ ] 客户端小程序（商城/充值/亮码支付）
- [ ] 管理端小程序
- [ ] 商户端小程序（含菜单上架/经营数据/提现账户）

### Phase 6: 数据迁移 + 上线（第 12 周）
- [ ] 数据迁移工具
- [ ] 全链路测试
- [ ] 性能优化
- [ ] 上线部署

## 8. 待确认事项

1. Go Web 框架：推荐 Gin + GORM，是否确认？
2. 美团/抖音 API 文档（用户表示稍后提供）
3. 微信小程序 AppID 是否已有？
4. 数据库是否用阿里云 RDS 还是自建？
5. 是否需要 CI/CD 流水线（GitHub Actions / GitLab CI）？
