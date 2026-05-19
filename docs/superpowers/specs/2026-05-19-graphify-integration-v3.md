# AI Code 多知识库平台 V3 — graphify 真实对接设计

> 基于 graphify Python API，将平台 runner 和 MCP Gateway 从 skeleton 升级为真实知识抽取、构建、导出、查询链路。

## 1. 目标

V2 闭环已打通（API contract + 前端）。V3 核心目标是让 graphify 引擎真实参与：
- runner 真正调用 graphify AST extraction / semantic extraction / build / cluster / export
- MCP Gateway 真正加载 active graph.json 执行 query/path/explain
- 每个 KB 可选配独立 LLM backend
- 全套 artifact（obsidian vault / wiki / svg / graphml / neo4j）真实产出

## 2. 集成策略

| 层 | 方式 | 理由 |
|-----|------|------|
| Runner extract/cluster/export | Python `import graphify` 内部模块 | 拿全套 artifact |
| MCP query/path/explain | Python `import graphify` 内部模块 | 性能，版本绑定可接受 |
| LLM 配置 | KnowledgeBase 粒度可选配 | source 共用 KB 的 LLM backend |

## 3. graphify Python API 接口映射

以下映射已于 2026-05-19 通过 `import graphify` + `inspect.signature()` 逐项验证。

### 3.1 萃取 → 构建 → 聚类 → 分析

| 步骤 | 模块 | 签名 |
|------|------|------|
| AST + Semantic extraction | `graphify.extract` | `extract(paths: list[Path], cache_root: Path \| None, *, parallel: bool, max_workers: int \| None) -> dict` |
| LLM backend | `graphify.llm` | `BACKENDS` dict + `detect_backend(name)` + `extract_files_direct(files, ...)` |
| Build graph | `graphify.build` | `build(extractions: list[dict], *, directed: bool, dedup: bool, dedup_llm_backend: str \| None) -> nx.Graph` |
| Cluster | `graphify.cluster` | `cluster(G: nx.Graph) -> dict[int, list[str]]` |
| Community scores | `graphify.cluster` | `score_all(G: nx.Graph, communities: dict[int, list[str]]) -> dict[int, float]` |
| God nodes | `graphify.analyze` | `god_nodes(G: nx.Graph, top_n: int) -> list[dict]` |
| Surprising connections | `graphify.analyze` | `surprising_connections(G: nx.Graph, communities: dict, top_n: int) -> list[dict]` |
| Suggested questions | `graphify.analyze` | `suggest_questions(G: nx.Graph, communities: dict, community_labels: dict, top_n: int) -> list[dict]` |

### 3.2 导出

| 产物 | 模块 | 签名 |
|------|------|------|
| graph.json | `graphify.export` | `to_json(G: nx.Graph, output_path: str) -> None` |
| graph.html | `graphify.export` | `generate_html(G, communities, output_path, community_labels?, member_counts?, node_limit?)` 或 `to_html(...)` |
| GRAPH_REPORT.md | `graphify.report` | `generate(G, communities, cohesion_scores, community_labels, god_node_list, surprise_list, detection_result, token_cost, root, suggested_questions?, min_community_size?, built_at_commit?) -> str` |
| Obsidian vault | `graphify.export` | `to_obsidian(G, communities, output_dir, community_labels?, cohesion?) -> int`（产出 note 文件数） |
| Wiki | `graphify.wiki` | `to_wiki(G, communities, output_dir, community_labels?, cohesion?, god_nodes_data?) -> int` |
| SVG | `graphify.export` | `to_svg(G, communities, output_path, labels_path?) — matplotlib spring layout` |
| GraphML | `graphify.export` | `to_graphml(G, communities, output_path) -> None` |
| JSON Canvas | `graphify.export` | `to_canvas(G, communities, output_path, community_labels?, node_filenames?) — Obsidian Canvas 格式` |
| Cypher dump | `graphify.export` | `to_cypher(G, output_path) -> None` |
| Neo4j push | `graphify.export` | `push_to_neo4j(G, uri, user, password, communities?) -> dict[str, int]` |
| Callflow HTML | `graphify.callflow_html` | `write_callflow_html(project, *, graph, report, labels, sections, output, lang, max_sections, diagram_scale, ...) -> Path` — Mermaid 架构调用流图 |
| D3 tree HTML | `graphify.tree_html` | `write_tree_html(graph_path: Path, output_path: Path, *, root?, max_children?, project_label?, top_k_edges?) -> Path` |

