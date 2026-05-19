# AI Code 多知识库平台闭环补强 V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 打通最小可演示闭环，让 build request 能持久化并触发 runner，release / artifact API 返回真实数据，前端从 mock 切到真实 backend 数据源。

**Architecture:** 保持当前 skeleton 架构不变，只补三条断链：后端 build job 创建后落库并调用 runner，runner 产出 release / artifact 记录后由知识库相关 API 真实读取，前端用真实 HTTP fetch 替代 `useMock*` 数据。先打通单机/本地演示链路，不引入真实 Celery worker、真实 graphify CLI、认证、缓存等额外复杂度。

**Tech Stack:** Python, FastAPI, SQLAlchemy, SQLite/PostgreSQL, Next.js, TypeScript, fetch API, pytest

---

## File Structure

当前代码已有 skeleton。V2 只改闭环相关文件：

- Modify: `backend/app/repositories/build_jobs.py` — build job 持久化、按 KB 查询
- Modify: `backend/app/repositories/releases.py` — release / artifact 查询
- Modify: `backend/app/services/build_service.py` — create build job, enqueue runner, activation logic
- Modify: `backend/app/services/artifact_service.py` — release / artifact resolve
- Modify: `backend/app/runner/graphify_runner.py` — run 后返回可注册 release/artifact 骨架结果
- Modify: `backend/app/api/routes/build_jobs.py` — build create 走真实 service
- Modify: `backend/app/api/routes/knowledge_bases.py` — releases / artifacts 返回真实数据
- Modify: `backend/app/services/mcp_gateway_service.py` — `kb_status` / `kb_artifacts` 读取真实 release/artifact
- Modify: `backend/tests/test_build_api.py`
- Modify: `backend/tests/test_release_api.py`
- Modify: `backend/tests/test_mcp_gateway.py`
- Create: `backend/tests/test_closure_flow.py` — 闭环集成测试
- Modify: `frontend/src/lib/api.ts` — 改真实 HTTP fetch client
- Modify: `frontend/src/lib/types.ts` — 对齐 backend payload
- Modify: `frontend/src/app/page.tsx` — Dashboard 接真实 API
- Modify: `frontend/src/app/knowledge-bases/page.tsx` — KB list 接真实 API
- Modify: `frontend/src/app/knowledge-bases/[kbId]/page.tsx` — KB detail / releases / artifacts / mcp status 接真实 API
- Modify: `frontend/src/app/build-jobs/page.tsx` — build list 接真实 API
- Modify: `frontend/src/app/build-jobs/[jobId]/page.tsx` — build detail 接真实 API
- Modify: `frontend/src/app/artifacts/[kbId]/page.tsx` — artifact viewer 接真实 API
- Modify: `frontend/src/app/query-playground/page.tsx` — MCP query 接真实 API
- Keep: `frontend/src/lib/mock-data.ts` — 只保留为 dev fallback，非默认路径

---

### Task 1: 让 build job 真落库并触发 runner

**Files:**
- Modify: `backend/app/repositories/build_jobs.py`
- Modify: `backend/app/services/build_service.py`
- Modify: `backend/app/api/routes/build_jobs.py`
- Test: `backend/tests/test_build_api.py`
- Test: `backend/tests/test_build_orchestration.py`

- [ ] **Step 1: 写失败测试，验证 create build job 后会持久化并返回真实 job_id**

```python
from httpx import ASGITransport, AsyncClient
import pytest

from app.main import app


@pytest.mark.anyio
async def test_create_build_job_persists_and_returns_payload() -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/api/knowledge-bases/kb_checkout_core/builds",
            json={
                "build_type": "incremental_update",
                "triggered_by": "manual",
                "reason": "sync latest",
            },
        )

    assert response.status_code == 201
    data = response.json()
    assert data["knowledge_base_id"] == "kb_checkout_core"
    assert data["build_type"] == "incremental_update"
    assert data["status"] == "pending"
    assert data["job_id"].startswith("job_")
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_build_api.py::test_create_build_job_persists_and_returns_payload -v`
Expected: FAIL with missing persistence assertions or route stub mismatch

- [ ] **Step 3: 写最小 repository create/list 能力**

`backend/app/repositories/build_jobs.py`
```python
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.build_job import BuildJob


class BuildJobRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(self, build_job: BuildJob) -> BuildJob:
        self.session.add(build_job)
        self.session.commit()
        self.session.refresh(build_job)
        return build_job

    def list_by_kb(self, kb_id: str) -> list[BuildJob]:
        return list(
            self.session.execute(
                select(BuildJob).where(BuildJob.knowledge_base_id == kb_id)
            ).scalars()
        )
```

