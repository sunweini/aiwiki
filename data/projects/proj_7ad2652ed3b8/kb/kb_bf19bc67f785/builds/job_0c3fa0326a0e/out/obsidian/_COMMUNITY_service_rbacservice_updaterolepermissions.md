---
type: community
cohesion: 0.09
members: 30
---

# service_rbacservice_updaterolepermissions

**Cohesion:** 0.09 - loosely connected
**Members:** 30 nodes

## Members
- [[.GetAllPermissions()]] - code - backend/internal/service/rbac_service.go
- [[.GetPermissionsByRole()]] - code - backend/internal/repository/rbac_repo.go
- [[.GetRoleByCode()]] - code - backend/internal/repository/rbac_repo.go
- [[.ListAllPermissions()]] - code - backend/internal/repository/rbac_repo.go
- [[.SetRolePermissions()]] - code - backend/internal/repository/rbac_repo.go
- [[.UpdateRolePermissions()]] - code - backend/internal/service/rbac_service.go
- [[.buildMenu()]] - code - backend/internal/service/rbac_service.go
- [[.filterMenu()]] - code - backend/internal/service/rbac_service.go
- [[CreateEmployeeRequest]] - code - backend/internal/handler/employee.go
- [[Employee]] - code - backend/internal/model/employee.go
- [[MenuItem]] - code - backend/internal/service/rbac_service.go
- [[NewEmployeeHandler()]] - code - backend/internal/handler/employee.go
- [[NewPermissionHandler()]] - code - backend/internal/handler/permission.go
- [[NewRBACRepo()]] - code - backend/internal/repository/rbac_repo.go
- [[NewRBACService()]] - code - backend/internal/service/rbac_service.go
- [[Permission]] - code - backend/internal/model/permission.go
- [[PermissionAction]] - code - backend/internal/service/rbac_service.go
- [[PermissionHandler]] - code - backend/internal/handler/permission.go
- [[PermissionInfo]] - code - backend/internal/repository/rbac_repo.go
- [[RBACHandler]] - code - backend/internal/handler/rbac.go
- [[RBACRepo]] - code - backend/internal/repository/rbac_repo.go
- [[RBACService]] - code - backend/internal/service/rbac_service.go
- [[auth.ts]] - code - web-admin/src/api/auth.ts
- [[employee.go]] - code - backend/internal/model/employee.go
- [[getMenu()]] - code - web-admin/src/api/auth.ts
- [[listRoles()]] - code - web-admin/src/api/auth.ts
- [[menu.ts]] - code - web-admin/src/store/menu.ts
- [[rbac_repo.go]] - code - backend/internal/repository/rbac_repo.go
- [[useAuthStore]] - code - web-admin/src/store/auth.ts
- [[useMenuStore]] - code - web-admin/src/store/menu.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/service_rbacservice_updaterolepermissions
SORT file.name ASC
```

## Connections to other communities
- 10 edges to [[_COMMUNITY_service_douyinservice_querycouponfromplatform]]
- 4 edges to [[_COMMUNITY_backend_internal_repository_order_repo_go]]
- 2 edges to [[_COMMUNITY_backend_internal_model_shop_type_go]]
- 1 edge to [[_COMMUNITY_backend_internal_handler_rbac_go]]
- 1 edge to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 1 edge to [[_COMMUNITY_service_auth_service_test_testauthservice_login_wrongpassword]]

## Top bridge nodes
- [[auth.ts]] - degree 6, connects to 2 communities
- [[listRoles()]] - degree 6, connects to 1 community
- [[getMenu()]] - degree 5, connects to 1 community
- [[.SetRolePermissions()]] - degree 5, connects to 1 community
- [[employee.go]] - degree 4, connects to 1 community