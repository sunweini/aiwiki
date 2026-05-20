# 袁夫稻田智慧园区 V2 — API 文档

Base URL: `/api/v1`

Auth: `Authorization: Bearer <token>`（除 `/auth/*` 和 `/callback/*` 外均需要）

响应格式：
```json
{ "code": 0, "message": "success", "data": { ... }, "timestamp": 1715760000 }
```
分页：
```json
{ "code": 0, "data": { "items": [...], "total": 64, "page": 1, "page_size": 20, "total_pages": 4 } }
```

错误码：`0` 成功，`401` 未认证，`4011` token 过期，`4013` 密码错误，`403` 无权限，`404` 不存在，`500` 服务器错误。

---

## 认证

| Method | Path | 说明 |
|--------|------|------|
| POST | `/auth/login` | 员工登录 `{ username, password }` → `{ access_token, refresh_token, employee }` |
| POST | `/auth/refresh` | 刷新 token `{ refresh_token }` |
| POST | `/auth/logout` | 登出 |

---

## RBAC

| Method | Path | 说明 |
|--------|------|------|
| GET | `/rbac/menu?view=platform\|park\|shop` | 获取动态菜单（按视角过滤） |
| GET | `/rbac/roles` | 角色列表 |
| GET | `/permissions` | 所有权限（按 module 分组） |
| GET | `/permissions/roles/:id` | 获取角色权限 ID 列表 |
| PUT | `/permissions/roles/:id` | 更新角色权限 `{ permission_ids: [1,2,3] }` |

---

## 园区 parks

| Method | Path | 说明 |
|--------|------|------|
| GET | `/parks?page=&page_size=&name=&status=` | 园区列表（分页+筛选） |
| POST | `/parks` | 新增 `{ name, code, address, contact_name, contact_phone }` |
| GET | `/parks/:id` | 园区详情 |
| PUT | `/parks/:id` | 编辑园区 |
| DELETE | `/parks/:id` | 删除园区 |
| POST | `/parks/:id/toggle` | 启用/停用 `{ status: 0\|1 }` |

---

## 店铺 shops

| Method | Path | 说明 |
|--------|------|------|
| GET | `/shops?page=&page_size=&park_id=&name=` | 店铺列表 |
| POST | `/shops` | 新增 `{ name, address, park_id, type_id }` |
| GET | `/shops/stats` | 店铺统计（营业中/休息/关闭/总数） |
| GET | `/shops/:id` | 店铺详情 |
| PUT | `/shops/:id` | 编辑店铺 |
| DELETE | `/shops/:id` | 删除店铺 |
| GET | `/shops/:id/qrcode` | 获取店铺二维码 |

---

## 客户 users

| Method | Path | 说明 |
|--------|------|------|
| GET | `/users?page=&page_size=&phone=&member_level=` | 用户列表 |
| POST | `/users` | 新增用户 |
| GET | `/users/stats` | 用户统计（总数/今日新增/活跃） |
| GET | `/users/:id` | 用户详情 |
| PUT | `/users/:id` | 编辑用户 |
| GET | `/users/:id/recharges` | 用户充值记录 |

---

## 订单 orders

| Method | Path | 说明 |
|--------|------|------|
| GET | `/orders?page=&page_size=&order_no=&status=` | 订单列表 |
| GET | `/orders/:id` | 订单详情 |
| POST | `/orders/:id/verify` | 核销订单 |
| POST | `/orders/:id/refund` | 申请退款 `{ user_id, amount, reason }` |
| GET | `/refunds?page=&page_size=` | 退款列表 |
| POST | `/refunds/:id/review` | 审核退款 |

---

## 财务 finance

| Method | Path | 说明 |
|--------|------|------|
| POST | `/finance/withdraw` | 提现申请 |
| GET | `/finance/withdraws?page=&page_size=&status=` | 提现列表 |
| POST | `/finance/withdraws/:id/review` | 审核提现 |
| GET | `/finance/reconcile?park_id=&date=` | 对账单 |

---

## 员工 employees

| Method | Path | 说明 |
|--------|------|------|
| GET | `/employees?page=&page_size=&role=&status=&park_id=` | 员工列表 |
| POST | `/employees` | 新增 `{ username, password, real_name, phone, role, position }` |
| GET | `/employees/:id` | 员工详情 |
| PUT | `/employees/:id` | 编辑员工 |
| DELETE | `/employees/:id` | 删除员工 |
| POST | `/employees/:id/toggle` | 启用/禁用 `{ status }` |
| POST | `/employees/:id/reset-password` | 重置密码 `{ new_password }` |