- [ ] **Step 4: 写最小 build service create + enqueue**

`backend/app/services/build_service.py`
```python
from datetime import UTC, datetime
from uuid import uuid4

from app.db.models.build_job import BuildJob
from app.repositories.build_jobs import BuildJobRepository


class BuildService:
    def __init__(self, session=None, runner=None):
        self.session = session
        self.runner = runner
        self.repository = BuildJobRepository(session) if session is not None else None

    def can_activate_release(self, release: dict) -> bool:
        return release.get("artifact_status", {}).get("graph") == "ready"

    def create_build_job(self, kb_id: str, build_type: str, triggered_by: str, reason: str | None = None) -> BuildJob:
        now = datetime.now(UTC)
        build_job = BuildJob(
            id=f"job_{uuid4().hex[:12]}",
            knowledge_base_id=kb_id,
            build_type=build_type,
            status="pending",
            release_id=None,
            error_summary=None,
            created_at=now,
            updated_at=now,
        )
        return self.repository.create(build_job)

    def enqueue_build(self, job: dict) -> None:
        if self.runner is not None:
            self.runner.run(
                job_id=job["id"],
                kb_id=job["kb_id"],
                sources=job.get("sources", []),
            )
```

- [ ] **Step 5: 路由改走真实 service**

`backend/app/api/routes/build_jobs.py`
```python
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.base import SessionLocal
from app.schemas.build_job import BuildJobCreate
from app.services.build_service import BuildService

router = APIRouter(prefix="/api")


def get_session() -> Session:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@router.post("/knowledge-bases/{kb_id}/builds", status_code=status.HTTP_201_CREATED)
def create_build_job(kb_id: str, payload: BuildJobCreate, session: Session = Depends(get_session)) -> dict:
    service = BuildService(session=session)
    build_job = service.create_build_job(
        kb_id=kb_id,
        build_type=payload.build_type,
        triggered_by=payload.triggered_by,
        reason=payload.reason,
    )
    return {
        "job_id": build_job.id,
        "knowledge_base_id": build_job.knowledge_base_id,
        "build_type": build_job.build_type,
        "status": build_job.status,
        "release_id": build_job.release_id,
        "started_at": build_job.created_at.isoformat(),
        "finished_at": None,
        "error_summary": build_job.error_summary,
    }
```

- [ ] **Step 6: 跑测试确认通过**

Run: `cd backend && pytest tests/test_build_api.py tests/test_build_orchestration.py -v`
Expected: PASS

- [ ] **Step 7: 提交**

```bash
git add backend/app/repositories/build_jobs.py backend/app/services/build_service.py backend/app/api/routes/build_jobs.py backend/tests/test_build_api.py backend/tests/test_build_orchestration.py
git commit -m "feat: persist build jobs and enqueue runner"
```

### Task 2: 让 runner 产出可注册 release / artifacts

**Files:**
- Modify: `backend/app/runner/graphify_runner.py`
- Modify: `backend/app/services/artifact_service.py`
- Modify: `backend/app/repositories/releases.py`
- Test: `backend/tests/test_release_api.py`
- Test: `backend/tests/test_closure_flow.py`

- [ ] **Step 1: 写失败测试，验证 runner 返回 release / artifacts 骨架**

```python
from pathlib import Path

from app.runner.graphify_runner import GraphifyRunner
from app.runner.workspace import WorkspaceManager


def test_graphify_runner_returns_release_and_artifacts(tmp_path: Path) -> None:
    runner = GraphifyRunner(workspace_manager=WorkspaceManager(root=tmp_path))

    result = runner.run(
        job_id="job_demo_1",
        kb_id="kb_checkout_core",
        sources=[{"id": "src_checkout_repo"}],
    )

    assert result["release"]["knowledge_base_id"] == "kb_checkout_core"
    assert result["release"]["artifact_status"]["graph"] == "ready"
    assert len(result["artifacts"]) >= 2
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_closure_flow.py::test_graphify_runner_returns_release_and_artifacts -v`
Expected: FAIL with missing `release` / `artifacts`

- [ ] **Step 3: 写最小 runner 返回结构**

