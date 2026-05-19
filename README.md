# AI Code Knowledge Archive

基于 [graphify](https://github.com/anthropics/graphify) 的多源知识图谱平台。从代码仓库、文档站点等数据源自动构建知识图谱，提供 Obsidian vault、Wiki、可视化图谱等多种输出，支持 MCP 协议查询。

## 系统概览

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────────┐
│  Source      │────→│  Knowledge   │────→│  Build Job          │
│  (代码/文档)  │     │  Base (KB)   │     │  (graphify 16 阶段) │
└─────────────┘     └──────────────┘     └──────────┬──────────┘
                                                    │
        ┌───────────────────────────────────────────┘
        ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Release     │    │  Artifacts   │    │  MCP Query   │
│  (版本管理)   │    │  (8 种输出)   │    │  (图谱查询)   │
└──────────────┘    └──────────────┘    └──────────────┘
```

**核心流程**：创建 Source → 创建 Knowledge Base → 绑定 Source → 触发 Build → 查看 Release/Artifacts → MCP 查询图谱

---

## 快速开始

### 环境要求

| 组件 | 版本 |
|------|------|
| Python | 3.12+ |
| Node.js | 18+ |
| graphify | 已安装 |

默认使用 SQLite（零配置），可选 PostgreSQL。

### 1. 启动后端

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install fastapi uvicorn sqlalchemy alembic pydantic-settings pytest
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

打开 http://localhost:3000 查看 Dashboard。

### 3. 验证

```bash
# 后端健康检查
curl http://localhost:8000/api/projects

# 运行测试
cd backend && python3 -m pytest tests/ -v  # 51 tests
cd frontend && npx tsc --noEmit             # type check
```

---

## 使用手册

### 第一步：创建 Project 和 Source

Project 是顶级组织单元，Source 是数据来源。

```bash
# 创建 Source（以本地 markdown 目录为例）
curl -X POST http://localhost:8000/api/projects/proj_demo/sources \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "my-codebase",
    "type": "markdown_dir",
    "source_ref": "/path/to/your/code",
    "sync_strategy": "manual"
  }'
```

**Source 类型详解**：

| type | `source_ref` 含义 | 适用场景 |
|------|-------------------|----------|
| `github_repo` | `owner/repo` 格式 | GitHub 仓库 |
| `gitlab_repo` | `owner/repo` 格式 | GitLab 仓库 |
| `doc_site` | 本地目录路径 | 文档站点 |
| `markdown_dir` | 本地目录路径 | Markdown 文件目录 |
| `confluence_space` | Confluence space key | Confluence 空间 |

### 第二步：创建 Knowledge Base 并配置 LLM

Knowledge Base 是知识图谱的容器，需要配置 LLM 后端用于代码提取。

```bash
# 带 DeepSeek LLM 配置创建 KB
curl -X POST http://localhost:8000/api/projects/proj_demo/knowledge-bases \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "My Code KB",
    "visibility": "org_shared",
    "llm_backend": "deepseek",
    "llm_api_key_ref": "env:DEEPSEEK_API_KEY",
    "llm_model_override": "deepseek-v4-flash",
    "llm_extraction_budget": 30000,
    "llm_base_url_override": "https://api.deepseek.com/v1"
  }'
```

**LLM Backend 配置说明**：

| 参数 | 说明 | 示例 |
|------|------|------|
| `llm_backend` | 后端名称 | `deepseek`, `openai`, `claude`, `ollama`, `gemini` |
| `llm_api_key_ref` | API 密钥引用 | `env:DEEPSEEK_API_KEY`（从环境变量读取） |
| `llm_model_override` | 模型名 | `deepseek-v4-flash`, `gpt-4o` |
| `llm_extraction_budget` | 每次提取 token 上限 | `16384`（默认）, `30000` |
| `llm_base_url_override` | API 地址（自定义后端） | `https://api.deepseek.com/v1` |

**内置 backend**：`claude`, `openai`, `ollama`, `gemini`, `kimi`, `bedrock`

**自定义 backend**：任意名称（如 `deepseek`），系统自动注入到 `graphify.llm.BACKENDS`。只需设置 `llm_base_url_override` 和 `llm_model_override` 即可。

