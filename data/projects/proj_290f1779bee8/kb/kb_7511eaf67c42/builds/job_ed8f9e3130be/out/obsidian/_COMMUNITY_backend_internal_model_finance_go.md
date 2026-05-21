---
type: community
cohesion: 0.50
members: 4
---

# backend_internal_model_finance_go

**Cohesion:** 0.50 - moderately connected
**Members:** 4 nodes

## Members
- [[NewFinanceHandler()]] - code - backend/internal/handler/finance.go
- [[Reconciliation]] - code - backend/internal/model/finance.go
- [[WithdrawApplication]] - code - backend/internal/model/finance.go
- [[finance.go]] - code - backend/internal/model/finance.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/backend_internal_model_finance_go
SORT file.name ASC
```

## Connections to other communities
- 2 edges to [[_COMMUNITY_backend_internal_model_douyin_go]]
- 1 edge to [[_COMMUNITY_yfsc_platform_v2_meituan_assets_pc_data_js]]
- 1 edge to [[_COMMUNITY_repository_financerepo_createreconciliation]]
- 1 edge to [[_COMMUNITY_response_response_test_testunauthorized]]

## Top bridge nodes
- [[WithdrawApplication]] - degree 3, connects to 2 communities
- [[finance.go]] - degree 4, connects to 1 community
- [[NewFinanceHandler()]] - degree 2, connects to 1 community
- [[Reconciliation]] - degree 2, connects to 1 community