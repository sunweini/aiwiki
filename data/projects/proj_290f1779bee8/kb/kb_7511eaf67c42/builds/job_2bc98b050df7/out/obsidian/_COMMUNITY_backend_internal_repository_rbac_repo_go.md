---
type: community
cohesion: 0.10
members: 25
---

# backend_internal_repository_rbac_repo_go

**Cohesion:** 0.10 - loosely connected
**Members:** 25 nodes

## Members
- [[.GetAllPermissions()]] - code - backend/internal/service/rbac_service.go
- [[.GetPermissionsByRole()]] - code - backend/internal/repository/rbac_repo.go
- [[.GetRoleByCode()]] - code - backend/internal/repository/rbac_repo.go
- [[.buildMenu()]] - code - backend/internal/service/rbac_service.go
- [[.filterMenu()]] - code - backend/internal/service/rbac_service.go
- [[EmployeeList.vue]] - code - docs/INTEGRATION.md
- [[Loginindex.vue]] - code - docs/INTEGRATION.md
- [[MenuItem]] - code - backend/internal/service/rbac_service.go
- [[NewRBACRepo()]] - code - backend/internal/repository/rbac_repo.go
- [[NewRBACService()]] - code - backend/internal/service/rbac_service.go
- [[Permissionindex.vue]] - code - docs/INTEGRATION.md
- [[PermissionAction]] - code - backend/internal/service/rbac_service.go
- [[PermissionInfo]] - code - backend/internal/repository/rbac_repo.go
- [[RBACHandler]] - code - backend/internal/handler/rbac.go
- [[RBACRepo]] - code - backend/internal/repository/rbac_repo.go
- [[RBACService]] - code - backend/internal/service/rbac_service.go
- [[Sidebar.vue]] - code - docs/INTEGRATION.md
- [[auth.ts]] - code - docs/INTEGRATION.md
- [[getMenu()]] - code - web-admin/src/api/auth.ts
- [[listRoles()]] - code - web-admin/src/api/auth.ts
- [[menu.ts]] - code - web-admin/src/store/menu.ts
- [[mini-client]] - code - docs/INTEGRATION.md
- [[rbac_repo.go]] - code - backend/internal/repository/rbac_repo.go
- [[useAuthStore]] - code - web-admin/src/store/auth.ts
- [[useMenuStore]] - code - web-admin/src/store/menu.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/backend_internal_repository_rbac_repo_go
SORT file.name ASC
```

## Connections to other communities
- 7 edges to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 2 edges to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 2 edges to [[_COMMUNITY_yfsc_platform_v2_meituan_assets_pc_data_js]]
- 1 edge to [[_COMMUNITY_response_response_test_testforbidden]]
- 1 edge to [[_COMMUNITY_web_admin_src_components_layout_viewswitch_vue]]
- 1 edge to [[_COMMUNITY_repository_refundrepo_reject]]
- 1 edge to [[_COMMUNITY_integration_admin_order_list]]

## Top bridge nodes
- [[auth.ts]] - degree 11, connects to 3 communities
- [[RBACService]] - degree 12, connects to 2 communities
- [[listRoles()]] - degree 6, connects to 1 community
- [[RBACRepo]] - degree 6, connects to 1 community
- [[getMenu()]] - degree 5, connects to 1 community