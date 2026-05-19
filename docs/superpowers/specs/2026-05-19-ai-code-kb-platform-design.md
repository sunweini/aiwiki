# AI Code 多知识库平台设计文档

> 基于 graphify 全链路知识引擎，构建面向多项目交付团队的多知识库托管、治理、发布与查询平台。

## 1. 背景与目标

本系统面向多项目交付团队，目标不是构建通用聊天产品，而是构建一个可托管、可持续更新、可多知识库管理的 AI Code 知识平台。

V1 首要目标：
- 让 agent 能稳定查询指定知识库
- 让知识库可持续构建、更新、追溯
- 让人能通过前端与 Obsidian 阅读知识产物

## 2. 核心原则

### 2.1 三层职责分离
- **graphify**：知识生产与图查询引擎
- **平台**：多知识库治理与托管编排
- **Obsidian**：人类阅读与沉淀层

### 2.2 查询规则
- agent 主查询链路只走 **graphify query/path/explain**
- MCP 主查询源只走 graphify graph
- Obsidian 不进入主查询链路
- 多知识库查询必须显式指定 `kb_id`
- 查询不能串库

### 2.3 引擎复用原则
V1 不重写 graphify 核心能力，尽量完整复用：
- detect
- AST extraction
- semantic extraction
- build
- cluster
- report/html/wiki/obsidian 等导出
- query/path/explain
- MCP 能力
- cache / update / merge / watch

说明：Obsidian 主阅读层基于 graphify 原生 obsidian export 复用与轻改造，而不是从零重写 vault generator。平台只在 graphify export 基础上补充目录组织、frontmatter、导航页、版本信息与来源元数据。

## 3. graphify 能力边界

### 3.1 graphify 已有能力
根据当前源码，graphify 已具备完整知识图谱流水线：

#### 多源输入
- 代码、Markdown、HTML、YAML、TXT
- PDF
- 图片
- 音视频
- docx / xlsx
- URL ingest：网页、tweet、arXiv、PDF、image、YouTube

#### 预处理
- 文件分类
- 敏感文件过滤
- Google Workspace 转换
- PDF/docx/xlsx 文本抽取
- 音视频转录

#### 知识抽取
- AST extraction
- semantic extraction
- EXTRACTED / INFERRED / AMBIGUOUS
- hyperedges
- semantic similarity 边

#### 图构建与分析
- build graph
- cluster
- god nodes
- surprising connections
- suggested questions
- benchmark

#### 查询与接入
- `query`
- `path`
- `explain`
- `save-result`
- MCP stdio server

#### 导出
- `graph.json`
- `GRAPH_REPORT.md`
- `graph.html`
- Obsidian vault
- wiki
- SVG
- GraphML
- Neo4j export / push

#### 工程化
- AST / semantic cache
- incremental update
- merge graphs
- watch
- hooks / skill integration

### 3.2 graphify 不负责什么
graphify 当前不等于多知识库平台，不负责：
- Project / Source / Knowledge Base 元模型
- 多知识库注册与生命周期管理
- 组织级共享与权限治理
- 前端管理台
- 平台级任务编排中心
- 统一 artifact registry
- 平台级 MCP 多库路由

### 3.3 graphify 当前没有什么
- 没有独立 embedding/vector retrieval 子系统
- 没有 vector DB
- 没有 reranker
- 没有原生多知识库 namespace 模型

### 3.4 结论
**graphify 做引擎，平台做治理，Obsidian 做阅读。**

## 4. 总体系统架构

### 4.1 Source Layer
支持输入源：
- GitHub 仓库
- 产品文档
- 接口文档
- Markdown/HTML/YAML/TXT
- 网页
- PDF
- 图片
- 音视频
- docx/xlsx

### 4.2 Platform Orchestration Layer
负责：
- Project / Source / Knowledge Base 管理
- source binding
- build job 调度
- workspace 准备
- graphify 运行包装
- artifact 注册
- active version 切换
- build history 与失败恢复

### 4.3 Graphify Engine Layer
复用 graphify 全链路能力：
- detect
- AST extraction
- semantic extraction
- build
- cluster
- report/html/wiki/obsidian export
- query/path/explain
- 原生 MCP server 作为可复用实现参考或平台内部适配能力

说明：graphify 原生 obsidian export 是平台 Obsidian 主阅读层的基础。平台不从零重写 vault generator，而是在 graphify export 基础上做轻量包装与增强，比如补充导航页、版本元数据、来源信息与目录规范。

补充：对外唯一 MCP 入口始终是平台 MCP Gateway。graphify 原生 MCP server 不直接暴露给最终用户。

### 4.4 Knowledge Output Layer
- **AI 查询主产物**：graph / graph.json
- **人类阅读主产物**：Obsidian vault
- **辅助浏览产物**：wiki
- 保留：
  - GRAPH_REPORT.md
  - graph.html
  - wiki
  - svg / graphml / cypher

说明：平台运行时，graphify 原始 Obsidian export 与平台 enhancement 后 vault 都可作为内部 artifact 保留；对前端与默认阅读入口，优先暴露 enhancement 后 vault 版本。

### 4.5 Access Layer
- **MCP Gateway**：给 agent 查询
- **Frontend Admin Console**：给人管理知识库与构建流程

## 5. 多知识库模型

### 5.1 核心实体
- **Project**：管理边界
- **Source**：来源边界，统一表示 GitHub repo、文档目录、URL 集合、PDF 集合、图片集合等输入源
- **Knowledge Base**：查询边界
- **Build Job**：执行边界
- **Artifact Version**：回溯边界

补充原则：**Source 是统一输入源抽象；GitHub repo 只是 Source 的一种类型，而不是独立一级平台模型。**

### 5.2 映射关系
- 一个 Project 可包含多个 Source
- 一个 Project 可包含多个 Knowledge Base
- 一个 Knowledge Base 可绑定多个 Source
- 一个 Source 可被多个 Knowledge Base 复用

### 5.3 Source 字段模型

#### 5.3.1 Source 基础字段
每个 `Source` 至少包含：
- `id`
- `project_id`
- `name`
- `type`
- `status`
- `source_ref`
- `description`
- `auth_config`
- `sync_strategy`
- `include_rules`
- `exclude_rules`
- `normalization_options`
- `last_synced_at`
- `created_at`
- `updated_at`

#### 5.3.2 Source 字段语义
- `type`：输入源类型。建议枚举：
  - `github_repo`
  - `doc_dir`
  - `url_set`
  - `pdf_set`
  - `image_set`
  - `video_set`
