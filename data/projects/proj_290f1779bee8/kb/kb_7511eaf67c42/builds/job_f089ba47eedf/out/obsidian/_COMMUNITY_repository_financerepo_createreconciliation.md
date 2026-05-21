---
type: community
cohesion: 0.20
members: 16
---

# repository_financerepo_createreconciliation

**Cohesion:** 0.20 - loosely connected
**Members:** 16 nodes

## Members
- [[.CreateReconciliation()]] - code - backend/internal/repository/finance_repo.go
- [[.ListReconciliation()]] - code - backend/internal/repository/finance_repo.go
- [[.RejectWithdraw()]] - code - backend/internal/repository/finance_repo.go
- [[.UpdateWithdrawStatus()]] - code - backend/internal/repository/finance_repo.go
- [[FinanceHandler]] - code - backend/internal/handler/finance.go
- [[FinanceRepo]] - code - backend/internal/repository/finance_repo.go
- [[FinanceService]] - code - backend/internal/service/finance_service.go
- [[NewFinanceRepo()]] - code - backend/internal/repository/finance_repo.go
- [[NewFinanceService()]] - code - backend/internal/service/finance_service.go
- [[approveWithdraw()]] - code - yfsc-platform-v2-meituan/assets/pc-pages-2.js
- [[createWithdraw()]] - code - web-admin/src/api/finance.ts
- [[finance.ts]] - code - web-admin/src/api/finance.ts
- [[getAccount()]] - code - web-admin/src/api/finance.ts
- [[listReconcile()]] - code - web-admin/src/api/finance.ts
- [[listWithdraws()]] - code - web-admin/src/api/finance.ts
- [[reviewWithdraw()]] - code - web-admin/src/api/finance.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/repository_financerepo_createreconciliation
SORT file.name ASC
```

## Connections to other communities
- 9 edges to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 2 edges to [[_COMMUNITY_service_activity_service_newactivityservice]]
- 1 edge to [[_COMMUNITY_yfsc_platform_v2_meituan_assets_pc_pages_1_js]]
- 1 edge to [[_COMMUNITY_backend_internal_model_finance_go]]
- 1 edge to [[_COMMUNITY_service_douyinservice_querycouponfromplatform]]

## Top bridge nodes
- [[listWithdraws()]] - degree 7, connects to 1 community
- [[createWithdraw()]] - degree 6, connects to 1 community
- [[reviewWithdraw()]] - degree 6, connects to 1 community
- [[FinanceHandler]] - degree 6, connects to 1 community
- [[finance.ts]] - degree 6, connects to 1 community