### 3.3 查询（⚠️ 私有 API）

| 操作 | 模块 | 签名 |
|------|------|------|
| Query (BFS/DFS) | `graphify.serve` | `_query_graph_text(G: nx.Graph, question: str, *, mode: str, depth: int, token_budget: int, context_filters: list[str] \| None) -> str` |
| Path find | `graphify.serve` | `_score_nodes(G: nx.Graph, terms: list[str]) -> list[tuple[float, str]]` + networkx `shortest_path()` |
| Explain node | `graphify.serve` | `_find_node(G: nx.Graph, label: str) -> list[str]` + `_subgraph_to_text(G, nodes, edges, token_budget, *, seeds?) -> str` |
| MCP stdio server | `graphify.serve` | `serve(graph_path: str) -> None` — 独立进程 MCP server，非平台内调用 |

> **风险：** `_query_graph_text`、`_score_nodes`、`_find_node`、`_subgraph_to_text` 均为 underscore-prefixed 私有函数，graphify 升级可能变更签名或移除。平台应封装一层薄适配器，隔离私有 API。若 graphify 未来暴露稳定 public query API，优先切换。

### 3.4 辅助

| 用途 | 模块 | 签名 |
|------|------|------|
| File detection | `graphify.detect` | `detect(paths)` / `classify_file(path)` |
| URL ingest | `graphify.ingest` | `ingest(url)` / `safe_fetch(url)` |
| Audio/video transcription | `graphify.transcribe` | `transcribe(file)` / `transcribe_all(dir)` |
| Cache | `graphify.cache` | `load_cached` / `save_cached` / `check_semantic_cache` |
| Validation | `graphify.validate` | `assert_valid(graph)` / `validate_extraction(data)` |
| Incremental update | `graphify.build` | `build_merge(new_chunks, graph_path, prune_sources, ...) -> nx.Graph` |

### 3.5 未暴露的预期功能

以下功能在早期 spec 中列出，但当前 graphify 版本无对应 Python public API：
- 单次调用 `build` + `cluster` + `export`（需分步串联）
- MCP query 的 public Python API（当前只有私有函数或 stdio server 进程）
- `export.export_callflow_html`（在 `graphify.callflow_html` 模块中，但非标准 export 入口）

实现时 pipeline 需自行串联步骤，详见 §5。

### 3.6 `graphify-input/` 格式要求

`graphify.extract.extract(paths: list[Path])` 接受文件路径列表，不要求特定目录布局。Stage 3 (Normalize Inputs) 只需：
1. 递归收集 `source-materials/` 下所有 source 文件到 `list[Path]`
2. 传给 `extract(paths=...)`

graphify 内部 `detect.classify_file()` 会按扩展名自动分类（code / doc / paper / image / video / office），无需平台预分类。

注意：图片/视频/office 文件由 graphify 内置的 transcription/OCR 管线处理。若 source 含大量此类文件，extract 耗时可能显著增长。

### 3.7 graphify import 失败处理

若 `import graphify` 失败（未安装 / 版本不兼容 / 依赖缺失）：

**Runner 侧：**
- Stage 4 整阶段跳过
- build job 标记 `status=failed`，`error_summary="graphify module not available"`
- 不生成 release，不切换 active release
- workspace 保留 7 天用于排查

**MCP 侧：**
- MCPGatewayService 初始化时检测 graphify 可用性
- 若不可用 → 所有查询返回 `error_code=graph_corrupted`，`retryable=false`
- MCP `kb_status` 的 `graph_status` 返回 `"graphify_unavailable"`

## 4. LLM 配置模型

### 4.1 KnowledgeBase 扩展字段

```
llm_backend: str | None
  # claude | openai | ollama | gemini | deepseek | bedrock | kimi | claude-cli
  # 也支持自定义 backend 名——runner 启动时注入 graphify.llm.BACKENDS
  # None = 仅 AST，不做 semantic extraction

llm_api_key_ref: str | None
  # credential reference，不存明文
  # "env:OPENAI_API_KEY" → os.environ["OPENAI_API_KEY"]
  # "vault:openai-prod-key" → credential store 查（V3 未实现，fallback 返回 None）

llm_model_override: str | None
  # 如 "gpt-4o", "claude-sonnet-4-6", "deepseek-chat"
  # None = 用 graphify 默认模型

llm_extraction_budget: int | None
  # 单 chunk token 上限
  # None = graphify 默认 60000

llm_base_url_override: str | None
  # 覆盖 BACKENDS 中的 base_url
  # 用于自定义 OpenAI 兼容 endpoint（如 DeepSeek via https://api.deepseek.com/v1）
  # None = 用 BACKENDS 默认 base_url
```