- `status`：源状态。建议枚举：
  - `active`
  - `disabled`
  - `error`
  - `archived`
- `source_ref`：输入源定位信息。按 type 解释不同：
  - `github_repo`：repo URL 或 owner/repo
  - `doc_dir`：目录路径或挂载路径
  - `url_set`：URL 集合标识
  - `pdf_set`：PDF 集合目录或对象存储前缀
  - `image_set`：图片集合目录或对象存储前缀
  - `video_set`：音视频目录或对象存储前缀
- `auth_config`：认证配置引用。只保存 credential reference、token alias、oauth binding id 等引用，不直接保存明文 secret。
- `sync_strategy`：源同步策略。建议枚举：
  - `manual`
  - `scheduled`
  - `webhook`
  - `hybrid`
- `include_rules`：声明纳入该 source 抽取范围的分支、路径、glob、URL allowlist、文档 ID 等规则。
- `exclude_rules`：声明排除的路径、glob、临时目录、二进制目录等规则。
- `normalization_options`：控制 source 进入 graphify 前的预处理方式，例如是否下载附件、是否抽取 PDF 文本、是否启用图片/视频转录、是否保留原始 metadata。

#### 5.3.3 各 Source.type 的特有字段建议
- `github_repo`：
  - `repo_owner`
  - `repo_name`
  - `default_branch`
  - `tracked_branches`
  - `clone_depth`
  - `webhook_enabled`
- `doc_dir`：
  - `root_path`
  - `allowed_extensions`
- `url_set`：
  - `seed_urls`
  - `crawl_mode` (`manual_list`, `bounded_crawl`)
  - `max_depth`
- `pdf_set`：
  - `storage_prefix`
  - `ocr_enabled`
- `image_set`：
  - `storage_prefix`
  - `vision_enabled`
- `video_set`：
  - `storage_prefix`
  - `transcription_enabled`
  - `whisper_model`

### 5.4 Knowledge Base 与 Source 绑定模型
`knowledge_base_source_binding` 建议包含：
- `id`
- `knowledge_base_id`
- `source_id`
- `binding_status`
- `scope_override`
- `include_rules_override`
- `exclude_rules_override`
- `priority`
- `created_at`
- `updated_at`

该模型用于支持：
- 同一 Source 被多个 Knowledge Base 复用
- 同一 Source 在不同 Knowledge Base 中裁剪不同范围

### 5.5 隔离原则
#### 输入隔离
每个 KB 有独立 source manifest。

#### 执行隔离
每个 build job 独立 workspace、独立参数、独立输出目录。

#### 产物隔离
每个 KB 独立 graph、vault、report、html、wiki、logs。

#### 查询隔离
每次 query/path/explain 只在目标 KB active graph 内执行。

#### 版本隔离
每次构建生成独立版本，active version 与历史版本分离。

## 6. Obsidian 设计

### 6.1 定位
- graphify：给 AI 读
- Obsidian：给人读
- 不是反过来

### 6.2 角色
Obsidian 是：
- 主阅读层
- 主沉淀层
- 主交付层

不是：
- agent 主查询源
- 图查询替代品
- 平台从零重写的独立知识生成系统

wiki 是辅助浏览与轻量导航产物，不替代 Obsidian 主阅读层。

V1 中，平台会复用 graphify 原生 obsidian export 作为主阅读层基础，并在其上做轻量增强，例如补充 frontmatter、导航页、版本信息、来源元数据与目录规范。

### 6.3 每个 KB 独立 vault
建议结构：
- `index.md`
- `sources/`
- `concepts/`
- `code/`
- `docs/`
- `standards/`
- `reports/`
- `queries/`
- `versions/`
- `assets/`

### 6.4 页面类型
- 导航页
- 主题页
- 实体页
- 关系页
- 生成页
- 人工增强页

### 6.5 生成原则
- graphify 结果保真
- 平台复用 graphify 原生 obsidian export 作为基础
- 平台只做轻量增强，不从零重写 vault generator
- 推断内容显式标注
- 使用 wikilink 构建稳定跳转
- 人工编辑区与机器生成区隔离

### 6.6 Obsidian 增强策略
- graphify 先生成基础 vault
- 平台只在 graphify export 完成后执行 **post-process enhancement**
- 平台增强优先新增或补充这些内容：
  - 导航页
  - 版本信息页
  - 来源元数据
  - 统一 frontmatter
  - KB 入口页
- 平台尽量不重写 graphify 生成的核心实体 note 结构，除非为补充必要 metadata
- 增强步骤必须 **幂等**：重复执行不会重复插入内容、不会污染 vault、不会破坏 graphify 原输出
- 平台增强失败时：
  - 不影响 graph 可查询性
  - release 可进入 `partial_success` 或 artifact `degraded`
  - 前端明确标记 vault 状态
- 后续 rebuild 时，graphify export 可以重建基础 vault，平台再重新执行 enhancement；平台不依赖人工手工修改 graphify 原始输出文件来保持结构

### 6.7 查询边界
- graph 查询走 graphify
- vault 只做阅读 artifact
- vault 可承载 query 结果快照，不做主事实源

## 7. 生成与更新流水线

### 7.1 full_build / incremental_update 主流程
1. Source Registration
2. Build Request Creation
3. Workspace Preparation
4. Graphify Full Pipeline Execution
5. Obsidian Vault Generation
6. Artifact Registration
7. Activation

补充：`sync_only` 仅执行 source 同步与登记，不进入 graphify、Obsidian、artifact activation 流程。

### 7.2 更新模式
- `full_build`
- `incremental_update`
- `sync_only`

### 7.3 一致性规则
- graphify 成功 = 核心版本可发布
- Obsidian 失败 = `partial_success`
- active version 切换以 graph 可用性为准

### 7.4 Artifact Version 与 Release 粒度
- 平台发布单位定义为 **Knowledge Base Release**。
- 一个 `release` 绑定一次 build 产出的整组 artifacts，而不是只绑定单个文件。
- 一个 `release` 至少包含这些 artifact 槽位：
  - `graph`
  - `report`
  - `html`
  - `wiki`
  - `vault`
  - `logs`
  - `manifest`
- `artifact_version` 记录每个 artifact 槽位对应路径、状态、来源 build_job 与统计信息。
- `release` 是 Knowledge Base 面向外部可见的发布对象；`artifact_version` 是 release 内部 artifact 明细。

