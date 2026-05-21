---
type: community
cohesion: 0.22
members: 9
---

# repository_refundrepo_reject

**Cohesion:** 0.22 - loosely connected
**Members:** 9 nodes

## Members
- [[.Refresh()]] - code - backend/internal/handler/auth.go
- [[.Reject()]] - code - backend/internal/repository/refund_repo.go
- [[AuthHandler]] - code - backend/internal/handler/auth.go
- [[fetchSummary()]] - code - mini-merchant/pages/me/me.js
- [[goBusiness()]] - code - mini-merchant/pages/me/me.js
- [[goWithdrawAccount()]] - code - mini-merchant/pages/me/me.js
- [[login()]] - code - web-admin/src/api/auth.ts
- [[logout()]] - code - mini-merchant/pages/me/me.js
- [[me.js]] - code - mini-admin/pages/me/me.js

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/repository_refundrepo_reject
SORT file.name ASC
```

## Connections to other communities
- 4 edges to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 3 edges to [[_COMMUNITY_mini_merchant_pages_finance_finance_js]]
- 2 edges to [[_COMMUNITY_mini_merchant_pages_withdraw_account_withdraw_account_js]]
- 2 edges to [[_COMMUNITY_service_auth_service_test_testauthservice_login_wrongpassword]]
- 1 edge to [[_COMMUNITY_handler_douyinhandler_dashboard]]
- 1 edge to [[_COMMUNITY_assets_pc_pages_1_switchdataboardperiod]]
- 1 edge to [[_COMMUNITY_backend_internal_repository_rbac_repo_go]]

## Top bridge nodes
- [[login()]] - degree 7, connects to 5 communities
- [[me.js]] - degree 7, connects to 3 communities
- [[logout()]] - degree 4, connects to 2 communities
- [[AuthHandler]] - degree 4, connects to 1 community
- [[.Refresh()]] - degree 2, connects to 1 community