### 4.2 Credential 解析优先级

1. `llm_api_key_ref` 以 `env:` 开头 → `os.environ["VAR"]`
2. `llm_api_key_ref` 以 `vault:` 开头 → credential store 查（V1 用 DB 加密字段或环境变量兜底）
3. `llm_api_key_ref` 为空 → 读 graphify 约定环境变量（`ANTHROPIC_API_KEY` / `OPENAI_API_KEY` 等）
4. 全空 → semantic extraction 跳过，graph 仅 AST

### 4.3 Runner 注入方式

通过子进程 env dict 或 Python API 参数推 key，不写磁盘明文。

## 5. Runner Stage 改造

### 5.1 Stage 4: Run Graphify

```
输入: workspace/graphify-input/ (Stage 3 产出，graphify 期望的代码/文档文件集合)
输出: workspace/graphify-out/graph.json + 中间产物

graphify 无单一 build 命令，需分步串联。每一步产出都是下一步的输入。

4.1 Extract (AST + Semantic)
    4.1.1 收集 graphify-input/ 下所有文件 → list[Path]
    4.1.2 调用 graphify.extract.extract(paths, cache_root, parallel=True, max_workers)
          → 产出 extraction dict (含 AST nodes + semantic enriched fields)
          NOTE: graphify.extract 内部已包含 AST extraction 和 semantic LLM extraction
          不需要单独调 graphify.llm
    4.1.3 LLM backend 由 graphify 从环境变量自动检测
          平台在 runner 子进程 env 中注入对应 key
    失败 → stage=failed, graph 不可用
    无 LLM key → extract 仍产出 AST nodes（无 semantic 标注）

4.2 Build
    graphify.build.build(extractions: list[dict], directed=False, dedup=True)
    → 产出 nx.Graph
    含: nodes, edges, hyperedges, EXTRACTED/INFERRED/AMBIGUOUS 标注
    失败 → stage=failed, graph 不可用

4.3 Validate
    graphify.validate.assert_valid(graph) / validate_extraction(data)
    失败 → stage=failed

4.4 Cluster
    communities = graphify.cluster.cluster(G)
    cohesion = graphify.cluster.score_all(G, communities)
    失败 → graph 可用, log warning, 不阻断
    可通过 KB 配置跳过（大图性能）

4.5 Analyze
    god_nodes_list = graphify.analyze.god_nodes(G, top_n=10)
    surprise_list = graphify.analyze.surprising_connections(G, communities, top_n=5)
    community_labels = {...}  # 按最大 god node 生成 label
    suggested_qs = graphify.analyze.suggest_questions(G, communities, community_labels, top_n=7)
    失败 → graph 可用, log warning, 跳过单步

4.6 Generate Reports
    report_md = graphify.report.generate(G, communities, cohesion, community_labels,
                                         god_nodes_list, surprise_list, detection_result,
                                         token_cost, root_path, suggested_qs, ...)
    graphify.export.to_html(G, communities, out/"graph.html", community_labels, member_counts)
    graphify.export.to_json(G, out/"graph.json")
    失败 → artifact_status.report/html = degraded, graph 仍可用
```

### 5.2 Stage 5: Export Artifacts

```
5.1 Obsidian Vault Export
    graphify.export.to_obsidian(G, communities, out/"obsidian", community_labels, cohesion)
    → out/obsidian/ 原始 vault（note_count 个 .md 文件）

5.2 Wiki Export
    graphify.wiki.to_wiki(G, communities, out/"wiki", community_labels, cohesion, god_nodes_list)
    → out/wiki/

5.3 Visual Export
    graphify.export.to_svg(G, communities, out/"graph.svg")
    graphify.export.to_graphml(G, communities, out/"graph.graphml")
    graphify.export.to_canvas(G, communities, out/"graph.canvas", community_labels)
    graphify.export.to_cypher(G, out/"neo4j/cypher_dump.cypher")
    graphify.tree_html.write_tree_html(out/"graph.json", out/"GRAPH_TREE.html")
    → 各文件写入 out/

5.4 Obsidian Enhancement (幂等 post-process)
    ObsidianEnhancer.apply(out/obsidian → out/obsidian-enhanced)
    补充: 导航页, 版本信息页, 统一 frontmatter, KB 入口页, 来源元数据
    失败 → vault=degraded, 不影响 graph 可查询性
```

