# 袁夫稻田智慧园区 V2 — 数据库 ER 图

## 关系总览

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     role     │       │  permission  │       │   employee   │
│──────────────│       │──────────────│       │──────────────│
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ name         │       │ module       │       │ username     │
│ code (UQ)    │       │ action       │       │ password_hash│
│ layer        │       │ label        │       │ real_name    │
│ description  │       └──────┬───────┘       │ phone        │
└──────┬───────┘              │               │ role → code  │
       │         ┌────────────▼──────────┐    │ park_id (FK) │
       └────────→│   role_permission     │    │ shop_id (FK) │
                 │───────────────────────│    │ position     │
                 │ role_id (PK, FK)      │    │ status       │
                 │ permission_id (PK,FK) │    └──────────────┘
                 └───────────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     park     │       │     shop     │       │  shop_type   │
│──────────────│       │──────────────│       │──────────────│
│ id (PK)      │───┐   │ id (PK)      │   ┌──│ id (PK)      │
│ name         │   │   │ name         │   │  │ name (UQ)    │
│ code (UQ)    │   └──→│ park_id (FK) │   │  │ code (UQ)    │
│ address      │       │ address      │   │  │ description  │
│ contact_name │       │ type_id (FK)─┼───┘  │ status       │
│ contact_phone│       │ status       │      └──────────────┘
│ status       │       │ qr_code_url  │
│ business_hrs │       └──────┬───────┘
│ logo         │              │
│ description  │              │
└──────────────┘              │
                              │
┌──────────────┐              │        ┌──────────────┐
│     user     │              │        │    order     │
│──────────────│              │        │──────────────│
│ id (PK)      │──────────────┼───────→│ id (PK)      │
│ nickname     │              │        │ order_no(UQ) │
│ phone (UQ)   │              │        │ user_id (FK) │
│ openid (UQ)  │              └───────→│ shop_id (FK) │
│ avatar       │                       │ amount       │
│ member_level │                       │ pay_method   │
│ face_status  │                       │ status       │
│ balance      │                       │ remark       │
│ total_consume│                       │ paid_at      │
│ total_purch  │                       │ verified_at  │
│ points       │                       │ cancelled_at │
└──────────────┘                       └──────┬───────┘
                                              │
                    ┌─────────────────────────┘
                    │
┌───────────────────▼──┐    ┌──────────────────┐
│    refund_record      │    │  recharge_record  │
│──────────────────────│    │──────────────────│
│ id (PK)              │    │ id (PK)          │
│ order_id (FK)        │    │ user_id (FK)     │
│ user_id (FK)         │    │ amount           │
│ amount               │    │ bonus_amount     │
│ reason               │    │ status           │
│ status               │    │ payment_method   │
│ reviewer_id→employee │    │ transaction_no   │
│ review_note          │    │ remark           │
│ reviewed_at          │    └──────────────────┘
│ refunded_at          │
└──────────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  activity    │       │ gate_device  │       │gate_entry_rec│
│──────────────│       │──────────────│       │──────────────│
│ id (PK)      │       │ id (PK)      │───┐   │ id (PK)      │
│ title        │       │ name         │   │   │ user_id (FK) │
│ cover_url    │       │ type         │   └──→│ gate_id (FK) │
│ content      │       │ direction    │       │ direction    │
│ type         │       │ device_sn    │       │ similarity   │
│ start_at     │       │ park_id (FK) │       │ verify_method│
│ end_at       │       │ status       │       │ entry_time   │
│ applicable*  │       └──────────────┘       └──────────────┘
│ status       │
│ exposure_cnt │       ┌──────────────────┐
│ partici_cnt  │       │ operation_log    │
│ convers_ord  │       │──────────────────│
│ verify_rate  │       │ id (PK)          │
│ created_by→  │       │ employee_id (FK) │
│   employee   │       │ action           │
└──────────────┘       │ module           │
                       │ ip               │
┌──────────────────┐   │ status           │
│  mini_program_   │   │ detail (JSON)    │
│  config          │   └──────────────────┘
│──────────────────│
│ id (PK)          │   ┌──────────────────┐
│ type (UQ)        │   │  payment_config  │
│ app_id           │   │──────────────────│
│ app_secret       │   │ id (PK)          │
│ callback_url     │   │ shop_id (FK)     │
│ version          │   │ platform         │
│ status           │   │ app_id           │
└──────────────────┘   │ merchant_id      │
                       │ sign_key         │
