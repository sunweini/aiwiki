---
type: community
cohesion: 0.20
members: 10
---

# integration_admin_settings_mp

**Cohesion:** 0.20 - loosely connected
**Members:** 10 nodes

## Members
- [[GateList.vue]] - code - docs/INTEGRATION.md
- [[ParkList.vue]] - code - docs/INTEGRATION.md
- [[SettingsMPConfig.vue]] - code - docs/INTEGRATION.md
- [[createPark()]] - code - web-admin/src/api/parks.ts
- [[deletePark()]] - code - web-admin/src/api/parks.ts
- [[getPark()]] - code - web-admin/src/api/parks.ts
- [[listParks()]] - code - web-admin/src/api/parks.ts
- [[parks.ts]] - code - docs/INTEGRATION.md
- [[togglePark()]] - code - web-admin/src/api/parks.ts
- [[updatePark()]] - code - web-admin/src/api/parks.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/integration_admin_settings_mp
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_web_admin_src_components_layout_viewswitch_vue]]

## Top bridge nodes
- [[parks.ts]] - degree 10, connects to 1 community