#### 7.4.1 发布与激活规则
- `active release` 是 MCP、前端、管理台默认读取的当前版本。
- `active release` 必须至少具备可用 `graph`，否则不能激活。
- `graph` 是查询可用性的硬前提。
- `vault`、`wiki`、`html`、`report` 属于附属 artifact，可成功、失败或降级。
- 当 `graph` 成功但 `vault` 失败时：
  - build job 状态记为 `partial_success`
  - 仍可生成新 `release`
  - 该 `release` 可被激活
  - 但 `release.artifact_status.vault = degraded`
- 当 `graph` 失败时：
  - 不生成可激活 release
  - 旧 active release 保持不变

#### 7.4.2 版本一致性规则
- MCP 查询永远绑定 `active release.graph`
- 前端 KB 详情默认展示 `active release`
- 前端展示 artifact 时必须带每个 artifact 自己状态，而不能假设 graph 与 vault 总是同时成功
- 平台不做 graph active version 与 vault active version 两套独立切换入口
- 对外只有一个 `active release` 概念；release 内部允许 artifact 状态不一致

#### 7.4.3 推荐元数据字段
`release` 建议包含：
- `id`
- `knowledge_base_id`
- `build_job_id`
- `version`
- `status` (`completed`, `partial_success`, `failed`)
- `activated_at`
- `created_at`
- `artifact_status`（按 graph/report/html/wiki/vault/logs/manifest 分项）
- `stats_json`

`artifact_version` 建议至少补充：
- `release_id`
- `artifact_type`
- `artifact_status`
- `artifact_path`
- `artifact_meta`

这样可以保证：
- 对外发布视角统一
- 内部 artifact 成败可细分
- `partial_success` 不会破坏查询可用性

## 8. 平台改造点

### 8.1 graphify 尽量保持不动
不改：
- 查询语义
- 知识抽取语义
- 图构建语义

### 8.2 平台新增三层
#### wrapper
统一调用 graphify。

#### orchestrator
统一管任务。

#### registry
统一管 KB / version / artifact / route 元数据。

#### graphify runner
平台托管 graphify 的阶段化执行适配器。负责 build job 执行、workspace 准备、artifact 收集、Obsidian enhancement、release 注册与结构化日志输出。

### 8.3 Graphify Runner / Workspace / Logging 设计

#### 8.3.1 Runner 角色
`Graphify Runner` 是平台调 graphify 的执行适配器，职责固定为：
- 接收 `build_job`
- 解析 `knowledge_base + sources + target release`
- 准备 workspace
- 执行 graphify
- 收集 artifacts
- 执行 Obsidian enhancement
- 注册 `release` / `artifact_version`
- 输出结构化日志与阶段状态

#### 8.3.2 Workspace 目录结构
建议固定：

```text
/workspaces/{job_id}/
  source-manifest.json
  source-materials/
    github/
    docs/
    urls/
    pdf/
    images/
    videos/
  graphify-input/
  graphify-out/
  obsidian-enhanced/
  logs/
    runner.log
    graphify.stdout.log
    graphify.stderr.log
    enhancement.log
  metadata/
    job.json
    release.json
    stats.json
```

目录职责：
- `source-materials/`：原始拉取结果
- `graphify-input/`：graphify 真正消费内容
- `graphify-out/`：graphify 原生产物
- `obsidian-enhanced/`：平台增强后 vault
- `logs/`：分阶段日志
- `metadata/`：结构化执行记录

#### 8.3.3 Runner 执行阶段
- **Stage 1: Resolve Job Context**
  - 加载 KB 配置、source bindings、build type、target release version
- **Stage 2: Materialize Sources**
  - clone repo、同步目录、抓取 URL、下载 PDF/image/video，形成 source snapshot
- **Stage 3: Normalize Inputs**
  - 将不同来源整理成 graphify 可消费输入，生成 `graphify-input/` 与 `source-manifest.json`
- **Stage 4: Run Graphify**
  - 调 graphify CLI 或 Python API，指定输出目录并采集 stdout/stderr
- **Stage 5: Enhance Obsidian**
  - 在 graphify obsidian export 基础上执行 post-process enhancement
- **Stage 6: Register Release**
  - 注册 release、artifact_version、artifact_status、stats_json
- **Stage 7: Activate Or Roll Back**
  - graph 成功则可激活，graph 失败则保留旧 active release，vault 失败则记 `partial_success`

#### 8.3.4 CLI 与 Python API 策略
- V1 默认优先 **CLI runner**
- 原因：与现有 graphify 最少耦合，最容易先托管跑通
- 平台 runner 接口保持稳定，后续可演进到 Python API runner

#### 8.3.5 Logging 设计
日志分层：
- `runner.log`：平台阶段日志
- `graphify.stdout.log`：graphify 标准输出
- `graphify.stderr.log`：graphify 错误输出
- `enhancement.log`：Obsidian enhancement 日志

结构化日志字段至少包含：
- `job_id`
- `kb_id`
- `release_id`
- `stage`
- `timestamp`
- `status`
- `message`

前端展示要求：
- 默认展示结构化阶段状态
- 支持展开原始 stdout/stderr
- 失败任务可直接查看对应阶段日志

#### 8.3.6 Workspace 保留与失败恢复
- success：workspace 可异步清理
- partial_success：默认保留短期日志与 metadata
- failed：保留 workspace 一段时间用于排错

建议保留策略：
- success：24h
- failed：7d

重试策略：
- source fetch 失败：允许重试
- graphify 失败：允许有限次重试
- enhancement 失败：默认只重跑 enhancement，不强制重跑 graphify

#### 8.3.7 Artifact 收集规则
artifact 不靠猜测注册，按固定路径发现：
- `graph.json`
- `GRAPH_REPORT.md`
- `graph.html`
- `wiki/`
- `obsidian/`（graphify 原始 export）
- `graph.svg`
- `graph.graphml`
- `obsidian-enhanced/`（平台默认对外暴露 vault）

artifact 注册时至少记录：
- `path`
- `type`
- `status`
- `size`
- `checksum`
- `generated_at`

#### 8.3.8 前端 graph.html 展示要求
前端管理台应可直接查看 `graph.html`，不要求用户下载后本地打开。
建议：
- KB 详情页和 Artifacts 页都提供 `graph.html` 直接预览入口
- 默认以内嵌 viewer 或新标签页方式打开
- 若 graph.html 因 CSP、静态资源或体积限制不能内嵌，则至少保证稳定新窗口查看
- `graph.html` 属于正式 artifact，不只是离线附件

### 8.4 最小必要改造 graphify
只改多实例友好性：
- 更稳定输出目录注入
- 更清晰 source manifest 输入
- 更明确 headless API
- 更标准 artifact metadata 输出

## 9. MCP 接入架构

