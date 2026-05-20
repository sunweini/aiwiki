# AIWiki 目录结构改造与异步执行设计

> 基于 2026-05-19 两份 spec 与当前代码实现的冲突分析，重新设计 data 目录结构、git source 支持、查询验证门禁与异步 build 执行模型。

## 1. 背景与动机

### 1.1 当前实现的 4 个根因

| # | 问题 | 说明 |
|---|------|------|
| 1 | 无 Project 层级 | 55 个 job 全平铺在 `data/workspaces/` 下，无法按 project/kb 隔离 |
| 2 | 提取范围无隔离 | `source_ref` 可指向任意路径（包括 aiwiki 自身项目），AIWiki 代码参与 graphify 提取 |
| 3 | obsidian/wiki 是临时的 | workspace 下临时产物，build 成功 24h 后删除。但 vault 和 wiki 应该是 KB 级持久资源 |
| 4 | build 同步阻塞 HTTP | `runner.run()` 在请求线程内同步执行 5-30 分钟，前端看不到进度。uvicorn `--reload` 检测 data/ 文件变更 kill 进程 |

### 1.2 与 Spec 的核心冲突

| 维度 | 2026-05-19 Spec | 当前实现 | 新设计 |
|------|----------------|---------|--------|
| 根目录 | `data/workspaces/` 平铺 | 同 spec | `data/projects/{project_id}/` 层级化 |
| source 隔离 | 无硬边界 | 无 | `sources/` 为唯一输入源，Stage 0 校验 |
| obsidian/wiki | workspace 内临时产物 | 同 spec | KB 级持久 git repo，tag = release_id |
| 版本管理 | release ID + DB 记录 | 同 spec | git tag + release manifest JSON 指针 |
| 执行模型 | 未定义 | 同步阻塞 HTTP 线程 | asyncio 后台线程 + 前端轮询 |
| 查询验证 | stage=degraded 不阻断 | 同 spec | 硬门禁：三问全过才激活 release |

## 2. data 目录结构

### 2.1 完整结构

> `data/` 位于项目根 `aiwiki/data/`，与 `backend/`、`frontend/` 平级。

```
data/projects/{project_id}/
├── project.json                     # Project 元数据
│
├── sources/                         # 唯一提取输入源（硬边界，绝不允许外部路径）
│   └── {source_id}/
│       ├── .source-meta             # source 元数据快照（type, ref, sync_strategy 等）
│       ├── .git/                    # source_ref 是 git 仓库时保留（用于变更检测）
│       └── ...                      # 从 source_ref copy/clone 的源文件
│
├── kb/
│   └── {kb_id}/
│       ├── kb.json                  # KB 配置快照
│       ├── cache/                   # AST/semantic cache（KB 级共享，所有 build 复用）
│       │
│       ├── builds/                  # 每次 build 的工作区
│       │   └── {job_id}/
│       │       ├── input/           # copy from sources/{source_id}/（仅该 KB 绑定的 source）
│       │       ├── out/             # graph.json, GRAPH_REPORT.md, graph.html, svg, graphml, canvas
│       │       ├── logs/
│       │       │   ├── runner.log
│       │       │   ├── extract.log
│       │       │   └── enhancement.log
│       │       └── metadata/
│       │           ├── job.json
│       │           ├── stages.json
│       │           └── stats.json
│       │
│       ├── obsidian/                # git repo，持久化 vault
│       │   ├── .git/                # tag = release_id
│       │   └── ...                  # .md 文件
│       │
│       ├── wiki/                    # git repo，持久化 wiki
│       │   ├── .git/                # tag = release_id
│       │   └── ...                  # .md 文件
│       │
│       └── releases/                # release manifest（轻量 JSON 指针，不重复存储文件）
│           └── {release_id}.json
```

### 2.2 分层职责

| 目录 | 职责 | 生命周期 |
|------|------|---------|
| `sources/` | 源文件唯一存储 | source 注册 → 删除 |
| `builds/{job_id}/input/` | copy from sources/ | build 期间 |
| `cache/` | AST/semantic 缓存 | KB 级共享，跨 build 复用，手动清理 |
| `builds/{job_id}/out/` | graphify 一次性产物 | 保留至下次同 KB build（被覆盖） |
| `builds/{job_id}/logs/` | 结构化日志 | success: 24h, failed: 7d |
| `obsidian/` | 持久化 vault | 同 KB 生命周期 |
| `wiki/` | 持久化 wiki | 同 KB 生命周期 |
| `releases/` | release manifest | 永久保留 |

