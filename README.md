# AI Code Knowledge Archive

基于 [graphify](https://github.com/anthropics/graphify) 的多源知识图谱平台。从代码仓库、文档站点等数据源自动构建知识图谱，提供 Obsidian vault、Wiki、可视化图谱等多种输出，支持 MCP 协议查询。

## 系统概览

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────────┐
│  Source      │────→│  Knowledge   │────→│  Build Job          │
│  (代码/文档)  │     │  Base (KB)   │     │  (graphify 17 阶段) │
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
pip install fastapi uvicorn sqlalchemy alembic pydantic-settings pytest fastmcp mcp
alembic upgrade head
uvicorn app.main:app --reload --reload-dir app/ --host 0.0.0.0 --port 8000
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
cd backend && python3 -m pytest tests/ -v  # 54 tests
cd frontend && npx tsc --noEmit             # type check
```

---

## 使用手册

### 第一步：创建 Project 和 Source

Project 是顶级组织单元，Source 是数据来源。

```bash
# 创建 Source（支持本地路径或 git URL，含 .git/ 自动跟踪）
curl -X POST http://localhost:8000/api/projects/proj_demo/sources \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "my-codebase",
    "type": "markdown_dir",
    "source_ref": "https://github.com/user/repo.git",
    "git_tracking_branch": "main",
    "git_poll_interval_minutes": 30
  }'
```

**Source 类型详解**：

| type | `source_ref` 含义 | 适用场景 |
|------|-------------------|----------|
| `markdown_dir` | 本地路径或 git URL | 代码仓库、文档目录 |
| `doc_site` | 本地目录路径 | 文档站点 |

> 任何含 `.git/` 的目录自动启用 git 版本追踪，`source_ref` 为 git URL 时自动 clone。

### 第二步：创建 Knowledge Base 并配置 LLM

Knowledge Base 是知识图谱的容器。**LLM 配置已内置默认值**（DeepSeek deepseek-v4-flash），无需手动指定即可直接使用。

```bash
# 使用默认 LLM 配置创建 KB（DeepSeek deepseek-v4-flash）
curl -X POST http://localhost:8000/api/projects/proj_demo/knowledge-bases \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "My Code KB",
    "visibility": "org_shared"
  }'

# 覆盖自定义 LLM 配置
curl -X POST http://localhost:8000/api/projects/proj_demo/knowledge-bases \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "My Code KB",
    "visibility": "org_shared",
    "llm_backend": "openai",
    "llm_api_key_ref": "env:OPENAI_API_KEY",
    "llm_model_override": "gpt-4o",
    "llm_extraction_budget": 30000
  }'
```

**LLM Backend 配置说明**：

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `llm_backend` | 后端名称 | `deepseek` |
| `llm_api_key_ref` | API 密钥引用 | `env:DEEPSEEK_API_KEY` |
| `llm_model_override` | 模型名 | `deepseek-v4-flash` |
| `llm_extraction_budget` | 每次提取 token 上限 | `None`（graphify 默认 16384） |
| `llm_base_url_override` | API 地址（自定义后端） | `https://api.deepseek.com/v1` |

**内置 backend**：`claude`, `openai`, `ollama`, `gemini`, `kimi`, `bedrock`

**自定义 backend**：任意名称（如 `deepseek`），系统自动注入到 `graphify.llm.BACKENDS`。不指定 `llm_base_url_override` 和 `llm_model_override` 时使用 DeepSeek 默认值。

**API Key 解析优先级**：`环境变量` → `config.py settings.<key>`。例如 `env:DEEPSEEK_API_KEY` 先查 `os.environ["DEEPSEEK_API_KEY"]`，未设置则取 `settings.deepseek_api_key`。`config.py` 已内置 `deepseek_api_key`，零配置即可运行。见 [开发环境搭建](docs/DEV_SETUP.md)。

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

响应包含 `job_id`、`status`、`current_stage`。Build 异步执行，立即返回 202，前端轮询 `/build-jobs/{job_id}` 跟踪进度。

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

#### 标准 MCP Transport（Claude Code 集成）

后端已提供 stdio 模式的 MCP Server，支持 Claude Code 原生挂载。

**1. 配置 Claude Code：**

```bash
# 编辑 ~/.claude.json，添加 MCP 服务器
python3 -c "
import json
with open('$HOME/.claude.json') as f:
    cfg = json.load(f)
cfg.setdefault('mcpServers', {})
cfg['mcpServers']['aiwiki'] = {
    'type': 'stdio',
    'command': 'python3',
    'args': ['/path/to/aiwiki/backend/app/mcp/mcp_server.py'],
    'env': {
        'AIKB_DATABASE_URL': 'sqlite+pysqlite:////path/to/aiwiki/backend/data/aiwiki.db'
    }
}
with open('$HOME/.claude.json', 'w') as f:
    json.dump(cfg, f, indent=2, ensure_ascii=False)
"
```

**2. 重启 Claude Code**，即可在对话中使用以下工具：

| MCP Tool | 功能 |
|----------|------|
| `kb_list` | 列出所有知识库 |
| `kb_status` | 查看 KB 状态和图谱可用性 |
| `kb_query` | 用自然语言查询知识图谱 |
| `kb_path` | 查找两个节点间的最短路径 |
| `kb_explain` | 解释特定节点的上下文 |