### 9.1 原则
- 对外统一 MCP Gateway，外部 agent 只连接这一个入口
- 查询必须带 `kb_id`
- 路由到该 KB active graph
- graphify 负责求解
- graphify 原生 MCP server 仅作为平台内部适配能力或实现参考，不直接作为最终用户入口

### 9.2 推荐 MCP 工具
- `kb_list`
- `kb_query`
- `kb_path`
- `kb_explain`
- `kb_status`
- `kb_artifacts`

### 9.3 MCP 请求/响应契约

#### `kb_list`
输入：
- 无，或可选 `project_id`

输出至少包含：
- `kb_id`
- `name`
- `project_id`
- `status`
- `active_release_id`
- `updated_at`

#### `kb_query`
输入至少包含：
- `kb_id`
- `question`
- 可选 `mode`
- 可选 `budget`
- 可选 `context_filters`

输出至少包含：
- `kb_id`
- `release_id`
- `updated_at`
- `answer`
- `source_locations`
- `artifact_refs`

说明：`answer` 保持 graphify query 语义，不强行改写为聊天式长答案。

#### `kb_path`
输入至少包含：
- `kb_id`
- `source`
- `target`

输出至少包含：
- `kb_id`
- `release_id`
- `path`
- `hop_count`
- `source_locations`
- `artifact_refs`

#### `kb_explain`
输入至少包含：
- `kb_id`
- `node`

输出至少包含：
- `kb_id`
- `release_id`
- `explanation`
- `related_nodes`
- `source_locations`
- `artifact_refs`

#### `kb_status`
输入至少包含：
- `kb_id`

输出至少包含：
- `kb_id`
- `status`
- `active_release_id`
- `graph_status`
- `vault_status`
- `last_build_job_id`
- `last_build_at`

#### `kb_artifacts`
输入至少包含：
- `kb_id`

输出至少包含：
- `kb_id`
- `release_id`
- `artifacts`
- `artifact_status`

### 9.4 MCP 返回示例

#### 9.4.1 `kb_list` 返回示例
```json
{
  "items": [
    {
      "kb_id": "kb_checkout_core",
      "name": "Checkout Core Knowledge Base",
      "project_id": "proj_delivery_alpha",
      "status": "ready",
      "active_release_id": "rel_2026_05_19_001",
      "updated_at": "2026-05-19T10:42:00Z"
    },
    {
      "kb_id": "kb_api_standards",
      "name": "API Standards Knowledge Base",
      "project_id": "proj_delivery_alpha",
      "status": "building",
      "active_release_id": "rel_2026_05_18_003",
      "updated_at": "2026-05-19T09:12:00Z"
    }
  ]
}
```

#### 9.4.2 `kb_query` 返回示例
```json
{
  "kb_id": "kb_checkout_core",
  "release_id": "rel_2026_05_19_001",
  "updated_at": "2026-05-19T10:42:00Z",
  "answer": "Order pricing is resolved in PricingService, then propagated through CheckoutAggregate before final submission.",
  "source_locations": [
    {
      "type": "code",
      "path": "services/pricing/pricing_service.py",
      "line_start": 42,
      "line_end": 97
    },
    {
      "type": "doc",
      "path": "docs/checkout/price-flow.md",
      "section": "Price Calculation Flow"
    }
  ],
  "artifact_refs": {
    "report": "/artifacts/rel_2026_05_19_001/report",
    "html": "/artifacts/rel_2026_05_19_001/graph.html",
    "vault": "/artifacts/rel_2026_05_19_001/vault"
  }
}
```

#### 9.4.3 `kb_path` 返回示例
```json
{
  "kb_id": "kb_checkout_core",
  "release_id": "rel_2026_05_19_001",
  "updated_at": "2026-05-19T10:42:00Z",
  "path": [
    "CheckoutController",
    "CheckoutService",
    "PricingService",
    "PromotionEngine"
  ],
  "hop_count": 3,
  "source_locations": [
    {
      "type": "code",
      "path": "app/controllers/checkout_controller.ts",
      "line_start": 18,
      "line_end": 61
    }
  ],
  "artifact_refs": {
    "html": "/artifacts/rel_2026_05_19_001/graph.html"
  }
}
```

#### 9.4.4 `kb_explain` 返回示例
```json
{
  "kb_id": "kb_checkout_core",
  "release_id": "rel_2026_05_19_001",
  "updated_at": "2026-05-19T10:42:00Z",
  "explanation": "PromotionEngine evaluates campaign eligibility and emits discount decisions consumed by PricingService.",
  "related_nodes": [
    "PricingService",
    "CampaignRule",
    "CouponValidator"
  ],
  "source_locations": [
    {
      "type": "code",
      "path": "domain/promotion/engine.ts",
      "line_start": 1,
      "line_end": 132
    }
  ],
  "artifact_refs": {
    "report": "/artifacts/rel_2026_05_19_001/report"
  }
}
```

#### 9.4.5 `kb_status` 返回示例
```json
{
  "kb_id": "kb_checkout_core",
  "status": "ready",
  "active_release_id": "rel_2026_05_19_001",
  "graph_status": "ready",
  "vault_status": "ready",
  "last_build_job_id": "job_2026_05_19_0021",
  "last_build_at": "2026-05-19T10:40:13Z"
}
```

#### 9.4.6 `kb_artifacts` 返回示例
```json
{
  "kb_id": "kb_checkout_core",
  "release_id": "rel_2026_05_19_001",
  "artifact_status": {
    "graph": "ready",
    "report": "ready",
    "html": "ready",
    "wiki": "ready",
    "vault": "ready",
    "logs": "ready",
    "manifest": "ready"
  },
  "artifacts": [
    {
      "artifact_type": "graph",
      "artifact_status": "ready",
      "artifact_path": "/artifacts/rel_2026_05_19_001/graph.json"
    },
    {
      "artifact_type": "html",
      "artifact_status": "ready",
      "artifact_path": "/artifacts/rel_2026_05_19_001/graph.html"
    },
    {
      "artifact_type": "vault",
      "artifact_status": "ready",
      "artifact_path": "/artifacts/rel_2026_05_19_001/vault"
    }
  ]
}
```

### 9.5 错误语义
MCP Gateway 至少要稳定区分这些错误：
- `knowledge_base_not_found`
- `knowledge_base_not_ready`
- `active_release_missing`
- `active_graph_missing`
- `build_in_progress`
- `graph_corrupted`
- `invalid_query_params`

错误返回至少包含：
- `error_code`
- `message`
- `kb_id`（如果请求中提供）
- `retryable`

错误返回示例：

