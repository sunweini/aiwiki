---
type: community
cohesion: 0.33
members: 6
---

# repository_paymentrepo_findbyshopandplatform

**Cohesion:** 0.33 - loosely connected
**Members:** 6 nodes

## Members
- [[.FindByShopAndPlatform()]] - code - backend/internal/repository/payment_repo.go
- [[.ListByShop()]] - code - backend/internal/repository/payment_repo.go
- [[.UpdateSecrets()]] - code - backend/internal/repository/payment_repo.go
- [[.Upsert()]] - code - backend/internal/repository/payment_repo.go
- [[NewPaymentRepo()]] - code - backend/internal/repository/payment_repo.go
- [[PaymentRepo]] - code - backend/internal/repository/payment_repo.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/repository_paymentrepo_findbyshopandplatform
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_backend_internal_repository_order_repo_go]]

## Top bridge nodes
- [[NewPaymentRepo()]] - degree 2, connects to 1 community