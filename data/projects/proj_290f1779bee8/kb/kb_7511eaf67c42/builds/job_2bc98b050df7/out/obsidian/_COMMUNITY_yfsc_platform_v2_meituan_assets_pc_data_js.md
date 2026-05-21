---
type: community
cohesion: 0.06
members: 61
---

# yfsc_platform_v2_meituan_assets_pc_data_js

**Cohesion:** 0.06 - loosely connected
**Members:** 61 nodes

## Members
- [[.TableName()]] - code - backend/internal/model/park.go
- [[DOUYIN_STORE_CONFIGS]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[EMPLOYEES]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[FULL_MENU]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[FaceRecord]] - code - backend/internal/model/gate.go
- [[MEITUAN_STORE_CONFIGS]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[MENU_VISIBILITY]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[MINI_PROGRAMS]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[NewGateHandler()]] - code - backend/internal/handler/gate.go
- [[NewParkHandler()]] - code - backend/internal/handler/park.go
- [[NewPermissionHandler()]] - code - backend/internal/handler/permission.go
- [[NewShopHandler()]] - code - backend/internal/handler/shop.go
- [[ORDERS]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[PARKS]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[PARK_FINANCE]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[RECHARGES]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[ROLES]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[SHOPS]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[USERS]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[VIEW_TITLES]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[VIEW_TO_ROLE]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[WITHDRAW_HISTORY]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[activity]] - concept - docs/ER.md
- [[douyin.go]] - code - backend/internal/model/douyin.go
- [[douyin_api_config]] - concept - docs/ER.md
- [[douyin_settlement]] - concept - docs/ER.md
- [[douyin_store_mapping]] - concept - docs/ER.md
- [[douyin_verify_record]] - concept - docs/ER.md
- [[employee]] - concept - docs/ER.md
- [[finance.go]] - code - backend/internal/model/finance.go
- [[gate.go]] - code - backend/internal/model/gate.go
- [[gate_device]] - concept - docs/ER.md
- [[gate_entry_record]] - concept - docs/ER.md
- [[getCurrentShop()]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[meituan.go]] - code - backend/internal/model/meituan.go
- [[meituan_api_config]] - concept - docs/ER.md
- [[meituan_settlement]] - concept - docs/ER.md
- [[meituan_store_mapping]] - concept - docs/ER.md
- [[meituan_verify_record]] - concept - docs/ER.md
- [[mini_program_config]] - concept - docs/ER.md
- [[operation_log]] - concept - docs/ER.md
- [[order]] - concept - docs/ER.md
- [[park]] - concept - docs/ER.md
- [[park.go]] - code - backend/internal/model/park.go
- [[payment.go]] - code - backend/internal/model/payment.go
- [[payment_config]] - concept - docs/ER.md
- [[pc-data.js]] - code - yfsc-platform-v2-meituan/assets/pc-data.js
- [[permission]] - concept - docs/ER.md
- [[recharge_record]] - concept - docs/ER.md
- [[reconciliation]] - concept - docs/ER.md
- [[refund_record]] - concept - docs/ER.md
- [[role]] - concept - docs/ER.md
- [[role.go]] - code - backend/internal/model/role.go
- [[role_permission]] - concept - docs/ER.md
- [[shop]] - concept - docs/ER.md
- [[shop.go]] - code - backend/internal/model/shop.go
- [[shop_type]] - concept - docs/ER.md
- [[shop_type.go]] - code - backend/internal/model/shop_type.go
- [[system.go]] - code - backend/internal/model/system.go
- [[user]] - concept - docs/ER.md
- [[withdraw_application]] - concept - docs/ER.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/yfsc_platform_v2_meituan_assets_pc_data_js
SORT file.name ASC
```

## Connections to other communities
- 7 edges to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 7 edges to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 6 edges to [[_COMMUNITY_web_admin_src_components_layout_viewswitch_vue]]
- 4 edges to [[_COMMUNITY_yfsc_platform_v2_meituan_assets_pc_pages_1_js]]
- 2 edges to [[_COMMUNITY_backend_internal_repository_rbac_repo_go]]
- 1 edge to [[_COMMUNITY_assets_pc_pages_1_switchdataboardperiod]]
- 1 edge to [[_COMMUNITY_mini_merchant_pages_finance_finance_js]]
- 1 edge to [[_COMMUNITY_handler_position_newpositionhandler]]
- 1 edge to [[_COMMUNITY_backend_internal_model_user_go]]
- 1 edge to [[_COMMUNITY_handler_employee_newemployeehandler]]
- 1 edge to [[_COMMUNITY_backend_pkg_payment_provider_go]]
- 1 edge to [[_COMMUNITY_handler_order_newrefundhandler]]
- 1 edge to [[_COMMUNITY_mini_admin_pages_index_index_js]]

## Top bridge nodes
- [[pc-data.js]] - degree 29, connects to 5 communities
- [[employee]] - degree 11, connects to 2 communities
- [[user]] - degree 7, connects to 2 communities
- [[douyin.go]] - degree 6, connects to 2 communities
- [[meituan.go]] - degree 6, connects to 2 communities