#### 9.5.1 `knowledge_base_not_found`
```json
{
  "error_code": "knowledge_base_not_found",
  "message": "Knowledge base 'kb_unknown' does not exist.",
  "kb_id": "kb_unknown",
  "retryable": false
}
```

#### 9.5.2 `knowledge_base_not_ready`
```json
{
  "error_code": "knowledge_base_not_ready",
  "message": "Knowledge base 'kb_checkout_core' has no queryable active graph yet.",
  "kb_id": "kb_checkout_core",
  "retryable": true
}
```

#### 9.5.3 `build_in_progress`
```json
{
  "error_code": "build_in_progress",
  "message": "Knowledge base 'kb_checkout_core' is building. Query against latest stable active release or retry later.",
  "kb_id": "kb_checkout_core",
  "retryable": true
}
```

#### 9.5.4 `invalid_query_params`
```json
{
  "error_code": "invalid_query_params",
  "message": "Field 'question' is required for kb_query.",
  "kb_id": "kb_checkout_core",
  "retryable": false
}
```

### 9.6 返回结果约束
- 所有查询类 MCP 返回都必须带 `kb_id` 与 `release_id`
- 所有查询类返回都应带 `updated_at` 或等价发布时间信息
- 所有查询类返回都应尽量带 `source_locations`
- `artifact_refs` 用于链接 report/html/wiki/vault 等辅助产物
- Gateway 返回结构应稳定，不直接透传 graphify CLI 原始 stdout 文本

### 9.7 不做
- 不做每 KB 一个独立 MCP server
- 不做 graphify 原生 MCP server 对外直连
- 不做 Obsidian 查询型 MCP 主链路
- 不做跨库 query

## 10. 前端管理台

### 10.1 定位
不是聊天产品。
是 **知识库运营控制台**。

前端体验核心目标不是让用户“对话”，而是让用户：
- 看清知识库结构
- 看清 release 与 artifact 状态
- 直接阅读知识产物
- 直接定位构建问题
- 直接访问 MCP 接入信息

### 10.2 设计方向
V1 前端视觉与交互风格采用 **Library / Archive Modernist**。

整体气质应当是：
- 安静
- 克制
- 可深度阅读
- 有档案馆与研究室气质
- 强调结构、目录、索引、版本与出处

明确避免：
- 通用 SaaS dashboard 风格
- AI chat 产品风格
- 过度 KPI 化大屏
- 花哨但不利于阅读的卡片堆砌

前端第一感受应更接近：
- 数字档案馆
- 研究资料阅览台
- 知识目录与版本馆

而不是：
- 聊天机器人
- 通用 BI 面板
- 普通后台 CRUD 页面

### 10.3 信息设计原则
- **阅读优先**：页面首先服务于阅读、核对、追溯，而不是营销式展示。
- **索引优先**：Project、Source、Knowledge Base、Release、Artifact 都要可被目录化浏览。
- **出处优先**：所有关键结果尽量带 source、release、updated_at、artifact status。
- **状态可见**：build、release、artifact 的状态必须在界面上持续可见。
- **层次稳定**：导航、正文、元信息区布局保持稳定，降低切换成本。
- **查询非聊天化**：Query Playground 是查询实验台，不是消息气泡聊天窗口。

### 10.4 视觉系统建议
#### 10.4.1 色彩
推荐以浅色阅读底为默认主题：
- 背景：warm paper / archive white
- 主文字：深墨色
- 次级信息：灰褐或冷灰
- 强调色：深蓝、铜色、暗绿三者择一作为系统主强调
- 状态色：success / warning / error / degraded 需克制，不使用高饱和荧光色

`graph.html` 预览页可允许独立使用更深色容器或全屏模式，以兼容原始 artifact 展示需求。

#### 10.4.2 字体
- 标题字体：有书卷感、目录感、编辑感
- 正文字体：长文可读性优先
- 元信息与路径信息：使用 monospace

字体职责建议：
- 页面标题、KB 名称、章节标题：偏 editorial / archive 风格
- 正文描述、文档摘要、说明文本：偏 humanist / reading 风格
- `kb_id`、`release_id`、路径、checksum、时间戳：monospace

#### 10.4.3 布局
推荐以 **稳定三段式阅读布局** 为主：
- 左侧：目录 / 导航 / filter
- 中间：主内容 / 文档 / artifact
- 右侧：metadata / status / actions

在超宽屏下，KB 详情页与 Artifact Viewer 应优先保证中间阅读区宽度舒适，而不是无限拉伸。

#### 10.4.4 动效
- 动效应轻量、低频、服务于状态感知
- 推荐：section reveal、hover emphasis、status pulse、timeline progression
- 禁止使用持续闪烁、强打扰 loading 动画

### 10.5 主模块
1. Dashboard
2. Projects
3. Sources
4. Knowledge Bases
5. Build Jobs
6. Artifacts
7. Query Playground

### 10.6 页面级设计要求
#### 10.6.1 Dashboard
Dashboard 应更像“知识库总览馆”，不是 KPI 墙。

建议展示：
- Project 数量
- Knowledge Base 数量
- 最近 build 状态流
- 最近 release 激活记录
- 待处理失败任务
- 最近更新的 Source / KB

展示方式建议：
- 以目录摘要、时间线、状态索引为主
- 少量核心数字即可，不堆大面积统计卡
- 最近变更与失败事项优先级高于总量数字

#### 10.6.2 Sources 列表页
Sources 页面应表现为“资料来源目录”。

每个 Source 卡片或行项至少突出：
- Source 名称
- 类型
- 所属 Project
- `source_ref`
- sync 状态
- 最近同步时间
- 被多少 KB 复用

支持：
- 按 type / status / project filter
- 查看来源详情
- 触发 validate / sync

#### 10.6.3 Source 详情页
应强调“来源真实性与可追溯性”。

建议分区：
- 基础信息
- 访问与同步配置
- include/exclude 规则
- 最近 sync 历史
- 被哪些 KB 绑定
- 最近构建使用情况

#### 10.6.4 Knowledge Bases 列表页
KB 列表页应更像“馆藏目录 / catalog index”。

每个 KB 行项至少显示：
- KB 名称
- 所属 Project
- 绑定 Source 数
- active release
- graph 状态
- vault 状态
- 最近 build 时间
- 最近更新时间

支持：
- 按 project / status / source type filter
- 按最近更新排序
- 快速进入 Query Playground / Artifact Viewer

#### 10.6.5 KB 详情页
KB 详情页是前端最核心页面，必须偏阅读型而不是表单型。

