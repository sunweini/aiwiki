---
type: community
cohesion: 0.20
members: 10
---

# integration_admin_order_list

**Cohesion:** 0.20 - loosely connected
**Members:** 10 nodes

## Members
- [[Logsindex.vue]] - code - docs/INTEGRATION.md
- [[OrderList.vue]] - code - docs/INTEGRATION.md
- [[getOrder()]] - code - web-admin/src/api/orders.ts
- [[handleVerify()]] - code - web-admin/src/views/Order/List.vue
- [[listOrders()]] - code - web-admin/src/api/orders.ts
- [[mini-merchant]] - code - docs/INTEGRATION.md
- [[orders.ts]] - code - docs/INTEGRATION.md
- [[refundOrder()]] - code - web-admin/src/api/orders.ts
- [[submitRefund()]] - code - web-admin/src/views/Order/List.vue
- [[verifyOrder()]] - code - web-admin/src/api/orders.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/integration_admin_order_list
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_mini_admin_pages_index_index_js]]
- 3 edges to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 2 edges to [[_COMMUNITY_web_admin_src_views_park_list_vue]]
- 1 edge to [[_COMMUNITY_web_admin_src_components_layout_viewswitch_vue]]
- 1 edge to [[_COMMUNITY_backend_internal_repository_rbac_repo_go]]

## Top bridge nodes
- [[orders.ts]] - degree 11, connects to 3 communities
- [[handleVerify()]] - degree 3, connects to 2 communities
- [[submitRefund()]] - degree 3, connects to 2 communities
- [[listOrders()]] - degree 2, connects to 1 community
- [[mini-merchant]] - degree 2, connects to 1 community