---

## 岗位 positions

| Method | Path | 说明 |
|--------|------|------|
| GET | `/positions` | 岗位列表 |
| POST | `/positions` | 新增岗位 |
| PUT | `/positions/:id` | 编辑岗位 |
| DELETE | `/positions/:id` | 删除岗位 |

---

## 统计 stats

| Method | Path | 说明 |
|--------|------|------|
| GET | `/stats/sales?start_date=&end_date=&shop_id=` | 销售概览 |
| GET | `/stats/sales/trend?period=day\|week\|month` | 销售趋势 |
| GET | `/stats/sales/by-shop` | 按店铺销售额分布 |
| GET | `/stats/flow?start_date=&end_date=&park_id=` | 客流概览 |
| GET | `/stats/flow/trend?period=day\|week\|month` | 客流趋势 |
| GET | `/stats/flow/heatmap` | 24h 客流热力图 |
| GET | `/stats/user-growth` | 用户增长数据 |

---

## 闸机 gates

| Method | Path | 说明 |
|--------|------|------|
| GET | `/gates?page=&page_size=&park_id=` | 闸机列表 |
| POST | `/gates` | 新增 `{ name, type, direction, device_sn, park_id }` |
| PUT | `/gates/:id` | 编辑闸机 |
| DELETE | `/gates/:id` | 删除闸机 |
| GET | `/gates/:id/entries` | 闸机进出记录 |

---

## 活动 activities

| Method | Path | 说明 |
|--------|------|------|
| GET | `/activities?page=&page_size=&type=&status=` | 活动列表 |
| POST | `/activities` | 创建 `{ title, type, content, cover_url, start_at, end_at }` |
| GET | `/activities/:id/stats` | 活动统计（曝光/参与/转化/核销率） |
| PUT | `/activities/:id` | 编辑活动 |
| DELETE | `/activities/:id` | 删除活动 |

---

## 系统设置 settings

| Method | Path | 说明 |
|--------|------|------|
| GET | `/settings/mp-config/:type` | 获取小程序配置（type: client\|merchant\|admin） |
| PUT | `/settings/mp-config/:type` | 更新配置 `{ app_id, app_secret, callback_url }` |
| GET | `/settings/logs?page=&module=&status=` | 操作日志 |

---

## 美团核销 meituan

| Method | Path | 说明 |
|--------|------|------|
| GET | `/meituan/dashboard?shop_id=` | 核销仪表盘（含趋势图和门店分布） |
| GET | `/meituan/records?page=&page_size=&shop_id=` | 验券记录 |
| GET | `/meituan/settlements?shop_id=&status=` | 结算明细 |
| POST | `/meituan/settlements/trigger` | 触发结算 `{ shop_id, date }` |
| GET | `/meituan/stores` | 门店映射列表 |
| POST | `/meituan/stores` | 绑定门店 `{ shop_id, external_store_id, external_store_name }` |
| GET | `/meituan/config` | API 配置 |
| PUT | `/meituan/config` | 更新 API 配置 `{ app_id, app_secret, callback_url }` |

---

## 抖音核销 douyin

| Method | Path | 说明 |
|--------|------|------|
| GET | `/douyin/dashboard?shop_id=` | 核销仪表盘 |
| GET | `/douyin/records?page=&page_size=&shop_id=` | 验券记录 |
| GET | `/douyin/settlements?shop_id=&status=` | 结算明细 |
| POST | `/douyin/settlements/trigger` | 触发结算 `{ shop_id, date }` |
| GET | `/douyin/stores` | POI 映射列表 |
| POST | `/douyin/stores` | 绑定 POI `{ shop_id, poi_id, external_store_name }` |
| GET | `/douyin/config` | API 配置 |
| PUT | `/douyin/config` | 更新 `{ client_key, client_secret, callback_url }` |

---

## 回调 callbacks（无需认证）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/callback/wechat/pay` | 微信支付回调（AES-256-GCM 解密） |
| POST | `/callback/alipay/pay` | 支付宝支付回调（form-encoded） |
| POST | `/callback/douyin/spi` | 抖音 SPI 回调 |
| GET | `/callback/ping` | 健康检查 |
