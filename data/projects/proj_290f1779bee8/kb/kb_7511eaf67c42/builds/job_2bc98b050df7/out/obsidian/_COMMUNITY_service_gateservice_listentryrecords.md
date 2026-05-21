---
type: community
cohesion: 0.22
members: 9
---

# service_gateservice_listentryrecords

**Cohesion:** 0.22 - loosely connected
**Members:** 9 nodes

## Members
- [[.CreateGate()]] - code - backend/internal/service/gate_service.go
- [[.DeleteGate()]] - code - backend/internal/service/gate_service.go
- [[.FindGate()]] - code - backend/internal/service/gate_service.go
- [[.GetGateEntries()]] - code - backend/internal/service/gate_service.go
- [[.ListEntryRecords()]] - code - backend/internal/service/gate_service.go
- [[.ListFaceRecords()]] - code - backend/internal/service/gate_service.go
- [[.ListGates()]] - code - backend/internal/service/gate_service.go
- [[GateService]] - code - backend/internal/service/gate_service.go
- [[NewGateService()]] - code - backend/internal/service/gate_service.go

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/service_gateservice_listentryrecords
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_backend_internal_repository_stats_repo_go]]
- 1 edge to [[_COMMUNITY_service_activity_service_newactivityservice]]

## Top bridge nodes
- [[GateService]] - degree 10, connects to 1 community
- [[NewGateService()]] - degree 2, connects to 1 community
- [[.FindGate()]] - degree 2, connects to 1 community