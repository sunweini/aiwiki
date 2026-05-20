---
type: community
cohesion: 0.18
members: 12
---

# api_users_getuserrecharges

**Cohesion:** 0.18 - loosely connected
**Members:** 12 nodes

## Members
- [[auth.js]] - code - mini-admin/utils/auth.js
- [[createUser()]] - code - web-admin/src/api/users.ts
- [[getEmployee()]] - code - mini-merchant/utils/utils/auth.js
- [[getShop()]] - code - web-admin/src/api/shops.ts
- [[getToken()]] - code - mini-merchant/utils/auth.js
- [[getUser()]] - code - web-admin/src/api/users.ts
- [[getUserRecharges()]] - code - web-admin/src/api/users.ts
- [[getUserStats()]] - code - web-admin/src/api/users.ts
- [[isLoggedIn()]] - code - mini-merchant/utils/auth.js
- [[listUsers()]] - code - web-admin/src/api/users.ts
- [[updateUser()]] - code - web-admin/src/api/users.ts
- [[users.ts]] - code - web-admin/src/api/users.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/api_users_getuserrecharges
SORT file.name ASC
```

## Connections to other communities
- 2 edges to [[_COMMUNITY_mini_merchant_pages_finance_finance_js]]
- 2 edges to [[_COMMUNITY_service_auth_service_test_testauthservice_login_wrongpassword]]
- 1 edge to [[_COMMUNITY_payment_provider_test_testnewverificationproviderunsupported]]
- 1 edge to [[_COMMUNITY_mini_merchant_pages_withdraw_account_withdraw_account_js]]
- 1 edge to [[_COMMUNITY_service_douyinservice_querycouponfromplatform]]
- 1 edge to [[_COMMUNITY_mini_admin_pages_index_index_js]]

## Top bridge nodes
- [[auth.js]] - degree 10, connects to 3 communities
- [[users.ts]] - degree 7, connects to 1 community
- [[getToken()]] - degree 3, connects to 1 community
- [[getShop()]] - degree 2, connects to 1 community