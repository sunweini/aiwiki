# service_rbacservice_updaterolepermissions

> 30 nodes · cohesion 0.09

## Key Concepts

- **RBACService** (12 connections) — `backend/internal/service/rbac_service.go`
- **listRoles()** (6 connections) — `web-admin/src/api/auth.ts`
- **RBACRepo** (6 connections) — `backend/internal/repository/rbac_repo.go`
- **auth.ts** (6 connections) — `web-admin/src/api/auth.ts`
- **getMenu()** (5 connections) — `web-admin/src/api/auth.ts`
- **.SetRolePermissions()** (5 connections) — `backend/internal/repository/rbac_repo.go`
- **employee.go** (4 connections) — `backend/internal/model/employee.go`
- **PermissionHandler** (4 connections) — `backend/internal/handler/permission.go`
- **Permission** (4 connections) — `backend/internal/model/permission.go`
- **.ListAllPermissions()** (4 connections) — `backend/internal/repository/rbac_repo.go`
- **.UpdateRolePermissions()** (4 connections) — `backend/internal/service/rbac_service.go`
- **rbac_repo.go** (3 connections) — `backend/internal/repository/rbac_repo.go`
- **RBACHandler** (3 connections) — `backend/internal/handler/rbac.go`
- **Employee** (3 connections) — `backend/internal/model/employee.go`
- **.buildMenu()** (3 connections) — `backend/internal/service/rbac_service.go`
- **NewEmployeeHandler()** (2 connections) — `backend/internal/handler/employee.go`
- **NewPermissionHandler()** (2 connections) — `backend/internal/handler/permission.go`
- **NewRBACRepo()** (2 connections) — `backend/internal/repository/rbac_repo.go`
- **.GetRoleByCode()** (2 connections) — `backend/internal/repository/rbac_repo.go`
- **MenuItem** (2 connections) — `backend/internal/service/rbac_service.go`
- **NewRBACService()** (2 connections) — `backend/internal/service/rbac_service.go`
- **.filterMenu()** (2 connections) — `backend/internal/service/rbac_service.go`
- **menu.ts** (2 connections) — `web-admin/src/store/menu.ts`
- **CreateEmployeeRequest** (1 connections) — `backend/internal/handler/employee.go`
- **PermissionInfo** (1 connections) — `backend/internal/repository/rbac_repo.go`
- *... and 5 more nodes in this community*

## Relationships

- No strong cross-community connections detected

## Source Files

- `backend/internal/handler/employee.go`
- `backend/internal/handler/permission.go`
- `backend/internal/handler/rbac.go`
- `backend/internal/model/employee.go`
- `backend/internal/model/permission.go`
- `backend/internal/repository/rbac_repo.go`
- `backend/internal/service/rbac_service.go`
- `web-admin/src/api/auth.ts`
- `web-admin/src/store/auth.ts`
- `web-admin/src/store/menu.ts`

## Audit Trail

- EXTRACTED: 82 (86%)
- INFERRED: 13 (14%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*