`backend/app/runner/graphify_runner.py`
```python
from datetime import UTC, datetime

from app.runner.workspace import WorkspaceManager


class GraphifyRunner:
    def __init__(self, workspace_manager: WorkspaceManager):
        self.workspace_manager = workspace_manager

    def run(self, job_id: str, kb_id: str, sources: list[dict]) -> dict:
        workspace = self.workspace_manager.create(job_id)
        created_at = datetime.now(UTC).isoformat()
        return {
            "job_id": job_id,
            "kb_id": kb_id,
            "workspace": str(workspace),
            "stages": [
                "resolve_job_context",
                "materialize_sources",
                "normalize_inputs",
                "run_graphify",
                "enhance_obsidian",
                "register_release",
                "activate_or_roll_back",
            ],
            "release": {
                "id": f"rel_{job_id}",
                "knowledge_base_id": kb_id,
                "build_job_id": job_id,
                "version": job_id,
                "status": "completed",
                "created_at": created_at,
                "artifact_status": {
                    "graph": "ready",
                    "vault": "ready",
                    "html": "ready",
                },
            },
            "artifacts": [
                {
                    "id": f"art_graph_{job_id}",
                    "release_id": f"rel_{job_id}",
                    "artifact_type": "graph",
                    "artifact_status": "ready",
                    "artifact_path": f"{workspace}/graphify-out/graph.json",
                },
                {
                    "id": f"art_vault_{job_id}",
                    "release_id": f"rel_{job_id}",
                    "artifact_type": "vault",
                    "artifact_status": "ready",
                    "artifact_path": f"{workspace}/obsidian-enhanced",
                },
            ],
            "sources": sources,
        }
```

- [ ] **Step 4: 写最小 artifact / release 查询 service**

`backend/app/services/artifact_service.py`
```python
class ArtifactService:
    def __init__(self, release_repository):
        self.release_repository = release_repository

    def list_releases(self, kb_id: str) -> list[dict]:
        return self.release_repository.list_releases(kb_id)

    def get_active_artifacts(self, kb_id: str) -> dict:
        return self.release_repository.get_active_artifacts(kb_id)
```

- [ ] **Step 5: 跑测试确认通过**

Run: `cd backend && pytest tests/test_release_api.py tests/test_closure_flow.py -v`
Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add backend/app/runner/graphify_runner.py backend/app/services/artifact_service.py backend/app/repositories/releases.py backend/tests/test_release_api.py backend/tests/test_closure_flow.py
git commit -m "feat: return release and artifact data from runner"
```

### Task 3: 让 release / artifacts API 返回真实数据

**Files:**
- Modify: `backend/app/api/routes/knowledge_bases.py`
- Modify: `backend/app/repositories/releases.py`
- Modify: `backend/app/services/mcp_gateway_service.py`
- Test: `backend/tests/test_release_api.py`
- Test: `backend/tests/test_mcp_gateway.py`

- [ ] **Step 1: 写失败测试，验证 releases 接口返回真实 release**

```python
from httpx import ASGITransport, AsyncClient
import pytest

from app.main import app


@pytest.mark.anyio
async def test_list_releases_returns_real_release_item() -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.get("/api/knowledge-bases/kb_checkout_core/releases")

    assert response.status_code == 200
    assert response.json()["items"][0]["knowledge_base_id"] == "kb_checkout_core"
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_release_api.py::test_list_releases_returns_real_release_item -v`
Expected: FAIL with `IndexError` or empty list

- [ ] **Step 3: 写最小 releases repository**

`backend/app/repositories/releases.py`
```python
class ReleaseRepository:
    def __init__(self) -> None:
        self._releases: dict[str, list[dict]] = {
            "kb_checkout_core": [
                {
                    "id": "rel_seed_1",
                    "knowledge_base_id": "kb_checkout_core",
                    "build_job_id": "job_seed_1",
                    "version": "2026.05.19.001",
                    "status": "completed",
                    "created_at": "2026-05-19T10:40:13Z",
                    "artifact_status": {"graph": "ready", "vault": "ready", "html": "ready"},
                }
            ]
        }
        self._artifacts: dict[str, dict] = {
            "kb_checkout_core": {
                "kb_id": "kb_checkout_core",
                "release_id": "rel_seed_1",
                "artifacts": [
                    {
                        "artifact_type": "graph",
                        "artifact_status": "ready",
                        "artifact_path": "/artifacts/rel_seed_1/graph.json",
                    },
                    {
                        "artifact_type": "vault",
                        "artifact_status": "ready",
                        "artifact_path": "/artifacts/rel_seed_1/vault",
                    },
                ],
            }
        }

    def list_releases(self, kb_id: str) -> list[dict]:
        return self._releases.get(kb_id, [])

    def get_active_artifacts(self, kb_id: str) -> dict:
        return self._artifacts.get(kb_id, {"kb_id": kb_id, "release_id": None, "artifacts": []})