**设置 API Key**（在启动后端前）：
```bash
export DEEPSEEK_API_KEY="sk-your-key-here"
export OPENAI_API_KEY="sk-your-key-here"
```

> 无 LLM key 时仍可运行，graph 仅含 AST 信息（降级模式）。

### 第三步：绑定 Source 到 Knowledge Base

```bash
curl -X POST http://localhost:8000/api/knowledge-bases/<KB_ID>/bindings \
  -H 'Content-Type: application/json' \
  -d '{
    "source_id": "<SOURCE_ID>",
    "binding_status": "active"
  }'
```

一个 KB 可绑定多个 Source，按 `priority` 排序处理。

### 第四步：触发 Build

```bash
curl -X POST http://localhost:8000/api/knowledge-bases/<KB_ID>/builds \
  -H 'Content-Type: application/json' \
  -d '{
    "build_type": "full_rebuild",
    "triggered_by": "manual",
    "reason": "initial build"
  }'
```

| build_type | 说明 |
|------------|------|
| `full_rebuild` | 全量重建（默认） |
| `incremental_update` | 增量更新（V2） |

响应包含 `job_id`、`status`、`release_id`。Build 同步执行（V1），完成后立即返回结果。

### 第五步：查看 Release 和 Artifacts

```bash
# Release 列表
curl http://localhost:8000/api/knowledge-bases/<KB_ID>/releases

# 当前活跃 Artifacts
curl http://localhost:8000/api/knowledge-bases/<KB_ID>/artifacts
```

每次成功构建生成一个 Release，包含 8 种 Artifact：

| Artifact | 说明 | 路径示例 |
|----------|------|----------|
| `graph` | 知识图谱 JSON | `graphify-out/graph.json` |
| `report` | 分析报告 | `graphify-out/GRAPH_REPORT.md` |
| `html` | 图谱可视化 | `graphify-out/graph.html` |
| `obsidian_vault` | Obsidian vault | `graphify-out/obsidian/` |
| `wiki` | Wiki 文档 | `graphify-out/wiki/` |
| `svg` | 图谱矢量图 | `graphify-out/graph.svg` |
| `graphml` | GraphML 格式 | `graphify-out/graph.graphml` |
| `logs` | 构建日志 | `logs/` |

### 第六步：MCP 查询知识图谱

#### 查看 KB 状态
```bash
curl -X POST http://localhost:8000/mcp/kb_status \
  -H 'Content-Type: application/json' \
  -d '{"kb_id": "<KB_ID>"}'
```

#### 查询知识图谱
```bash
curl -X POST http://localhost:8000/mcp/kb_query \
  -H 'Content-Type: application/json' \
  -d '{
    "kb_id": "<KB_ID>",
    "query": "list all modules",
    "mode": "bfs",
    "budget": 500
  }'
```

| mode | 说明 |
|------|------|
| `bfs` | 广度优先遍历 |
| `dfs` | 深度优先遍历 |

MCP 查询从 `graph.json` 加载图到内存执行。文件 >500MB 时返回清晰错误而非 OOM。

#### 查询节点路径
```bash
curl -X POST http://localhost:8000/mcp/kb_path \
  -H 'Content-Type: application/json' \
  -d '{
    "kb_id": "<KB_ID>",
    "source": "node_a",
    "target": "node_b"
  }'
```

#### 解释节点
```bash
curl -X POST http://localhost:8000/mcp/kb_explain \
  -H 'Content-Type: application/json' \
  -d '{
    "kb_id": "<KB_ID>",
    "node_id": "checkout_service"
  }'
```

---

## Pipeline 16 阶段详解

触发 Build 后，graphify runner 按以下顺序执行：