## 3. Source 管理

### 3.1 Source 类型

```python
class SourceType(str, Enum):
    markdown_dir = "markdown_dir"
    doc_site = "doc_site"
    local_repo = "local_repo"
    pdf_set = "pdf_set"
    image_set = "image_set"
    url_set = "url_set"
```

不新增 `git_repo` 类型。变更检测统一走 git，自动适配所有 source type。

### 3.2 Source 注册与变更检测

**注册时**（统一逻辑）：
```
if source_ref 是远程 git URL (http[s]:// 或 git@):
    git clone --depth 1 -b {git_tracking_branch} → sources/{source_id}/
elif source_ref 是本地路径且有 .git/:
    cp -r source_ref → sources/{source_id}/  （保留 .git/）
elif source_ref 是本地路径无 .git/:
    cp -r source_ref → sources/{source_id}/
else:
    → url_set/pdf_set/image_set 手动上传或不支持
```

**新增字段**（Source schema 扩展）：
```python
git_tracking_branch: str = "main"          # 追踪分支（远程 git URL 时用）
git_poll_interval_minutes: int = 0         # 变更检查间隔，0 = 手动触发
git_last_commit: str | None = None         # 上次 build 时的 HEAD commit
```

**变更检测**（不区分 source type，只看有没有 .git）：
```bash
if sources/{source_id}/.git 存在:
    git fetch origin {branch}
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/{branch})
    if [ "$LOCAL" != "$REMOTE" ]; then
        git pull origin {branch}
        # → 自动 enqueue build
    fi
else:
    # 无 .git，降级为手动触发（前端按钮），log 警告
```

**适用性**：`markdown_dir`、`doc_site`、`local_repo` 只要目录本身是 git 仓库，就能自动检测更新。`pdf_set`、`image_set`、`url_set` 无 .git，默认手动触发。

**轮询**：asyncio background task，遍历所有 `git_poll_interval_minutes > 0` 的 source，按各自间隔执行 git fetch 检测。

### 3.3 Source 写入时机

```
注册 source → clone/copy source_ref → sources/{source_id}/    （一次）
更新 source → git pull 或 re-copy                → sources/{source_id}/    （手动或自动）
build      → copy sources/{sid}/ → builds/{job_id}/input/     （每次 build）
```

### 3.4 硬边界校验（Stage 0: validate_boundary）

Stage 0 在 materialize 之前执行，确保只有 `sources/` 下的文件参与提取：

1. 遍历所有 source 的 `source_ref`
2. 确认 resolve 后在 `projects/{project_id}/sources/{source_id}/` 内
3. 不在内的 → stage=failed，拒绝继续
4. AIWiki 自身项目目录不在 `sources/` 下 → 永远不会被提取

## 4. 查询验证门禁（Stage verify_query）

### 4.1 设计目标

图的产出不等于图的可用。`verify_query` 是 release 激活前的最终把关。

### 4.2 检查项

```
Stage verify_query（硬门禁）:
    1. 加载 graph.json → nx.Graph
    2. node_count >= MIN_NODES（默认 10）
    3. edge_count >= MIN_EDGES（默认 5）
    4. 用 3 个预设问题调 _query_graph_text:
       a. "列出这个知识库的主要模块"
       b. "总结核心架构"
       c. "关键组件之间的依赖关系"
    5. 每个 query:
       - 返回内容非空
       - 不包含 error/exception/failed 关键字
       - 耗时 < 30s
    6. 三问全过 → verify_query=completed → register_release
    7. 任一失败 → verify_query=failed → build 整体 failed
       → error_summary = "查询验证失败: {具体原因}"
       → 不生成 release，旧 active release 继续服务
```

### 4.3 降级矩阵

| verify_query 结果 | graph 可用 | release 可激活 | artifact_status |
|---|---|---|---|
| 三问全过 | 是 | 是 | graph=ready |
| node/edge 不足 | 否 | 否 | graph=failed |
| query 返回空 | 否 | 否 | graph=failed |
| query 含 error | 否 | 否 | graph=failed |
| query 超时(>30s) | 否 | 否 | graph=failed |