建议结构：
- 顶部：KB 标题区
- 左侧：章节导航与 source outline
- 中间：active release、artifact、说明与可读内容
- 右侧：metadata、status、actions、MCP access

重点内容至少包含：
- 基本信息
- Source Bindings
- Active Version
- Release 历史
- Artifacts
- MCP Access
- 最近 Build Jobs

页面体验要求：
- 用户进入后应能快速知道“当前 active release 是谁、是否可查询、有哪些可读产物、最近一次构建是否健康”
- `graph ready / vault degraded` 这类状态必须显式可见

#### 10.6.6 Build Jobs 列表页
Build Jobs 页面应使用“任务档案 / 执行时间线”视觉，而不是简单日志表格。

每个 job 至少显示：
- `job_id`
- `kb_id`
- build type
- status
- started_at
- finished_at
- release_id
- error_summary

支持：
- 按状态筛选
- 查看阶段化进度
- 查看日志
- retry / cancel

#### 10.6.7 Build Job 详情页
Build Job 详情页应突出阶段化执行过程。

建议分区：
- Job 概览
- 阶段时间线
- 结构化状态
- stdout / stderr / enhancement 日志
- artifact 注册结果
- release 注册结果

重点要求：
- Stage 1~7 状态清晰可见
- 默认先展示结构化阶段状态，再允许展开原始日志
- 失败时应能快速定位失败阶段

#### 10.6.8 Artifact Viewer
Artifact Viewer 是 V1 关键交付，不是附件下载页。

至少支持四类查看模式：
- `graph.html` viewer
- Markdown viewer（`GRAPH_REPORT.md` 等）
- vault browser
- artifact metadata viewer

`graph.html` 交付要求：
- 前端管理台应可直接查看 `graph.html`
- KB 详情页与 Artifacts 页都要提供直接预览入口
- 优先支持内嵌 viewer
- 若因 CSP、静态资源或体积限制不能稳定内嵌，则至少提供稳定新标签页查看
- 不接受仅提供下载链接而不能直接查看

vault browser 建议能力：
- 左侧树形目录
- 中间 Markdown 阅读区
- 右侧 note metadata / version / source refs

artifact metadata viewer 至少展示：
- artifact type
- artifact status
- artifact path
- size
- checksum
- generated_at
- release_id

#### 10.6.9 Query Playground
Query Playground 是“查询实验台”，不是聊天页面。

支持：
- 选择 `kb_id`
- 输入 `question` / `source` / `target` / `node`
- 切换 `query` / `path` / `explain`
- 展示结构化结果
- 展示 `source_locations`
- 展示 `artifact_refs`
- 展示 `release_id`

交互要求：
- 输入区应简洁、研究工具化
- 输出区应偏文档结果视图，而不是消息气泡
- 支持复制 `kb_id`、结果 JSON、MCP 示例入参

### 10.7 关键组件建议
建议优先沉淀这些前端组件：
- `ArchiveSidebar`
- `KnowledgeHeader`
- `ReleaseStatusChips`
- `SourceBindingTable`
- `BuildTimeline`
- `ArtifactPreviewPanel`
- `GraphArtifactViewer`
- `VaultIndexBrowser`
- `MetadataRail`
- `QueryResultPanel`

组件原则：
- 风格统一
- 以阅读与状态可见性优先
- 避免通用后台模板味道

### 10.8 前端交付范围
V1 前端至少交付这些页面：
- Dashboard
- Sources List
- Source Detail
- Knowledge Bases List
- KB Detail
- Build Jobs List
- Build Job Detail
- Artifact Viewer
- Query Playground

### 10.9 前端实现建议
推荐：
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query

实现要求：
- 组件层和页面层分离
- artifact viewer 与普通业务表单组件分离
- 状态字段命名与后端 API 返回保持一致
- 对 `partial_success`、`degraded`、`active release missing` 等状态有明确视觉表达
- 页面默认优先桌面端阅读体验，再兼容中等宽度屏幕

### 10.10 Source 与 Knowledge Base API 细节

#### 10.11.1 Source API
建议最少提供这些 API：
- `POST /api/projects/{project_id}/sources`
  - 创建 Source
- `GET /api/projects/{project_id}/sources`
  - 列出项目下 Source
- `GET /api/sources/{source_id}`
  - 查看 Source 详情
- `PATCH /api/sources/{source_id}`
  - 更新 Source 基础配置
- `POST /api/sources/{source_id}/sync`
  - 手动触发 Source 同步
- `GET /api/sources/{source_id}/sync-status`
  - 查看最近同步状态
- `POST /api/sources/{source_id}/validate`
  - 校验 Source 是否可访问、配置是否正确

Source API 返回至少包含：
- `id`
- `project_id`
- `name`
- `type`
- `status`
- `source_ref`
- `sync_strategy`
- `last_synced_at`
- `created_at`
- `updated_at`

创建请求示例：
```json
{
  "name": "checkout-service",
  "type": "github_repo",
  "source_ref": "acme/checkout-service",
  "description": "Checkout service source repository.",
  "auth_config": {
    "credential_ref": "github-app-prod"
  },
  "sync_strategy": "webhook",
  "include_rules": ["src/**", "docs/**"],
  "exclude_rules": ["vendor/**", "tmp/**"],
  "normalization_options": {
    "extract_pdf_text": true,
    "preserve_metadata": true
  }
}
```

返回示例：
```json
{
  "id": "src_checkout_repo",
  "project_id": "proj_delivery_alpha",
  "name": "checkout-service",
  "type": "github_repo",
  "status": "active",
  "source_ref": "acme/checkout-service",
  "sync_strategy": "webhook",
  "last_synced_at": "2026-05-19T09:58:00Z",
  "created_at": "2026-05-12T08:10:00Z",
  "updated_at": "2026-05-19T09:58:00Z"
}
```

分页列表示例：
```json
{
  "items": [
    {
      "id": "src_checkout_repo",
      "project_id": "proj_delivery_alpha",
      "name": "checkout-service",
      "type": "github_repo",
      "status": "active",
      "source_ref": "acme/checkout-service",
      "sync_strategy": "webhook",
      "last_synced_at": "2026-05-19T09:58:00Z",
      "created_at": "2026-05-12T08:10:00Z",
      "updated_at": "2026-05-19T09:58:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1
}
```

#### 10.11.2 Knowledge Base API
建议最少提供这些 API：
- `POST /api/projects/{project_id}/knowledge-bases`
  - 创建 Knowledge Base
- `GET /api/projects/{project_id}/knowledge-bases`
  - 列出项目下 Knowledge Base
