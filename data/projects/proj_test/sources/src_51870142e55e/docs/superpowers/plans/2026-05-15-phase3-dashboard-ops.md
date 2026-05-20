# Phase 3: 数据看板 + 运营模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 完成数据看板（ECharts 图表）、销售统计、客流统计、员工管理、闸机管理、活动管理、权限管理、小程序配置、系统设置页面 + 后端对应 API。

**Architecture:** 后端扩展 handler/service/repository 覆盖运营模块。前端集成 ECharts 实现折线图/柱状图/饼图/热力图。

**Tech Stack:** Go + Gin + GORM、ECharts 5.5 + Element Plus

---

## Task 1: 后端 — 销售统计 + 客流统计 API

**Files:**
- Create: `backend/internal/service/stats_service.go`
- Create: `backend/internal/handler/stats.go`
- Create: `backend/internal/repository/stats_repo.go`
- Update: `backend/internal/router/router.go`

**API endpoints:**
```
GET /api/v1/stats/sales?start_date=&end_date=&shop_id=  # 销售概览
GET /api/v1/stats/sales/trend?period=day|week|month      # 销售趋势
GET /api/v1/stats/sales/by-shop                          # 按店铺分布
GET /api/v1/stats/flow?start_date=&end_date=&park_id=    # 客流概览
GET /api/v1/stats/flow/trend?period=day|week|month       # 客流趋势
GET /api/v1/stats/flow/heatmap                           # 24h 热力图
GET /api/v1/stats/user-growth                            # 用户增长
```

---

## Task 2: 后端 — 员工/岗位/权限/闸机/活动 API

**Files:**
- Create: `backend/internal/repository/employee_repo.go` (extend with position methods)
- Create: `backend/internal/service/position_service.go`
- Create: `backend/internal/service/permission_service.go`
- Create: `backend/internal/service/gate_service.go`
- Create: `backend/internal/service/activity_service.go`
- Create: `backend/internal/handler/employee.go` (add position management)
- Create: `backend/internal/handler/permission.go`
- Create: `backend/internal/handler/gate.go`
- Create: `backend/internal/handler/activity.go`

**API endpoints:**
```
# Employee/Position (extend existing)
GET  /api/v1/employees/positions
POST /api/v1/employees/positions
PUT  /api/v1/employees/positions/:id

# Permissions
GET  /api/v1/permissions
GET  /api/v1/permissions/roles/:id
PUT  /api/v1/permissions/roles/:id

# Gates
GET  /api/v1/gates
POST /api/v1/gates
PUT  /api/v1/gates/:id
GET  /api/v1/gates/:id/entries

# Activities
GET  /api/v1/activities
POST /api/v1/activities
PUT  /api/v1/activities/:id
DELETE /api/v1/activities/:id
GET  /api/v1/activities/:id/stats
```

---

## Task 3: 后端 — 小程序配置 + 系统设置 + 日志

**Files:**
- Create: `backend/internal/handler/settings.go`
- Create: `backend/internal/handler/mp_config.go`
- Create: `backend/internal/handler/logs.go`

**API endpoints:**
```
GET  /api/v1/settings/mp-config
PUT  /api/v1/settings/mp-config
GET  /api/v1/logs?page=&page_size=&module=
```

---

## Task 4: 前端 — 数据看板页面（ECharts 集成）

**Files:**
- Create: `web-admin/src/views/Databoard/index.vue`
- Create: `web-admin/src/views/SalesStats/index.vue`
- Create: `web-admin/src/views/FlowStats/index.vue`
- Update: `web-admin/src/router/index.ts`
- Update: `web-admin/src/api/stats.ts`

---

## Task 5: 前端 — 运营模块页面

**Files:**
- Create: `web-admin/src/views/Employee/List.vue` (with position management)
- Create: `web-admin/src/views/Gate/List.vue`
- Create: `web-admin/src/views/Activity/List.vue`
- Create: `web-admin/src/views/Activity/Create.vue`
- Create: `web-admin/src/views/Permission/index.vue`
- Create: `web-admin/src/views/Settings/index.vue`
- Create: `web-admin/src/views/Settings/MPConfig.vue`
- Create: `web-admin/src/views/Logs/index.vue`
- Update: `web-admin/src/router/index.ts`
- Update: `web-admin/src/api/` (employee, gate, activity, permission, settings, logs)