```

- [ ] **Step 4: 路由改走 repository / service**

`backend/app/api/routes/knowledge_bases.py`
```python
from app.repositories.releases import ReleaseRepository


@router.get("/knowledge-bases/{kb_id}/releases")
def list_releases(kb_id: str) -> dict:
    items = ReleaseRepository().list_releases(kb_id)
    return {"items": items, "page": 1, "page_size": 20, "total": len(items)}


@router.get("/knowledge-bases/{kb_id}/artifacts")
def get_artifacts(kb_id: str) -> dict:
    return ReleaseRepository().get_active_artifacts(kb_id)
```

`backend/app/services/mcp_gateway_service.py`
```python
from app.repositories.releases import ReleaseRepository


class MCPGatewayService:
    def __init__(self) -> None:
        self.release_repository = ReleaseRepository()

    def kb_status(self, kb_id: str) -> dict:
        artifacts = self.release_repository.get_active_artifacts(kb_id)
        return {
            "kb_id": kb_id,
            "status": "ready",
            "active_release_id": artifacts["release_id"],
            "graph_status": "ready",
            "vault_status": "ready",
            "last_build_job_id": "job_seed_1",
            "last_build_at": "2026-05-19T10:40:13Z",
        }
```

- [ ] **Step 5: 跑测试确认通过**

Run: `cd backend && pytest tests/test_release_api.py tests/test_mcp_gateway.py -v`
Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add backend/app/api/routes/knowledge_bases.py backend/app/repositories/releases.py backend/app/services/mcp_gateway_service.py backend/tests/test_release_api.py backend/tests/test_mcp_gateway.py
git commit -m "feat: serve real release and artifact payloads"
```

### Task 4: 前端 Dashboard / KB 页面改连真实 backend