- `GET /api/knowledge-bases/{kb_id}`
  - 查看 Knowledge Base 详情
- `PATCH /api/knowledge-bases/{kb_id}`
  - 更新 Knowledge Base 基础信息与发布策略
- `POST /api/knowledge-bases/{kb_id}/activate/{release_id}`
  - 手动激活 release（为未来 `manual_activate` 预留）
- `GET /api/knowledge-bases/{kb_id}/releases`
  - 列出 release 历史
- `GET /api/knowledge-bases/{kb_id}/artifacts`
  - 查看当前 active release artifacts

Knowledge Base API 返回至少包含：
- `id`
- `project_id`
- `name`
- `status`
- `active_release_id`
- `visibility`
- `created_at`
- `updated_at`

创建请求示例：
```json
{
  "name": "Checkout Core Knowledge Base",
  "visibility": "org_shared",
  "description": "Knowledge base for checkout domain code and docs.",
  "release_policy": {
    "activation_mode": "auto_activate"
  }
}
```

返回示例：
```json
{
  "id": "kb_checkout_core",
  "project_id": "proj_delivery_alpha",
  "name": "Checkout Core Knowledge Base",
  "status": "ready",
  "active_release_id": "rel_2026_05_19_001",
  "visibility": "org_shared",
  "created_at": "2026-05-12T10:00:00Z",
  "updated_at": "2026-05-19T10:42:00Z"
}
```

分页列表示例：
```json
{
  "items": [
    {
      "id": "kb_checkout_core",
      "project_id": "proj_delivery_alpha",
      "name": "Checkout Core Knowledge Base",
      "status": "ready",
      "active_release_id": "rel_2026_05_19_001",
      "visibility": "org_shared",
      "created_at": "2026-05-12T10:00:00Z",
      "updated_at": "2026-05-19T10:42:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1
}
```

#### 10.11.3 Source Binding API
建议最少提供这些 API：
- `POST /api/knowledge-bases/{kb_id}/bindings`
  - 绑定 Source 到 Knowledge Base
- `GET /api/knowledge-bases/{kb_id}/bindings`
  - 列出 KB 当前 bindings
- `PATCH /api/knowledge-bases/{kb_id}/bindings/{binding_id}`
  - 更新 include/exclude/scope override
- `DELETE /api/knowledge-bases/{kb_id}/bindings/{binding_id}`
  - 解除绑定

binding API 返回至少包含：
- `id`
- `knowledge_base_id`
- `source_id`
- `binding_status`
- `scope_override`
- `include_rules_override`
- `exclude_rules_override`
- `priority`

创建请求示例：
```json
{
  "source_id": "src_checkout_repo",
  "binding_status": "active",
  "scope_override": {
    "tracked_branches": ["main"]
  },
  "include_rules_override": [
    "src/**",
    "docs/checkout/**"
  ],
  "exclude_rules_override": [
    "tests/fixtures/**"
  ],
  "priority": 100
}
```

返回示例：
```json
{
  "id": "bind_checkout_repo_main",
  "knowledge_base_id": "kb_checkout_core",
  "source_id": "src_checkout_repo",
  "binding_status": "active",
  "scope_override": {
    "tracked_branches": ["main"]
  },
  "include_rules_override": [
    "src/**",
    "docs/checkout/**"
  ],
  "exclude_rules_override": [
    "tests/fixtures/**"
  ],
  "priority": 100
}
```

列表示例：
```json
{
  "items": [
    {
      "id": "bind_checkout_repo_main",
      "knowledge_base_id": "kb_checkout_core",
      "source_id": "src_checkout_repo",
      "binding_status": "active",
      "scope_override": {
        "tracked_branches": ["main"]
      },
      "include_rules_override": ["src/**", "docs/checkout/**"],
      "exclude_rules_override": ["tests/fixtures/**"],
      "priority": 100
    }
  ],
  "total": 1
}
```

#### 10.11.4 Build API
建议最少提供这些 API：
- `POST /api/knowledge-bases/{kb_id}/builds`
  - 发起 build，支持 `full_build` / `incremental_update` / `sync_only`
- `GET /api/knowledge-bases/{kb_id}/builds`
  - 列出 build 历史
- `GET /api/build-jobs/{job_id}`
  - 查看单个 build job 详情
- `GET /api/build-jobs/{job_id}/logs`
  - 查看 build job 日志
- `POST /api/build-jobs/{job_id}/retry`
  - 重试失败任务
- `POST /api/build-jobs/{job_id}/cancel`
  - 取消运行中任务

Build API 返回至少包含：
- `job_id`
- `knowledge_base_id`
- `build_type`
- `status`
- `release_id`
- `started_at`
- `finished_at`
- `error_summary`

创建请求示例：
```json
{
  "build_type": "incremental_update",
  "triggered_by": "manual",
  "reason": "Sync latest checkout service changes."
}
```

返回示例：
```json
{
  "job_id": "job_2026_05_19_0021",
  "knowledge_base_id": "kb_checkout_core",
  "build_type": "incremental_update",
  "status": "completed",
  "release_id": "rel_2026_05_19_001",
  "started_at": "2026-05-19T10:31:02Z",
  "finished_at": "2026-05-19T10:40:13Z",
  "error_summary": null
}
```

分页列表示例：
```json
{
  "items": [
    {
      "job_id": "job_2026_05_19_0021",
      "knowledge_base_id": "kb_checkout_core",
      "build_type": "incremental_update",
      "status": "completed",
      "release_id": "rel_2026_05_19_001",
      "started_at": "2026-05-19T10:31:02Z",
      "finished_at": "2026-05-19T10:40:13Z",
      "error_summary": null
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1
}
```

#### 10.11.5 Release / Artifact 列表返回示例
`GET /api/knowledge-bases/{kb_id}/releases` 示例：
```json
{
  "items": [
    {
      "id": "rel_2026_05_19_001",
      "knowledge_base_id": "kb_checkout_core",
      "build_job_id": "job_2026_05_19_0021",
      "version": "2026.05.19.001",
      "status": "completed",
      "activated_at": "2026-05-19T10:42:00Z",
      "created_at": "2026-05-19T10:40:13Z",
      "artifact_status": {
        "graph": "ready",
        "vault": "ready",
        "html": "ready"
      }
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1
}
```