### 5.3 Stage 5.5: Verify Query

```
5.5 Verify Query
    graph.json 加载到 nx.Graph
    用预设问题调用 _query_graph_text 验证图可查
    失败 → graph=degraded, release 仍可激活（不阻断）
```

### 5.4 Stage 6: Register Release

```
6.1 生成 release ID / version
6.2 按固定路径发现 artifact，注册 artifact_version:
    graph.json        → type=graph
    GRAPH_REPORT.md   → type=report
    graph.html        → type=html
    obsidian-enhanced/ → type=vault
    wiki/             → type=wiki
    graph.svg         → type=svg
    graph.graphml     → type=graphml
    logs/             → type=logs
6.3 记录 artifact_status 分项 (ready/degraded/missing/failed)
6.4 写入 stats_json:
    - node_count
    - edge_count
    - cluster_count
    - extraction_duration_ms
    - semantic_extraction_status
```

### 5.5 Stage 7: Activate Or Roll Back

```
7.1 graph.json 存在且非空 → release 可激活
7.2 设置 KB.active_release_id = release.id
7.3 旧 active release 保留（不删除）
7.4 graph 缺失或损坏 → 不生成可激活 release, 旧 release 继续服务
7.5 vault/wiki/html 附属 artifact 失败 → release 可激活, 标记 partial_success/degraded
```

### 5.6 错误降级矩阵

| 失败阶段 | graph 可用性 | release 可激活 | artifact_status |
|---------|------------|-------------|----------------|
| 4.1 Extract | 不可用 | 否 | graph=failed |
| 4.2 Build | 不可用 | 否 | graph=failed |
| 4.3 Validate | 不可用 | 否 | graph=failed |
| 4.4 Cluster | 可用 | 是 | graph=ready（注：cluster 失败不阻断，仅跳过 community 分析） |
| 4.5 Analyze | 可用 | 是 | graph=ready |
| 4.6 Report | 可用 | 是 | report=degraded |
| 5.1 Obsidian | 可用 | 是 | vault=degraded |
| 5.2 Wiki | 可用 | 是 | wiki=degraded |
| 5.3 SVG/GraphML/Canvas/Cypher | 可用 | 是 | svg/graphml/canvas=degraded |
| 5.5 Verify Query | 可用 | 是 | graph=degraded（图不可查） |
| LLM key 缺失 | 可用（仅 AST） | 是 | graph=degraded（无 semantic 标注） |

## 6. MCP Gateway 改造

### 6.1 核心逻辑

```python
import json
import networkx as nx
from networkx.readwrite import json_graph

from graphify.serve import _query_graph_text, _score_nodes, _find_node, _subgraph_to_text


class GraphifyQueryAdapter:
    """封装 graphify 私有查询 API，隔离版本耦合。"""

    @staticmethod
    def load_graph(path: str) -> nx.Graph:
        with open(path) as f:
            raw = json.load(f)
        if "links" not in raw and "edges" in raw:
            raw = dict(raw, links=raw["edges"])
        try:
            return json_graph.node_link_graph(raw, edges="links")
        except TypeError:
            return json_graph.node_link_graph(raw)

    @staticmethod
    def query(G: nx.Graph, question: str, mode="bfs", budget=2000) -> str:
        return _query_graph_text(G, question, mode=mode, depth=2, token_budget=budget)

    @staticmethod
    def path(G: nx.Graph, source_label: str, target_label: str) -> dict:
        src = _score_nodes(G, [t.lower() for t in source_label.split()])
        tgt = _score_nodes(G, [t.lower() for t in target_label.split()])
        if not src or not tgt:
            raise ValueError("Source or target node not found")
        path_nodes = nx.shortest_path(G, src[0][1], tgt[0][1])
        return {"path": path_nodes, "hop_count": len(path_nodes) - 1}

    @staticmethod
    def explain(G: nx.Graph, node_label: str, budget=2000) -> dict:
        nodes = _find_node(G, node_label)
        if not nodes:
            raise ValueError(f"Node '{node_label}' not found")
        neighbors = set()
        for n in nodes[:5]:
            neighbors.update(G.neighbors(n))
        edges = [(u, v) for u, v in G.edges() if u in nodes or v in nodes]
        text = _subgraph_to_text(G, set(nodes) | neighbors, edges, token_budget=budget, seeds=nodes)
        return {"explanation": text, "related_nodes": sorted(neighbors)}


class MCPGatewayService:
    def _load_graph(self, kb_id: str) -> nx.Graph:
        kb = self.repo.get(kb_id)
        if not kb or not kb.active_release_id:
            raise KBNotReadyError(kb_id)
        release = self.release_repo.get(kb.active_release_id)
        artifact = self.artifact_repo.get_by_type(release.id, "graph")
        if not artifact or artifact.status != "ready":
            raise GraphMissingError(kb_id)
        return GraphifyQueryAdapter.load_graph(artifact.path)

    def kb_query(self, kb_id, question, mode="bfs", budget=2000):
        G = self._load_graph(kb_id)
        answer = GraphifyQueryAdapter.query(G, question, mode=mode, budget=budget)
        return {
            "kb_id": kb_id,
            "release_id": self._active_release_id(kb_id),
            "answer": answer,
            "source_locations": [],
            "artifact_refs": self._build_refs(kb_id),
        }
```