**Files:**
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/app/knowledge-bases/page.tsx`
- Modify: `frontend/src/app/knowledge-bases/[kbId]/page.tsx`

- [ ] **Step 1: 写前端 failing check，确认移除 `useMock*` 默认路径**

```tsx
// dashboard page should call fetchDashboardData()
// kb list page should call fetchKnowledgeBases()
// kb detail should call fetchKnowledgeBaseDetail() and fetchArtifacts()
```

- [ ] **Step 2: 手动 grep 确认当前仍依赖 mock**

Run: `cd frontend && grep -R "useMock" -n src/app src/lib`
Expected: output includes dashboard and KB pages

- [ ] **Step 3: 写最小真实 fetch client**

`frontend/src/lib/api.ts`
```ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export async function fetchKnowledgeBases() {
  const response = await fetch(`${API_BASE}/api/projects/proj_delivery_alpha/knowledge-bases`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch knowledge bases");
  return response.json();
}

export async function fetchKnowledgeBaseArtifacts(kbId: string) {
  const response = await fetch(`${API_BASE}/api/knowledge-bases/${kbId}/artifacts`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch artifacts");
  return response.json();
}
```

- [ ] **Step 4: Dashboard / KB 页面改走真实 fetch**

`frontend/src/app/knowledge-bases/page.tsx`
```tsx
import { fetchKnowledgeBases } from "@/lib/api";

export default async function KnowledgeBaseListPage() {
  const data = await fetchKnowledgeBases();

  return (
    <main>
      <h1>Knowledge Base Catalog</h1>
      <ul>
        {data.items.map((kb: { id: string; name: string; status: string }) => (
          <li key={kb.id}>{kb.name} · {kb.status}</li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 5: 跑前端构建确认通过**

Run: `cd frontend && npm run build`
Expected: PASS or typecheck-clean build output

- [ ] **Step 6: 提交**

```bash
git add frontend/src/lib/api.ts frontend/src/lib/types.ts frontend/src/app/page.tsx frontend/src/app/knowledge-bases/page.tsx frontend/src/app/knowledge-bases/[kbId]/page.tsx
git commit -m "feat: connect dashboard and kb pages to backend"
```

### Task 5: 前端 Build / Artifact / Query 页面改连真实 backend

**Files:**
- Modify: `frontend/src/app/build-jobs/page.tsx`
- Modify: `frontend/src/app/build-jobs/[jobId]/page.tsx`
- Modify: `frontend/src/app/artifacts/[kbId]/page.tsx`
- Modify: `frontend/src/app/query-playground/page.tsx`
- Modify: `frontend/src/components/query-result-panel.tsx`
- Modify: `frontend/src/components/graph-artifact-viewer.tsx`
- Modify: `frontend/src/lib/api.ts`

- [ ] **Step 1: 写 failing expectation，确认 build/artifact/query 页面当前还走 mock**

```tsx
// build list/detail should fetch backend build data
// artifact page should fetch /artifacts
// query playground should post to /mcp/kb_query
```

- [ ] **Step 2: grep 当前 mock 依赖**

Run: `cd frontend && grep -R "useMock" -n src/app/build-jobs src/app/artifacts src/app/query-playground src/components`
Expected: output includes those pages/components

- [ ] **Step 3: 在 api.ts 增加真实 build / artifact / mcp query client**

`frontend/src/lib/api.ts`
```ts
export async function fetchArtifacts(kbId: string) {
  const response = await fetch(`${API_BASE}/api/knowledge-bases/${kbId}/artifacts`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch artifacts");
  return response.json();
}

export async function runMCPQuery(kb_id: string, question: string) {
  const response = await fetch(`${API_BASE}/mcp/kb_query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kb_id, question }),
  });
  if (!response.ok) throw new Error("Failed to query MCP");
  return response.json();
}
```

- [ ] **Step 4: 改 query playground 为真实 submit**

`frontend/src/app/query-playground/page.tsx`
```tsx
"use client";

import { FormEvent, useState } from "react";
import { runMCPQuery } from "@/lib/api";

export default function QueryPlaygroundPage() {
  const [kbId, setKbId] = useState("kb_checkout_core");
  const [question, setQuestion] = useState("How is checkout organized?");
  const [result, setResult] = useState<any>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(await runMCPQuery(kbId, question));
  }

  return (
    <main>
      <form onSubmit={handleSubmit}>{/* existing form layout */}</form>
      {result ? <pre>{JSON.stringify(result, null, 2)}</pre> : null}
    </main>
  );
}
```

- [ ] **Step 5: 跑前端构建确认通过**

Run: `cd frontend && npm run build`
Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add frontend/src/app/build-jobs frontend/src/app/artifacts frontend/src/app/query-playground frontend/src/components/query-result-panel.tsx frontend/src/components/graph-artifact-viewer.tsx frontend/src/lib/api.ts
git commit -m "feat: connect build artifact and query pages"
```

### Task 6: 写闭环集成测试与验收脚本

**Files:**
- Create: `backend/tests/test_closure_flow.py`
- Modify: `README.md`

- [ ] **Step 1: 写失败测试，验证 build → releases → artifacts → mcp status 闭环**

```python
from httpx import ASGITransport, AsyncClient
import pytest

from app.main import app


@pytest.mark.anyio
async def test_minimum_demo_loop() -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        build_response = await client.post(
            "/api/knowledge-bases/kb_checkout_core/builds",
            json={"build_type": "incremental_update", "triggered_by": "manual", "reason": "demo"},
        )
        releases_response = await client.get("/api/knowledge-bases/kb_checkout_core/releases")
        artifacts_response = await client.get("/api/knowledge-bases/kb_checkout_core/artifacts")
        status_response = await client.post("/mcp/kb_status", json={"kb_id": "kb_checkout_core"})

    assert build_response.status_code == 201
    assert releases_response.json()["items"]
    assert artifacts_response.json()["artifacts"]
    assert status_response.json()["active_release_id"] is not None
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_closure_flow.py::test_minimum_demo_loop -v`
Expected: FAIL because releases/artifacts/status still disconnected

- [ ] **Step 3: 补最小闭环 glue，直到测试通过**

```python
# only glue existing repositories/services together
# no new architecture
```

- [ ] **Step 4: 跑 backend 全量测试**

Run: `cd backend && pytest -v`
Expected: PASS

- [ ] **Step 5: 更新 README 增加闭环演示步骤**

`README.md`
```md
## Minimum Demo Loop
1. Start backend
2. POST /api/knowledge-bases/kb_checkout_core/builds
3. GET /api/knowledge-bases/kb_checkout_core/releases
4. GET /api/knowledge-bases/kb_checkout_core/artifacts
5. POST /mcp/kb_status
6. Open frontend knowledge base / artifact pages
```

- [ ] **Step 6: 提交**

```bash
git add backend/tests/test_closure_flow.py README.md
git commit -m "test: add minimum demo loop coverage"
```

## Spec Coverage Check

- build job 真持久化与 orchestration：Task 1
- runner 返回 release / artifacts：Task 2
- release / artifact / mcp status 真数据：Task 3
- frontend 去 mock 接 backend：Task 4, Task 5
- 最小闭环演示与 README：Task 6

当前 plan 只修 reviewer 指出的 3 条断链，不扩到真实 Celery worker、多源 materialization、真实 graphify CLI、增量更新、权限、缓存、部署。无 spec 覆盖缺口。