## 5. 异步 Build 执行模型

### 5.1 问题

`POST /build-jobs` → `runner.run()` 同步阻塞 5-30 分钟。HTTP 挂住，前端白屏。uvicorn `--reload` 检测 `data/` 文件变更 kill 进程。

### 5.2 解决方案

```
POST /build-jobs → 创建 job(status=pending) → 返回 202 Accepted
                   ↓
            asyncio.create_task(build_worker(job_id))
                   ↓
            await loop.run_in_executor(None, _sync_run_and_persist, ...)
                   ↓
            每阶段完成 → progress_callback → 更新 DB job.stages_result, job.status
                   ↓
            前端 GET /build-jobs/{jobId}（每 2s 轮询）
            展示阶段进度条，BuildTimeline 组件已就绪，去掉 mock 接真实数据
```

### 5.3 核心代码结构

```python
# build_service.py
class BuildService:
    async def enqueue_build(self, kb_id: str, ...) -> BuildJob:
        job = self._create_job(kb_id, status="pending")
        asyncio.create_task(self._run_build_background(
            job.id, kb_id, sources, llm_config
        ))
        return job  # 立即返回

    async def _run_build_background(self, job_id, kb_id, sources, llm_config):
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            self._sync_run_and_persist,
            job_id, kb_id, sources, llm_config
        )

    def _sync_run_and_persist(self, job_id, kb_id, sources, llm_config):
        def on_progress(stage_name, status, **meta):
            # 同步更新 DB（同一线程，无需 async）
            self.job_repo.update_stage(job_id, stage_name, status, meta)

        runner = GraphifyRunner(workspace_manager)
        result = runner.run(
            job_id, kb_id, sources,
            llm_config=llm_config,
            progress_callback=on_progress
        )
        self._persist_result(job_id, result)
```

### 5.4 uvicorn --reload 修复

```bash
# 旧：监听整个项目目录（包括 data/）
uvicorn app.main:app --reload

# 新：只监听 app/ 目录
uvicorn app.main:app --reload --reload-dir app/
```

### 5.5 Build 状态机

```
pending → running → completed
                  → failed
                  → cancelled
```

### 5.6 Run 签名变更

```python
class GraphifyRunner:
    def run(
        self,
        job_id: str,
        kb_id: str,
        sources: list[dict],
        *,
        llm_config: dict | None = None,
        progress_callback: Callable[[str, str, ...], None] | None = None,
    ) -> dict:
        ...
```

每阶段完成后调用 `progress_callback(stage_name, status, **meta)`，BuildService 通过回调更新 DB。

## 6. Git 版本管理（obsidian / wiki）

### 6.1 方案

`kb/{kb_id}/obsidian/` 和 `kb/{kb_id}/wiki/` 各自是独立 git repo。

### 6.2 流程

```
register_release 阶段:
    1. rsync builds/{job_id}/out/obsidian/ → kb/{kb_id}/obsidian/
    2. cd kb/{kb_id}/obsidian
    3. git add -A
    4. git commit -m "release {release_id}"
    5. git tag {release_id}
    
    # wiki 同理
```

### 6.3 前端能力

- `GET /kb/{kb_id}/releases` 列出所有 release（tag 列表 + 时间戳）
- `GET /kb/{kb_id}/releases/{release_id}/diff?base={base_release_id}` → `git diff base..target --stat`
- Artifact 浏览：直接 serve obsidian/wiki 目录的文件

## 7. Pipeline 完整 Stages

```
 0. validate_boundary        # 硬边界校验 —— source_ref 必须在 sources/ 内
 1. resolve_job_context      # 加载 KB 配置、source bindings
 2. materialize_sources      # git clone/pull 或 copy source_ref → sources/{source_id}/
 3. normalize_inputs         # copy sources/ → input/，过滤噪声文件
 4. extract                  # AST + semantic extraction
 5. build                    # 构建 nx.Graph
 6. validate                 # graphify.validate.assert_valid
 7. cluster                  # community detection
 8. analyze                  # god nodes, surprising connections, suggested questions
 9. report                   # GRAPH_REPORT.md
10. export_obsidian          # graphify to_obsidian
11. export_wiki              # graphify to_wiki
12. export_visual            # SVG, GraphML, Canvas, Cypher, tree HTML
13. enhance_obsidian         # 平台增强：导航页、frontmatter、版本信息、来源元数据
14. verify_query             # 硬门禁：三问全过
15. register_release         # 写入 release manifest + rsync to obsidian/wiki git repo
16. activate_or_roll_back    # 设置 KB.active_release_id
```

