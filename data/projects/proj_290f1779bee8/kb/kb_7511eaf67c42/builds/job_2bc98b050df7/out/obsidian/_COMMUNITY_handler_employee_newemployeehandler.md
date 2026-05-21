---
type: community
cohesion: 0.67
members: 3
---

# handler_employee_newemployeehandler

**Cohesion:** 0.67 - moderately connected
**Members:** 3 nodes

## Members
- [[CreateEmployeeRequest]] - code - backend/internal/handler/employee.go
- [[NewEmployeeHandler()]] - code - backend/internal/handler/employee.go
- [[employee.go]] - code - backend/internal/model/employee.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/handler_employee_newemployeehandler
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 1 edge to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 1 edge to [[_COMMUNITY_yfsc_platform_v2_meituan_assets_pc_data_js]]

## Top bridge nodes
- [[employee.go]] - degree 4, connects to 2 communities
- [[NewEmployeeHandler()]] - degree 2, connects to 1 community