`GET /api/knowledge-bases/{kb_id}/artifacts` 示例：
```json
{
  "kb_id": "kb_checkout_core",
  "release_id": "rel_2026_05_19_001",
  "artifacts": [
    {
      "artifact_type": "graph",
      "artifact_status": "ready",
      "artifact_path": "/artifacts/rel_2026_05_19_001/graph.json",
      "size": 1823442,
      "checksum": "sha256:abc123",
      "generated_at": "2026-05-19T10:39:58Z"
    },
    {
      "artifact_type": "vault",
      "artifact_status": "ready",
      "artifact_path": "/artifacts/rel_2026_05_19_001/vault",
      "size": 842311,
      "checksum": "sha256:def456",
      "generated_at": "2026-05-19T10:40:09Z"
    }
  ]
}
```

#### 10.11.6 API 错误返回示例
HTTP API 错误返回建议统一结构：
- `error_code`
- `message`
- `request_id`
- `details`

示例一：Source 校验失败
```json
{
  "error_code": "source_validation_failed",
  "message": "Source 'src_checkout_repo' cannot be accessed with current auth configuration.",
  "request_id": "req_2026_05_19_00031",
  "details": {
    "source_id": "src_checkout_repo",
    "failed_step": "validate_access",
    "retryable": false
  }
}
```

示例二：Knowledge Base 未就绪
```json
{
  "error_code": "knowledge_base_not_ready",
  "message": "Knowledge base 'kb_checkout_core' has no active release yet.",
  "request_id": "req_2026_05_19_00032",
  "details": {
    "kb_id": "kb_checkout_core",
    "active_release_id": null,
    "retryable": true
  }
}
```

示例三：Build 冲突
```json
{
  "error_code": "build_conflict",
  "message": "Knowledge base 'kb_checkout_core' already has a running build job.",
  "request_id": "req_2026_05_19_00033",
  "details": {
    "kb_id": "kb_checkout_core",
    "running_job_id": "job_2026_05_19_0021",
    "retryable": true
  }
}
```

示例四：Artifact 降级但 release 可用
```json
{
  "error_code": "artifact_degraded",
  "message": "Active release is queryable, but vault artifact is degraded.",
  "request_id": "req_2026_05_19_00034",
  "details": {
    "kb_id": "kb_checkout_core",
    "release_id": "rel_2026_05_19_001",
    "artifact_type": "vault",
    "artifact_status": "degraded",
    "retryable": false
  }
}
```

#### 10.11.7 API 设计约束
- Source、Knowledge Base、Binding、Build API 返回结构应稳定，不直接暴露底层 graphify CLI 参数细节
- 创建与更新接口应接受结构化字段，而不是一整段自由文本配置
- 所有详情接口都应返回可被前端直接消费的状态字段，不要求前端自行拼装 release / artifact 关系
- 所有写操作都应返回对应对象最新状态，避免前端额外立即刷新

## 11. 存储设计

### 11.1 三类存储
#### 平台元数据库
建议 PostgreSQL。存：
- project
- source
- knowledge_base
- knowledge_base_source_binding
- build_job
- release
- artifact_version
- mcp_route
- visibility 等

#### graphify artifact storage
存：
- graph.json
- GRAPH_REPORT.md
- graph.html
- wiki
- svg / graphml / cypher
- logs
- manifest
- analysis

#### Obsidian vault storage
存：
- vault 文件树与附件

### 11.2 active release 与 artifact version
- 平台对外只维护一个 `active release` 概念。
- MCP、前端、管理台默认都读取 `active release`。
- `active release` 必须具备可用 graph。
- release 内部各 artifact 可有不同状态，例如 graph 为 `ready`、vault 为 `degraded`。
- `artifact_version` 用于记录 release 内部每类 artifact 的路径、状态与元数据。
- 平台不维护 graph active version 与 vault active version 两套独立对外切换入口。

## 12. 构建任务与调度

### 12.1 build job 状态机
- `pending`
- `preparing_sources`
- `running_graphify`
- `generating_obsidian`
- `registering_artifacts`
- `completed`
- `partial_success`
- `failed`
- `cancelled`

状态机说明：
- `full_build` / `incremental_update` 走完整状态流
- `sync_only` 只走 `pending -> preparing_sources -> completed/failed`
- `completed`：graph 与 Obsidian 都成功
- `partial_success`：graph 成功，Obsidian 失败
- `failed`：graph 失败，或 source 准备失败

### 12.2 调度来源
- manual
- scheduled
- webhook

### 12.3 资源控制
- 单 KB 同时只跑 1 个 job
- 全局并发上限
- 超时
- 重试
- 大库排队

### 12.4 发布策略
- 支持 `auto_activate`
- 预留 `manual_activate`
- V1 默认 `auto_activate`

## 13. V1 技术选型

### 13.1 后端
推荐：
- Python
- FastAPI
- PostgreSQL
- Celery
- Redis

### 13.2 worker
- Python worker 独立运行 graphify tasks

### 13.3 前端
推荐：
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query

### 13.4 存储
- PostgreSQL：元数据
- Redis：队列与状态
- 文件系统 / S3：artifacts

### 13.5 graphify 集成
- V1 先用 CLI wrapper
- 后续逐步转 Python API wrapper

### 13.6 MCP
- 平台内置统一 MCP Gateway

## 14. V1 范围

### 14.1 必做
- 多知识库管理
- graphify 托管运行
- active version 管理
- MCP 单入口查询
- 前端运营台
- 基于 graphify export 的 Obsidian 人类阅读层
- graphify 原生产物保留

### 14.2 非目标
- cross-KB query
- global merged graph query
- vector RAG 主链路
- 复杂 RBAC
- 多租户计费
- 微服务大拆
- k8s-first
- 复杂人工协作工作流

## 15. V1 成功标准

1. **可管理**
   - 可创建 Project / Source / KB
   - 可看清 KB 状态与版本

2. **可构建**
   - 可稳定发起 full / incremental build
   - graphify 在平台中稳定跑通

3. **可查询**
   - agent 能通过 MCP 对指定 kb_id 稳定执行 query/path/explain
   - 不串库

4. **可阅读**
   - 人能查看 vault / report / html / wiki
   - artifact 可追溯

5. **可运维**
   - 平台能看 build history / logs / active version
   - 新构建失败不影响现有查询

## 16. 最小可演示闭环
1. 新建 Project
2. 绑定 GitHub repo / 文档源等 Source
3. 新建 Knowledge Base
4. 发起 build
5. 成功产出 graph + vault
6. 前端查看 artifacts
7. agent 通过 MCP 指定 kb_id 调 `query/path/explain`

## 17. 总结
这个系统不是普通 RAG 平台，不是 Obsidian 管理器，也不是只包一层 query UI。

它是：

**基于 graphify 全链路知识引擎，构建的多知识库托管、治理、发布与查询平台。**
