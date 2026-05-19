# 数据模型文档

## ER 图

```
┌──────────┐     ┌──────────────┐     ┌─────────────────────┐
│  Project  │────→│   Source     │     │  KnowledgeBase      │
│           │     │              │     │                     │
│ id        │     │ id           │     │ id                  │
│ name      │     │ project_id ──┘     │ project_id ─────────┘
└──────────┘     │ type         │     │ name                │
                 │ source_ref   │     │ status              │
                 │ sync_strategy│     │ visibility          │
                 └──────────────┘     │ active_release_id ──┐
                       │              │ llm_backend         │
                       │              │ llm_api_key_ref     │
                       │ 绑定          │ llm_model_override  │
                       │              └──────────┬──────────┘
                       │                         │
                 ┌─────▼──────────┐              │
                 │  Binding       │              │
                 │  id            │              │
                 │  kb_id ────────┤              │
                 │  source_id ────┘              │
                 └────────────────┘              │
                                                 │
┌──────────┐                          ┌──────────▼──────────┐
│ Release  │←─────────────────────────│  BuildJob           │
│          │                          │                     │
│ id       │                          │ id (job_xxx)        │
│ kb_id    │                          │ kb_id               │
│ build_job│                          │ build_type          │
│ version  │                          │ status              │
│ status   │                          │ release_id ─────────┘
│ artifact │                          │ error_summary       │
│ _status  │                          └─────────────────────┘
└────┬─────┘
     │ 1:N
┌────▼───────────────┐
│  ArtifactVersion   │
│                    │
│ id (art_xxx_yyy)   │
│ release_id         │
│ artifact_type      │
│ artifact_status    │
│ artifact_path      │
└────────────────────┘
```

## 表结构

### projects

| 列 | 类型 | 约束 |
|----|------|------|
| `id` | String | PK |
| `name` | String | NOT NULL |
| `description` | String | nullable |

### sources

| 列 | 类型 | 约束 |
|----|------|------|
| `id` | String (`src_xxx`) | PK |
| `project_id` | String | FK → projects.id |
| `name` | String | NOT NULL |
| `type` | String | `github_repo` / `gitlab_repo` / `doc_site` / `markdown_dir` / `confluence_space` |
| `status` | String | `active` / `inactive` / `error` / `syncing` |
| `source_ref` | String | 路径或 URL |
| `description` | String | nullable |
| `auth_config` | JSON | 认证配置 |
| `sync_strategy` | String | `webhook` / `polling` / `manual` |
| `include_rules` | JSON | 包含规则 (glob patterns) |
| `exclude_rules` | JSON | 排除规则 |
| `normalization_options` | JSON | 标准化选项 |
| `last_synced_at` | DateTime | nullable |
| `created_at` | DateTime | NOT NULL |
| `updated_at` | DateTime | NOT NULL |

### knowledge_bases

| 列 | 类型 | 约束 |
|----|------|------|
| `id` | String (`kb_xxx`) | PK |
| `project_id` | String | FK → projects.id |
| `name` | String | NOT NULL |
| `description` | String | nullable |
| `status` | String | `ready` / `building` / `error` / `empty` |
| `visibility` | String | `private` / `org_shared` / `public` |
| `active_release_id` | String | FK → releases.id, nullable |
| `release_policy` | JSON | `{"activation_mode": "auto_activate" \| "manual_review"}` |
| `llm_backend` | String | `deepseek` / `openai` / `claude` / `ollama` / `gemini` / ... |
| `llm_api_key_ref` | String | `env:VARNAME` 格式 |
| `llm_model_override` | String | 模型名 |
| `llm_extraction_budget` | Integer | max_tokens |
| `llm_base_url_override` | String | API base URL |
| `created_at` | DateTime | NOT NULL |
| `updated_at` | DateTime | NOT NULL |

### knowledge_base_source_bindings

| 列 | 类型 | 约束 |
|----|------|------|
| `id` | String (`bind_xxx`) | PK |
| `knowledge_base_id` | String | FK → knowledge_bases.id |
| `source_id` | String | FK → sources.id |
| `binding_status` | String | `active` / `inactive` / `error` |
| `scope_override` | JSON | |
| `include_rules_override` | JSON | |
| `exclude_rules_override` | JSON | |
| `priority` | Integer | 越小越优先 |

### build_jobs

| 列 | 类型 | 约束 |
|----|------|------|
| `id` | String (`job_xxx`) | PK |
| `knowledge_base_id` | String | FK → knowledge_bases.id |
| `build_type` | String | `full_rebuild` / `incremental_update` |
| `status` | String | `pending` / `running` / `completed` / `failed` / `cancelled` |
| `release_id` | String | FK → releases.id, nullable |
| `triggered_by` | String | `manual` / `webhook` / `schedule` |
| `reason` | String | nullable |
| `error_summary` | String | nullable；失败时记录 |
| `started_at` | DateTime | NOT NULL |
| `finished_at` | DateTime | nullable；完成时记录 |
| `created_at` | DateTime | NOT NULL |

### releases

| 列 | 类型 | 约束 |
|----|------|------|
| `id` | String (`rel_xxx`) | PK |
| `knowledge_base_id` | String | FK → knowledge_bases.id |
| `build_job_id` | String | FK → build_jobs.id |
| `version` | String | 时间戳格式 `YYYYMMDD_HHMMSS` |
| `status` | String | `draft` / `ready` / `active` / `superseded` / `failed` |
| `artifact_status` | JSON | `{"graph": "ready", "report": "degraded", ...}` |
| `created_at` | DateTime | NOT NULL |

### artifact_versions

| 列 | 类型 | 约束 |
|----|------|------|
| `id` | String (`art_rel_xxx_yyy`) | PK |
| `release_id` | String | FK → releases.id |
| `artifact_type` | String | 8 种类型 (见下) |
| `artifact_status` | String | `missing` / `building` / `ready` / `error` |
| `artifact_path` | String | 文件路径 |
| `artifact_meta` | JSON | 元数据 |

Artifact 类型：

| 类型 | 说明 | 输出文件 |
|------|------|----------|
| `graph` | 知识图谱 JSON | `graph.json` |
| `report` | 分析报告 | `GRAPH_REPORT.md` |
| `html` | 图谱可视化 | `graph.html` |
| `obsidian_vault` | Obsidian vault | `obsidian/` 目录 |
| `wiki` | Wiki 文档 | `wiki/` 目录 |
| `svg` | 图谱矢量图 | `graph.svg` |
| `graphml` | GraphML 格式 | `graph.graphml` |
| `logs` | 构建日志 | `logs/` 目录 |

## 状态机

### KB Status

```
empty ──→ building ──→ ready
  ↑                      │
  └──────── error ←──────┘
```

### BuildJob Status

```
pending ──→ running ──→ completed
              │
              ├──→ failed
              └──→ cancelled
```

### Release Status

```
draft ──→ ready ──→ active ──→ superseded
  │                   │
  └──→ failed ←───────┘
```

### Artifact Status

```
missing ──→ building ──→ ready
              │
              └──→ error
```

## ID 命名规范

| 前缀 | 实体 | 示例 |
|------|------|------|
| `proj_` | Project | `proj_delivery_alpha` |
| `src_` | Source | `src_7967b607db94` |
| `kb_` | KnowledgeBase | `kb_f871e0fc2f2b` |
| `bind_` | Binding | `bind_5cc68cca2fa9` |
| `job_` | BuildJob | `job_0898194ed50d` |
| `rel_` | Release | `rel_dc338a7102f1` |
| `art_` | ArtifactVersion | `art_rel_dc338a7102f1_graph` |
