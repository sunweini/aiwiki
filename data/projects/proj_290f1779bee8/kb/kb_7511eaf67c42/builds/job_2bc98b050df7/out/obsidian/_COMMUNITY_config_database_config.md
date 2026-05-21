---
type: community
cohesion: 1.00
members: 2
---

# config_database_config

**Cohesion:** 1.00 - tightly connected
**Members:** 2 nodes

## Members
- [[Database Configuration]] - code - src_fd3313eae8ed/backend/config.yaml
- [[MySQL Docker Service]] - code - src_fd3313eae8ed/backend/docker-compose.yml

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/config_database_config
SORT file.name ASC
```
