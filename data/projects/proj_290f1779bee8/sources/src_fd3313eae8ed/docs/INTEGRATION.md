# 前后端对接文档

## 共享规范

| 项 | 规范 |
|----|------|
| Base URL | `/api/v1` |
| 鉴权 | `Authorization: Bearer <token>`（axios interceptor 自动注入） |
| 响应格式 | `{ code: 0, message, data, timestamp }` |
| 分页格式 | `{ code: 0, data: { items, total, page, page_size, total_pages } }` |
| 错误处理 | 401 → 清除 token 跳转登录；其他 → ElMessage.error |

---

## PC 管理后台 `web-admin/`

### 认证

| 页面 | API 调用 | 说明 |
|------|---------|------|
| `Login/index.vue` | `POST /auth/login` | 登录 → 存 token + employee |

### 布局

| 组件 | API 调用 | 说明 |
|------|---------|------|
| `Sidebar.vue` | `GET /rbac/menu?view=` | 动态菜单生成 |
| `ViewSwitch.vue` | — | 切换视角 → 重取菜单 |

### 数据看板

| 页面 | API 调用 | 说明 |
|------|---------|------|
| `Databoard/index.vue` | `GET /stats/sales` | 销售 KPI |
| | `GET /stats/flow` | 客流 KPI |
| | `GET /stats/sales/trend` | 销售趋势图 |
| | `GET /stats/sales/by-shop` | 店铺分布饼图 / 排行 |
| | `GET /stats/flow/trend` | 客流趋势图 |
| | `GET /stats/user-growth` | 用户增长 |
| `SalesStats/index.vue` | `GET /stats/sales` | 筛选后销售概览 |
| | `GET /stats/sales/trend` | 趋势图（日/周/月） |
| | `GET /shops` | 店铺下拉列表 |
| `FlowStats/index.vue` | `GET /stats/flow` | 客流概览 |
| | `GET /stats/flow/trend` | 客流趋势 |
| | `GET /stats/flow/heatmap` | 24h 热力图 |

### 园区 / 店铺 / 客户 / 订单

| 页面 | API 调用 | 说明 |
|------|---------|------|
| `Park/List.vue` | `GET /parks` | 列表 |
| | `POST /parks` | 新增 |
| | `PUT /parks/:id` | 编辑 |
| | `DELETE /parks/:id` | 删除 |
| | `POST /parks/:id/toggle` | 启用/停用 |
| `Shop/List.vue` | `GET /shops` / `GET /shops/stats` | 列表 + 统计 |
| | `POST /shops` / `PUT /shops/:id` | 新增/编辑 |
| | `GET /parks` | 园区下拉 |
| `User/List.vue` | `GET /users` / `GET /users/stats` | 列表 + 统计 |
| | `PUT /users/:id` | 编辑 |
| `Order/List.vue` | `GET /orders` | 列表 |
| | `POST /orders/:id/verify` | 核销 |
| | `POST /orders/:id/refund` | 退款 |
| | `GET /refunds` / `POST /refunds/:id/review` | 退款审核 |

### 财务 / 员工 / 闸机 / 活动

| 页面 | API 调用 | 说明 |
|------|---------|------|
| `Finance/Account.vue` | `GET /finance/account` | 园区账户 |
| `Finance/Withdraw.vue` | `GET /finance/withdraws` / `POST /finance/withdraws/:id/review` | 审核 |
| `Finance/Reconcile.vue` | `GET /finance/reconcile` | 对账单 |
| `Employee/List.vue` | `GET /employees` / `POST /employees` / `PUT /employees/:id` / `POST /employees/:id/toggle` | CRUD + 状态切换 |
| `Gate/List.vue` | `GET /gates` / `POST /gates` | 列表 + 新增 |
| | `GET /parks` | 园区下拉 |
| `Activity/List.vue` | `GET /activities` / `POST /activities` / `PUT /activities/:id` / `DELETE /activities/:id` | CRUD |

### 权限 / 设置 / 日志

| 页面 | API 调用 | 说明 |
|------|---------|------|
| `Permission/index.vue` | `GET /rbac/roles` | 角色列表 |
| | `GET /permissions` | 权限矩阵 |
| | `GET /permissions/roles/:id` | 角色已有权限 |
| | `PUT /permissions/roles/:id` | 保存权限 |
| `Settings/index.vue` | — | 入口页 |
| `Settings/MPConfig.vue` | `GET /settings/mp-config/:type` | 取配置 |
| | `PUT /settings/mp-config/:type` | 保存配置 |
| `Logs/index.vue` | `GET /settings/logs` | 日志列表 |

