# API 参考文档

Base URL: `http://localhost:8000`

## 通用约定

- 响应格式：JSON
- 分页参数：`page` (default=1), `page_size` (default=20, max=100)
- 分页响应：`{"items": [...], "page": 1, "page_size": 20, "total": N}`

## REST API

### 项目 & Source

#### `POST /api/projects/{project_id}/sources`

创建数据源。

```json
// request
{
  "name": "checkout-service",
  "type": "markdown_dir",
  "source_ref": "https://github.com/acme/checkout-service.git",
  "git_tracking_branch": "main",
  "git_poll_interval_minutes": 30
}
```

`type`: `markdown_dir` | `doc_site` (含 `.git/` 时自动开启 git 跟踪)
`git_tracking_branch`: 默认 `main`
`git_poll_interval_minutes`: 0 = 不轮询

```json
// response (201)
{
  "id": "src_7967b607db94",
  "project_id": "proj_delivery_alpha",
  "name": "checkout-service",
  "type": "markdown_dir",
  "status": "active",
  "source_ref": "https://github.com/acme/checkout-service.git",
  "git_tracking_branch": "main",
  "git_poll_interval_minutes": 30,
  "git_last_commit": null,
  "created_at": "2026-05-20T16:21:23",
  "updated_at": "2026-05-20T16:21:23"
}
```

#### `GET /api/projects/{project_id}/sources`

分页列出项目下所有 Source。

---

### 知识库 (Knowledge Base)

#### `POST /api/projects/{project_id}/knowledge-bases`

创建知识库。

```json
// request
{
  "name": "Checkout Core",
  "visibility": "org_shared",
  "llm_backend": "deepseek",
  "llm_api_key_ref": "env:DEEPSEEK_API_KEY",
  "llm_model_override": "deepseek-v4-flash",
  "llm_extraction_budget": 30000,
  "llm_base_url_override": "https://api.deepseek.com/v1"
}
```

```json
// response (201)
{
  "id": "kb_f871e0fc2f2b",
  "project_id": "proj_delivery_alpha",
  "name": "Checkout Core",
  "status": "ready",
  "visibility": "org_shared",
  "active_release_id": null,
  "llm_backend": "deepseek",
  "llm_api_key_ref": "env:DEEPSEEK_API_KEY",
  "llm_model_override": "deepseek-v4-flash",
  "created_at": "2026-05-19T16:27:45"
}
```

#### `GET /api/projects/{project_id}/knowledge-bases`

分页列出项目下所有 KB。

#### `GET /api/knowledge-bases/{kb_id}`

获取单个 KB 详情。

---

### Source Binding

#### `POST /api/knowledge-bases/{kb_id}/bindings`

将 Source 绑定到知识库。

```json
// request
{
  "source_id": "src_7967b607db94",
  "binding_status": "active"
}
```

```json
// response (201)
{
  "id": "bind_5cc68cca2fa9",
  "knowledge_base_id": "kb_f871e0fc2f2b",
  "source_id": "src_7967b607db94",
  "binding_status": "active"
}
```

---

### Build Job

#### `POST /api/knowledge-bases/{kb_id}/builds`

触发知识图谱构建。**异步执行**，立即返回 202，前端轮询任务状态。

```json
// request
{
  "build_type": "full_rebuild",
  "triggered_by": "manual",
  "reason": "initial build"
}
```

`build_type`: `full_rebuild` | `incremental_update`

```json
// response (202 Accepted)
{
  "job_id": "job_0898194ed50d",
  "knowledge_base_id": "kb_f871e0fc2f2b",
  "build_type": "full_rebuild",
  "triggered_by": "manual",
  "reason": "initial build",
  "status": "pending",
  "release_id": null,
  "current_stage": null,
  "started_at": "2026-05-20T16:52:01",
  "finished_at": null,
  "error_summary": null,
  "stages": null
}
```

#### `GET /api/knowledge-bases/{kb_id}/builds`

分页列出 KB 的所有 Build Job。

#### `GET /api/build-jobs/{job_id}`

获取单个 Build Job 详情。

---

### Release & Artifacts

#### `GET /api/knowledge-bases/{kb_id}/releases`

分页列出 KB 的所有 Release。

```json
{
  "items": [
    {
      "id": "rel_dc338a7102f1",
      "knowledge_base_id": "kb_f871e0fc2f2b",
      "build_job_id": "job_0898194ed50d",
      "version": "20260519_165201",
      "status": "draft",
      "artifact_status": {
        "graph": "ready",
        "report": "ready",
        "html": "ready",
        "obsidian_vault": "ready",
        "wiki": "ready",
        "svg": "ready",
        "graphml": "ready",
        "logs": "ready"
      },
      "created_at": "2026-05-19T16:52:01"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1
}
```

#### `GET /api/knowledge-bases/{kb_id}/artifacts`

获取 KB 当前活跃 Release 的 Artifact 清单。

```json
{
  "kb_id": "kb_f871e0fc2f2b",
  "release_id": "rel_dc338a7102f1",
  "artifacts": [
    {
      "id": "art_rel_dc338a7102f1_graph",
      "release_id": "rel_dc338a7102f1",
      "artifact_type": "graph",
      "artifact_status": "ready",
      "artifact_path": "data/projects/proj_xxx/kb/kb_f871e0fc2f2b/builds/job_0898194ed50d/out/graph.json"
    }
  ]
}
```

Artifact 类型：`graph` | `report` | `html` | `obsidian_vault` | `wiki` | `svg` | `graphml` | `logs`

---

## MCP 端点

MCP 端点前缀：`/mcp`

### `POST /mcp/kb_status`

查询 KB 和图状态。

```json
// request
{"kb_id": "kb_f871e0fc2f2b"}

// response
{
  "kb_id": "kb_f871e0fc2f2b",
  "status": "ready",
  "active_release_id": "rel_dc338a7102f1",
  "graph_status": "ready",
  "artifact_status": {
    "graph": "ready",
    "report": "ready",
    ...
  }
}
```

### `POST /mcp/kb_list`

列出 KB。

```json
// request
{"project_id": "proj_delivery_alpha"}

// response
{
  "items": [
    {
      "id": "kb_f871e0fc2f2b",
      "name": "DeepSeek Test KB",
      "project_id": "proj_delivery_alpha",
      "status": "ready",
      "active_release_id": "rel_dc338a7102f1"
    }
  ]
}
```

### `POST /mcp/kb_query`

查询知识图谱。

```json
// request
{
  "kb_id": "kb_f871e0fc2f2b",
  "question": "list all modules",
  "mode": "bfs",
  "budget": 500
}

// response
{
  "kb_id": "kb_f871e0fc2f2b",
  "release_id": "rel_dc338a7102f1",
  "answer": "...",
  "source_locations": ["checkout.py:10"],
  "artifact_refs": {}
}
```

### `POST /mcp/kb_path`

查询两节点间路径。

```json
// request
{
  "kb_id": "kb_f871e0fc2f2b",
  "source_label": "checkout_service",
  "target_label": "validate_order"
}
```

### `POST /mcp/kb_explain`

解释单个节点。

```json
// request
{
  "kb_id": "kb_f871e0fc2f2b",
  "node_label": "checkout_service"
}
```

## 状态码

| 状态码 | 含义 |
|--------|------|
| 201 | 创建成功 |
| 200 | 查询成功 |
| 404 | 资源不存在 |
| 422 | 请求验证失败 |
| 500 | 服务器内部错误 |