┌──────────────────────┐│ notify_url       │
│ withdraw_application ││ status           │
│──────────────────────│└──────────────────┘
│ id (PK)              │
│ shop_id (FK)         │   ┌──────────────────┐
│ amount               │   │  reconciliation  │
│ bank_name            │   │──────────────────│
│ bank_account         │   │ id (PK)          │
│ account_name         │   │ park_id (FK)     │
│ status               │   │ shop_id (FK)     │
│ reviewer_id→employee │   │ date             │
│ review_note          │   │ total_amount     │
│ reviewed_at, paid_at │   │ order_count      │
└──────────────────────┘   │ online_amount    │
                           │ offline_amount   │
┌──────────────────────┐   │ meituan_amount   │
│ meituan_store_mapping│   │ douyin_amount    │
│──────────────────────│   │ recharge_amount  │
│ id (PK)              │   │ withdraw_amount  │
│ shop_id (FK)         │   └──────────────────┘
│ external_store_id    │
│ external_store_name  │   ┌──────────────────┐
│ auth_status          │   │meituan_api_config│
│ sync_status          │   │──────────────────│
│ access_token         │   │ id (PK)          │
│ token_expires_at     │   │ app_id           │
└──────────────────────┘   │ app_secret       │
                           │ callback_url     │
┌──────────────────────┐   │ status           │
│ meituan_verify_record│   └──────────────────┘
│──────────────────────│
│ id (PK)              │   ┌──────────────────┐
│ verify_no (UQ)       │   │douyin_store_map. │
│ shop_id (FK)         │   │──────────────────│
│ coupon_name          │   │ id (PK)          │
│ user_phone           │   │ shop_id (FK)     │
│ amount               │   │ poi_id           │
│ commission           │   │ external_store_..│
│ settlement_amount    │   │ auth_status      │
│ verified_at          │   │ sync_status      │
│ operator_id→employee │   │ access_token     │
└──────────────────────┘   └──────────────────┘

┌──────────────────────┐
│ meituan_settlement   │   ┌──────────────────┐
│──────────────────────│   │douyin_verify_rec.│
│ id (PK)              │   │──────────────────│
│ batch_no (UQ)        │   │ id (PK)          │
│ shop_id (FK)         │   │ verify_no (UQ)   │
│ verify_count         │   │ shop_id (FK)     │
│ verify_total         │   │ coupon_name      │
│ commission_total     │   │ coupon_type      │
│ settlement_amount    │   │ user_phone       │
│ status               │   │ amount           │
│ settlement_date      │   │ commission       │
└──────────────────────┘   │ settlement_amount│
                           │ verified_at      │
┌──────────────────────┐   │ operator_id→emp  │
│ douyin_settlement    │   └──────────────────┘
│──────────────────────│
│ id (PK)              │   ┌──────────────────┐
│ batch_no (UQ)        │   │douyin_api_config │
│ shop_id (FK)         │   │──────────────────│
│ verify_count         │   │ id (PK)          │
│ verify_total         │   │ client_key       │
│ commission_total     │   │ client_secret    │
│ settlement_amount    │   │ callback_url     │
│ status               │   │ status           │
│ settlement_date      │   └──────────────────┘
└──────────────────────┘
```

## 表清单

| 表名 | 分类 | 说明 |
|------|------|------|
| `role` | RBAC | 角色定义（平台/园区/商户三层） |
| `permission` | RBAC | 权限项（module × action） |
| `role_permission` | RBAC | 角色-权限关联 |
| `employee` | RBAC | 后台员工 |
| `park` | 组织 | 园区 |
| `shop` | 组织 | 店铺 |
| `shop_type` | 组织 | 店铺类型 |
| `user` | 客户 | C 端用户/会员 |
| `order` | 交易 | 订单 |
| `refund_record` | 交易 | 退款记录 |
| `recharge_record` | 交易 | 充值记录 |
| `activity` | 运营 | 营销活动 |
| `gate_device` | 运营 | 闸机设备 |
| `gate_entry_record` | 运营 | 进出记录 |
| `withdraw_application` | 财务 | 提现申请 |
| `reconciliation` | 财务 | 对账单 |
| `operation_log` | 系统 | 操作日志 |
| `mini_program_config` | 系统 | 小程序配置 |
| `payment_config` | 系统 | 支付配置（per shop） |
| `meituan_store_mapping` | 美团 | 美团门店映射 |
| `meituan_verify_record` | 美团 | 美团验券记录 |
| `meituan_settlement` | 美团 | 美团结算批次 |
| `meituan_api_config` | 美团 | 美团 API 配置 |
| `douyin_store_mapping` | 抖音 | 抖音门店映射 |
| `douyin_verify_record` | 抖音 | 抖音验券记录 |
| `douyin_settlement` | 抖音 | 抖音结算批次 |
| `douyin_api_config` | 抖音 | 抖音 API 配置 |

**总计 28 张表。**