## 8. 错误降级矩阵（完整）

| 失败阶段 | graph 可用 | release 可激活 | artifact_status |
|---------|------------|-------------|----------------|
| 0 validate_boundary | 否 | 否 | - |
| 2 materialize_sources | 否 | 否 | - |
| 3 normalize_inputs | 否 | 否 | - |
| 4 extract | 否 | 否 | graph=failed |
| 5 build | 否 | 否 | graph=failed |
| 6 validate | 否 | 否 | graph=failed |
| 7 cluster | 是 | 是 | graph=ready（不阻断） |
| 8 analyze | 是 | 是 | graph=ready（不阻断） |
| 9 report | 是 | 是 | report=degraded |
| 10 export_obsidian | 是 | 是 | vault=degraded |
| 11 export_wiki | 是 | 是 | wiki=degraded |
| 12 export_visual | 是 | 是 | svg/graphml=degraded |
| 13 enhance_obsidian | 是 | 是 | vault=degraded |
| 14 verify_query | **否** | **否** | graph=failed |
| LLM key 缺失 | 是（仅 AST） | 是 | graph=degraded |

## 9. 改造点汇总

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `app/config.py` | 改 | `workspace_root` → `data_root`，新增 `projects_dir` |
| `app/runner/workspace.py` | 重写 | 适配新目录结构，`create()` 在 `kb/{kb_id}/builds/{job_id}/` 下创建 |
| `app/runner/source_materializer.py` | 重写 | 支持 git clone/pull；source snapshot 写到 `sources/{source_id}/`；硬边界校验 |
| `app/runner/graphify_runner.py` | 改 | +Stage 0 validate_boundary；+progress_callback 参数；output 路径适配新结构 |
| `app/runner/obsidian_enhancer.py` | 不改 | 已有幂等逻辑 |
| `app/services/build_service.py` | 重写 | `enqueue_build` 返回 202；`_run_build_background` 异步执行；persist result 写 release manifest |
| `app/services/graphify_query_adapter.py` | 改 | verify_query 阶段的三问检查 |
| `app/services/knowledge_base_service.py` | 改 | KB 初始化时创建 `kb/{kb_id}/` 目录 + init obsidian/wiki git repo |
| `app/services/source_service.py` | 改 | source 注册时执行 copy/clone 到 `sources/{source_id}/` |
| `app/db/models/build_job.py` | 改 | +current_stage 字段 |
| `app/db/models/source.py` | 改 | +git_tracking_branch, +git_poll_interval_minutes, +git_last_commit |
| `app/main.py` | 改 | `/data` StaticFiles mount 适配新路径；startup 启动 git poll 后台任务 |
| `frontend/src/app/build-jobs/[jobId]/page.tsx` | 改 | 轮询 GET /build-jobs/{jobId} 展示实时进度 |
| `frontend/src/components/build-timeline.tsx` | 改 | 接真实 stage 数据，去掉 mock |
| `backend/tests/*` | 更新 | 匹配新 API 签名和目录结构 |

## 10. 不在此范围

- Celery/Redis 任务队列（V1 用 asyncio + 默认线程池）
- WebSocket 实时推送（V1 用前端轮询）
- 多 KB 合并查询（cross-KB query）
- Source 级别的文件 diff（git source 看 HEAD 是否变，不逐文件 diff）
- Workspace 自动清理（V1 手动）

## 11. 验证

1. `python3 -m pytest tests/ -v` — 全部测试通过
2. `cd frontend && npx tsc --noEmit` — 0 errors
3. 手动验证：创建 project → 注册 source（git 仓库）→ 创建 KB → 触发 build → 观察前端进度 → 确认 release 激活 → MCP query 可查
