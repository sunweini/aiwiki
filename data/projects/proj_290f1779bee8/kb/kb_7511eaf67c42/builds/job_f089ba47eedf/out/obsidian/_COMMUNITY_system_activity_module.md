---
type: community
cohesion: 0.33
members: 6
---

# system_activity_module

**Cohesion:** 0.33 - loosely connected
**Members:** 6 nodes

## Members
- [[Activity Module]] - concept - docs/superpowers/plans/2026-05-15-phase3-dashboard-ops.md
- [[Employee Module]] - concept - docs/superpowers/plans/2026-05-15-phase3-dashboard-ops.md
- [[Finance Module]] - concept - docs/superpowers/specs/2026-05-15-yuanfu-platform-v2-design.md
- [[Order Module]] - concept - docs/superpowers/specs/2026-05-15-yuanfu-platform-v2-design.md
- [[Shop Module]] - concept - docs/superpowers/specs/2026-05-15-yuanfu-platform-v2-design.md
- [[User Module]] - concept - docs/superpowers/specs/2026-05-15-yuanfu-platform-v2-design.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/system_activity_module
SORT file.name ASC
```