| # | 阶段 | 功能 | 阻塞 |
|---|------|------|------|
| 1 | `resolve_job_context` | 解析 job 上下文 | — |
| 2 | `materialize_sources` | 复制源文件到工作目录 | ✅ |
| 3 | `normalize_inputs` | 符号链接保留目录结构到 `graphify-input/` | ✅ |
| 4 | `extract` | LLM 提取 nodes + edges | ✅ |
| — | `sanitize` | 清理 orphan edges（无目标节点的边） | — |
| 5 | `build` | 构建 NetworkX 有向图，去重 | ✅ |
| 6 | `validate` | 验证 extraction 结构完整性 | 否 |
| 7 | `cluster` | 社区检测（Louvain） | 否 |
| 8 | `analyze` | God nodes、Surprising connections、建议问题 | 否 |
| 9 | `report` | 生成 `GRAPH_REPORT.md` + `graph.html` + `graph.json` | 否 |
| 10 | `export_obsidian` | 导出 Obsidian vault（`.md` + wikilinks） | 否 |
| 11 | `export_wiki` | 导出 Wiki 页面 | 否 |
| 12 | `export_visual` | SVG / GraphML / Canvas / Cypher / Tree HTML | 否 |
| 13 | `enhance_obsidian` | 注入 KB 元数据到 vault | 否 |
| 14 | `verify_query` | BFS 查询验证图可读 | 否 |
| 15 | `register_release` | 持久化 Release + 8 Artifacts | ✅ |
| 16 | `activate_or_roll_back` | 更新 KB.active_release_id | — |

**阻塞失败**（❌）：stage 2-5, 15 失败则 pipeline 终止，不生成 release。

**降级**（⚠️）：stage 6-14 失败则对应 artifact 标记为 `degraded`，pipeline 继续。

---

## 前端页面

| 页面 | 路由 | 功能 |
|------|------|------|
| Dashboard | `/` | KB 列表 + Build Job 列表 |
| KB 详情 | `/knowledge-bases/[kbId]` | Release 历史、Artifact 状态、活跃 release |
| Build Job | `/build-jobs/[jobId]` | 阶段日志、状态、关联 release |
| Query 实验场 | `/query-playground` | MCP query 交互式测试 |
| Source 管理 | `/sources` | 查看 Source 列表 |
| Artifacts | `/artifacts/[kbId]` | Artifact 预览 |

---

## 开发

### 项目结构

```
aiwiki/
├── backend/
│   ├── app/
│   │   ├── api/routes/        # REST API
│   │   ├── db/models/         # SQLAlchemy 模型
│   │   ├── mcp/               # MCP 端点
│   │   ├── repositories/      # 数据访问层
│   │   ├── runner/            # graphify pipeline
│   │   │   ├── graphify_runner.py    # 16 阶段主流程
│   │   │   ├── source_materializer.py  # 源文件复制
│   │   │   ├── obsidian_enhancer.py    # vault 元数据注入
│   │   │   └── workspace.py          # 工作目录管理
│   │   ├── schemas/           # Pydantic
│   │   └── services/          # 业务逻辑
│   ├── alembic/               # 数据库迁移
│   └── tests/                 # 51 tests
├── frontend/
│   └── src/
│       ├── app/               # Next.js App Router
│       ├── components/        # React 组件
│       └── lib/               # API client + types
└── docs/                      # 详细文档
```

### 运行测试

```bash
cd backend
python3 -m pytest tests/ -v    # 全部 51 个测试
pytest tests/test_closure_flow.py -v  # 最小闭环测试
pytest tests/test_graphify_runner.py -v  # pipeline 测试
```

### 数据库迁移

```bash
# 创建新迁移
alembic revision --autogenerate -m "description"

# 执行迁移
alembic upgrade head

# 回滚
alembic downgrade -1
```

### 环境变量参考

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | 数据库连接串 | `sqlite:///./test.db` |
| `WORKSPACE_ROOT` | Build 工作目录 | `./data/workspaces` |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | — |
| `OPENAI_API_KEY` | OpenAI API 密钥 | — |
| `ANTHROPIC_API_KEY` | Anthropic API 密钥 | — |

---

## 文档索引

- [开发环境搭建](docs/DEV_SETUP.md) — 依赖安装、配置、IDE 设置
- [API 参考文档](docs/API_REFERENCE.md) — 全部端点 + 请求/响应示例
- [架构设计文档](docs/ARCHITECTURE.md) — 模块关系、数据流、设计决策
- [数据模型文档](docs/DATA_MODELS.md) — ER 图、表结构、状态机

---

## License

MIT
