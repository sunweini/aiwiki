# 架构设计文档

## 系统概览

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                 │
│            http://localhost:3000                      │
│  Dashboard │ KB Detail │ Build Jobs │ Query          │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP REST
┌──────────────────────▼──────────────────────────────┐
│               Backend (FastAPI :8000)                │
│                                                       │
│  API Routes    MCP Endpoints    Services             │
│  ┌──────────┐  ┌──────────┐   ┌──────────────────┐  │
│  │ projects │  │ kb_status│   │ BuildService     │  │
│  │ sources  │  │ kb_list  │   │ MCPGatewayService│  │
│  │ KBs      │  │ kb_query │   │ KnowledgeBaseSvc │  │
│  │ builds   │  │ kb_path  │   │ ArtifactService  │  │
│  │ releases │  │ kb_explain│  │ GraphifyQuery... │  │
│  │ artifacts│  └──────────┘   └──────────────────┘  │
│  └──────────┘                         │              │
│                                       │              │
│  ┌────────────────────────────────────▼───────────┐  │
│  │            GraphifyRunner                      │  │
│  │  16-stage pipeline (see below)                 │  │
│  └────────────────────────────────────────────────┘  │
│                                       │              │
│  ┌────────────────────────────────────▼───────────┐  │
│  │    Repositories → SQLAlchemy → PostgreSQL      │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## GraphifyRunner Pipeline (17 阶段)

```
validate_boundary → resolve_job_context → materialize_sources
    → normalize_inputs → extract → sanitize → build
    → validate → cluster → analyze → report
    → export_obsidian → export_wiki → export_visual
    → enhance_obsidian → verify_query (hard gate)
    → register_release → activate_or_roll_back
```

### 阶段详解

| # | 阶段 | 模块 | 输入 | 输出 | 阻塞 |
|---|------|------|------|------|------|
| 0 | `validate_boundary` | — | — | — | — |
| 1 | `resolve_job_context` | — | job_id, kb_id | — | — |
| 2 | `materialize_sources` | `SourceMaterializer` | source 列表 | `sources/{source_id}/` 目录 | 是 |
| 3 | `normalize_inputs` | — | materialized paths | `graphify-input/` 符号链接 | 是 |
| 4 | `extract` | `graphify.extract` | 源文件 | extraction JSON (nodes+edges) | 是 |
| — | `sanitize` | `_sanitize_extraction` | extraction | 清理 orphan edges | — |
| 5 | `build` | `graphify.build` | extraction | NetworkX Graph | 是 |
| 6 | `validate` | `graphify.validate` | extraction | 验证结果 | 否 |
| 7 | `cluster` | `graphify.cluster` | Graph | communities dict | 否 |
| 8 | `analyze` | `graphify.analyze` | Graph+communities | god_nodes, surprises, questions | 否 |
| 9 | `report` | `graphify.report` | Graph+analysis | `GRAPH_REPORT.md`, `graph.html`, `graph.json` | 否 |
| 10 | `export_obsidian` | `graphify.export` | Graph+communities | Obsidian vault (.md 文件) | 否 |
| 11 | `export_wiki` | `graphify.wiki` | Graph+communities | Wiki 页面 | 否 |
| 12 | `export_visual` | `graphify.export` + `tree_html` | Graph | SVG, GraphML, Canvas, Cypher, Tree HTML | 否 |
| 13 | `enhance_obsidian` | `ObsidianEnhancer` | vault | `index.md` 标记 | 否 |
| 14 | `verify_query` | `GraphifyQueryAdapter` | graph.json | BFS 查询验证 | **是 (hard gate)** |
| 15 | `register_release` | — | graph.json | Release + 8 Artifacts | 是 |
| 16 | `activate_or_roll_back` | `BuildService` | release | KB.active_release_id 更新 | — |

### 错误处理策略

- **阻塞失败** (stage 2-5, 14, 15)：返回 `graph_ready=false`，不注册 release
- **降级** (stage 6-13)：记录 warning，流水线继续
- 降级不影响 release 注册，但 `artifact_status` 中对应 artifact 标记为 `degraded`
- **verify_query (stage 14) 为 hard gate**：3 条中文查询全部通过 + min 节点/边数量检查，任一失败则阻断 release 激活

## 模块关系

```
services/
├── build_service.py          # Build job 编排 + 持久化
│   ├── enqueue_build()       → GraphifyRunner.run()
│   ├── _persist_result()     → Release + ArtifactVersion + KB 更新
│   └── _read_llm_config()    → KB 模型 → LLM 配置
│
├── mcp_gateway_service.py    # MCP 协议实现
│   ├── kb_status/list/query  → GraphifyQueryAdapter
│   └── kb_path/explain       → GraphifyQueryAdapter
│
├── graphify_query_adapter.py # graph.json 查询适配
│   ├── load_graph()          → json → NetworkX Graph
│   ├── query()               → BFS/DFS 遍历
│   ├── path()                → 最短路径
│   └── explain()             → 邻居展开
│
├── knowledge_base_service.py # KB CRUD
├── source_service.py         # Source CRUD
└── artifact_service.py       # Release + Artifact 查询
```

## 数据流

```
用户 → POST /api/knowledge-bases/{kb_id}/builds (202 Accepted)
  │
  ├─ BuildService.create_build_job()    → BuildJob (status=pending)
  ├─ asyncio.create_task(enqueue_build) → 后台异步执行
  │   └─ run_in_executor(None, GraphifyRunner.run)
  │       ├─ SourceMaterializer.materialize()   → 文件复制/ git clone
  │       ├─ graphify.extract()                 → LLM 提取
  │       ├─ graphify.build()                   → NetworkX Graph
  │       ├─ graphify.cluster/analyze/report    → 分析 + 报告
  │       ├─ graphify.export()                  → 8 种 artifact
  │       ├─ verify_query (hard gate)           → 3 条查询验证
  │       └─ return stages + release + artifacts
  │
  └─ BuildService._persist_result()
      ├─ BuildJob.status → completed/failed
      ├─ Release (单条)
      ├─ ArtifactVersion (8 条)
      └─ KnowledgeBase.active_release_id
```

## LLM Backend 注入

自定义 LLM backend 通过 `graphify.llm.BACKENDS` 动态注入：

```
_read_llm_config(kb_id) → {llm_backend, api_key, model_override, ...}
  │
  ├─ _inject_custom_backend() → graphify.llm.BACKENDS[name] = {...}
  ├─ os.environ monkeypatch    → ANTHROPIC_API_KEY, OPENAI_API_KEY, DEEPSEEK_API_KEY
  └─ graphify.extract.extract(files, parallel=True)
      └─ ProcessPoolExecutor workers 继承 os.environ
```

## 关键设计决策

| 决策 | 原因 |
|------|------|
| Build job 异步执行 | `asyncio.create_task` + `run_in_executor`，HTTP 请求不阻塞 |
| 边界隔离 (Stage 0) | SourceMaterializer copy-into 架构保证 aiwiki 自身代码不参与提取 |
| verify_query hard gate | 确保每次 release 的图都能通过基本查询验证 |
| validate 非阻塞 | stdlib edge refs 无法避免（如 `dataclasses`/`typing`） |
| 单一事务持久化 | Release + Artifacts + KB 要么全成功要么全失败 |
| extract 后清理 orphan edges | graphify 可能生成指向外部模块的边 |
| normalize 保留目录结构 | Python package 需要 `__init__.py` 层级 |
| obsidian/wiki 用 git 管理 | release_id tag 实现版本追踪，rsync 同步内容 |