**3. 使用示例（在 Claude Code 对话中）：**

```
帮我查一下 kb_aac292691c03 知识库里有哪些核心模块？
```

Claude Code 会自动调用 `kb_query` 工具，返回图谱查询结果。

#### SSE MCP Transport（远程 Claude Code 集成）

SSE 模式允许远程机器通过网络接入 MCP 服务。

**1. 服务器端启动 SSE 服务：**

```bash
cd backend
# 本地网络（仅同网段可访问）
python3 app/mcp/mcp_server.py --transport sse --host 0.0.0.0 --port 8765

# 公网（通过 ngrok 暴露）
ngrok http 8765
```

记录 ngrok 公网地址（如 `https://abc123.ngrok-free.app`）。

**2. 远程机器配置 Claude Code：**

```bash
# SSE 直连（同局域网）
python3 -c "
import json
with open('\$HOME/.claude.json') as f:
    cfg = json.load(f)
cfg.setdefault('mcpServers', {})
cfg['mcpServers']['aiwiki'] = {
    'type': 'sse',
    'url': 'http://<服务器IP>:8765/sse'
}
with open('\$HOME/.claude.json', 'w') as f:
    json.dump(cfg, f, indent=2, ensure_ascii=False)
"

# 公网（ngrok 地址）
python3 -c "
import json
with open('\$HOME/.claude.json') as f:
    cfg = json.load(f)
cfg.setdefault('mcpServers', {})
cfg['mcpServers']['aiwiki'] = {
    'type': 'sse',
    'url': 'https://abc123.ngrok-free.app/sse'
}
with open('\$HOME/.claude.json', 'w') as f:
    json.dump(cfg, f, indent=2, ensure_ascii=False)
"
```

**3. 重启远程 Claude Code**，即可使用相同的 5 个 MCP 工具（`kb_list`, `kb_status`, `kb_query`, `kb_path`, `kb_explain`）。

> **注意**：SSE 服务器复用后端数据库连接。确保 `DATABASE_URL` 环境变量或 `app/config.py` 指向正确的数据库路径。远程机器不需要本地数据库文件。

---

## Pipeline 17 阶段详解

触发 Build 后，graphify runner 按以下顺序执行：

| # | 阶段 | 功能 | 阻塞 |
|---|------|------|------|
| 0 | `validate_boundary` | 验证边界隔离（架构级保证） | — |
| 1 | `resolve_job_context` | 解析 job 上下文 | — |
| 2 | `materialize_sources` | 复制源文件 / git clone 到 `sources/` | ✅ |
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
| 14 | `verify_query` | 3 条中文查询验证 + min 节点/边检查 | **✅ hard gate** |
| 15 | `register_release` | 持久化 Release + 8 Artifacts + rsync obsidian/wiki | ✅ |
| 16 | `activate_or_roll_back` | 更新 KB.active_release_id | — |

**阻塞失败**（✅）：stage 2-5, 14, 15 失败则 pipeline 终止，不生成 release。

**降级**（否）：stage 6-13 失败则对应 artifact 标记为 `degraded`，pipeline 继续。

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
│   │   ├── mcp/               # MCP 端点 + stdio Server
│   │   ├── repositories/      # 数据访问层
│   │   ├── runner/            # graphify pipeline
│   │   │   ├── graphify_runner.py    # 17 阶段主流程
│   │   │   ├── source_materializer.py  # 源文件复制 + git clone
│   │   │   ├── obsidian_enhancer.py    # vault 元数据注入
│   │   │   └── workspace.py          # 项目目录管理
│   │   ├── schemas/           # Pydantic
│   │   └── services/          # 业务逻辑
│   ├── alembic/               # 数据库迁移
│   └── tests/                 # 54 tests
├── data/                      # 运行时数据 (gitignored)
│   └── projects/{id}/         # 项目根
│       ├── sources/           # 源文件副本 (复制进入，隔离边界)
│       └── kb/{kb_id}/
│           ├── builds/        # build 工作区
│           ├── cache/         # AST 缓存 (跨 build 复用)
│           ├── obsidian/      # Obsidian vault (git repo)
│           ├── wiki/          # Wiki (git repo)
│           └── releases/      # release manifest
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
python3 -m pytest tests/ -v    # 全部 54 个测试
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
| `AIKB_DATABASE_URL` | 数据库连接串 | `postgresql+asyncpg://sunweini@localhost:5432/aiwiki` |
| `AIKB_DATA_ROOT` | 数据根目录 | `./data` |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | `config.py` 内置（零配置） |
| `OPENAI_API_KEY` | OpenAI API 密钥 | — |
| `ANTHROPIC_API_KEY` | Anthropic API 密钥 | — |

> **注意**：`database_url` 和 `deepseek_api_key` 已直接写在 `app/config.py` 中，无需环境变量。`AIKB_` 前缀仅用于覆盖。

---

## 文档索引

- [开发环境搭建](docs/DEV_SETUP.md) — 依赖安装、配置、IDE 设置
- [API 参考文档](docs/API_REFERENCE.md) — 全部端点 + 请求/响应示例
- [架构设计文档](docs/ARCHITECTURE.md) — 模块关系、数据流、设计决策
- [数据模型文档](docs/DATA_MODELS.md) — ER 图、表结构、状态机

---

## License

MIT