### 美团核销

| 页面 | API 调用 | 说明 |
|------|---------|------|
| `Meituan/Dashboard.vue` | `GET /meituan/dashboard` | KPI + 趋势 + 分布 |
| `Meituan/Records.vue` | `GET /meituan/records` | 验券列表 |
| | `GET /shops` | 店铺筛选 |
| `Meituan/Settlement.vue` | `GET /meituan/settlements` | 结算列表 |
| | `POST /meituan/settlements/trigger` | 触发结算 |
| | `GET /shops` | 店铺下拉 |
| `Meituan/Config.vue` | `GET /meituan/config` / `PUT /meituan/config` | API 配置 |
| | `GET /meituan/stores` | 门店映射 |
| | `POST /meituan/stores` | 绑定门店 |
| | `GET /shops` | 平台门店列表 |

### 抖音核销

| 页面 | API 调用 | 说明 |
|------|---------|------|
| `Douyin/Dashboard.vue` | `GET /douyin/dashboard` | KPI + 趋势 + 分布 |
| `Douyin/Records.vue` | `GET /douyin/records` | 验券列表 |
| `Douyin/Settlement.vue` | `GET /douyin/settlements` | 结算列表 |
| | `POST /douyin/settlements/trigger` | 触发结算 |
| `Douyin/Config.vue` | `GET /douyin/config` / `PUT /douyin/config` | API 配置 |
| | `GET /douyin/stores` | POI 映射 |
| | `POST /douyin/stores` | 绑定 POI |

---

## 小程序端

### 管理端 `mini-admin/`

| 页面 | API 调用 | 说明 |
|------|---------|------|
| `pages/index/index` | `GET /parks` | 园区名称 |
| | `GET /stats/sales` / `GET /stats/flow` | 今日数据 |
| `pages/shops/shops` | `GET /shops` | 商户列表 |
| `pages/scan/scan` | `POST /orders/:id/verify` | 订单核销 |
| | `GET /meituan/records` | 美团验券 |
| | `GET /douyin/records` | 抖音验券 |
| `pages/messages/messages` | — | 本地数据 |
| `pages/me/me` | — | 本地存储 |

### 商户端 `mini-merchant/`

| 页面 | API 调用 | 说明 |
|------|---------|------|
| `pages/dashboard/dashboard` | — | 本地模拟 |
| `pages/orders/orders` | `GET /orders` | 订单列表（按状态筛选） |
| `pages/verify/verify` | 同管理端扫码 | 4 模式核销 |
| `pages/finance/finance` | `GET /finance/withdraws` | 提现记录 |
| `pages/me/me` | — | 本地存储 |
| `pages/menu/menu` | — | 本地数据 |
| `pages/business/business` | — | 本地模拟数据 |
| `pages/withdraw-account/..` | — | 本地数据 |

### 客户端 `mini-client/`

| 页面 | API 调用 | 说明 |
|------|---------|------|
| `app.js` | `POST /auth/wx-login` | 微信静默登录 |
| `pages/index/index` | — | 本地产品数据 |
| `pages/categories/categories` | — | 本地分类数据 |
| `pages/product/product` | — | 本地产品 |
| `pages/cart/cart` | — | 本地状态 |
| `pages/checkout/checkout` | `POST /orders` | 提交订单 |
| `pages/recharge/recharge` | `wx.requestPayment` | 微信支付 |
| `pages/member-qr/member-qr` | — | 本地 + 30s 刷新 |
| `pages/activities/activities` | `GET /activities` | 活动列表 |
| `pages/gate/gate` | — | `wx.scanCode` |
| `pages/me/me` | — | 本地存储 |

---

## API Wrapper 映射

前端 `src/api/` 封装了后端调用：

| 文件 | 对应路由组 |
|------|-----------|
| `auth.ts` | `/auth/*` |
| `parks.ts` | `/parks/*` |
| `shops.ts` | `/shops/*` |
| `users.ts` | `/users/*` |
| `orders.ts` | `/orders/*` + `/refunds/*` |
| `finance.ts` | `/finance/*` |
| `stats.ts` | `/stats/*` |
| `meituan.ts` | `/meituan/*` |
| `douyin.ts` | `/douyin/*` |
| `request.ts` | axios 实例 + interceptors |

其余页面（employee / gate / activity / permission / settings / logs）直接使用 `request` 实例调用，无独立 API wrapper 文件。