### 6.2 私有 API 适配层

`GraphifyQueryAdapter` 是平台和 graphify 私有 API 之间的唯一耦合点：
- 若 graphify 升级变更私有函数签名 → 只改 adapter
- 若 graphify 未来暴露 public query API → adapter 切换调用目标
- adapter 不依赖 graphify 以外的任何模块（纯函数封装）

### 6.3 接口不变，实现置换

`kb_query` / `kb_path` / `kb_explain` 走 `GraphifyQueryAdapter` → `graphify.serve` 私有函数，替代当前 stub/mock 返回。接口 schema 保持 V2 契约不变。

### 6.4 错误语义承继 V2

```
knowledge_base_not_found
knowledge_base_not_ready
active_release_missing
active_graph_missing
graph_corrupted
invalid_query_params
```

### 6.5 图加载性能保护

- 每次查询加载 graph.json 到 `nx.Graph` 内存中，不在请求间缓存（V1 简单方案）
- `_load_graph` 前检查文件大小，超过上限（如 500MB）拒绝加载，返回 `graph_corrupted` 错误
- 后续迭代可加进程级 LRU cache 减少重复加载

## 7. 改造点汇总

| 文件 | 改动 |
|------|------|
| `app/db/models/knowledge_base.py` | +5 LLM 字段 (`llm_backend`, `llm_api_key_ref`, `llm_model_override`, `llm_extraction_budget`, `llm_base_url_override`)，+ `description`, `release_policy` |
| `app/db/models/build_job.py` | + `finished_at` |
| `alembic/versions/..._0002_*.py` | 新 migration |
| `app/schemas/knowledge_base.py` | KnowledgeBaseCreate/Read 加 LLM 字段 |
| `app/services/build_service.py` | enqueue 时传 LLM 配置给 runner |
| `app/runner/graphify_runner.py` | 完全重写：16 阶段真实 pipeline（extract→build→validate→cluster→analyze→report→export→verify→register→activate） |
| `app/runner/obsidian_enhancer.py` | 不变（已有幂等逻辑） |
| `app/services/graphify_query_adapter.py` | **新文件** — 封装 graphify 私有查询 API |
| `app/services/mcp_gateway_service.py` | 改调 GraphifyQueryAdapter，加 `kb_path`/`kb_explain`，加载 graph.json 真实查询 |
| `app/mcp/routes.py` | + `kb_path`/`kb_explain` 端点 |
| `app/api/routes/build_jobs.py` | 注入 WorkspaceManager + GraphifyRunner 到 BuildService |
| `app/services/knowledge_base_service.py` | `create_knowledge_base` 写 LLM 字段 |
| `app/services/artifact_service.py` | release activate 后 artifact_status 查询 |
| `frontend/src/lib/types.ts` | KnowledgeBase 类型加 LLM 字段，ArtifactType 扩展 wiki/svg/graphml/canvas/cypher/logs |
| `frontend/src/app/knowledge-bases/[kbId]/page.tsx` | KB detail 加 LLM config 展示 |
| `backend/tests/*` | 更新测试匹配新 API（stage 格式、llm_config 参数、真实 graph 加载） |

## 8. 不在此范围

- 不在 runner 内直接调 graphify CLI（统一走 Python API）
- 不做 per-source LLM backend（LLM 配置在 KB 粒度）
- 不做 semantic extraction 的实时 streaming
- 不做 embedding / vector retrieval（graphify 原生没有）
- 不做多 KB 合并查询（cross-KB query）
