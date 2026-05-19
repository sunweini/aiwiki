# AI Code 多知识库平台 V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建基于 graphify 的多知识库托管平台 V1，完成 Source / Knowledge Base / Build / Release / Artifact 管理、统一 MCP Gateway、graphify runner、基础前端管理台，并保证 agent 能按 `kb_id` 稳定查询 active graph。

**Architecture:** 采用单体平台架构。后端用 FastAPI 暴露管理 API 与 MCP Gateway，Celery + Redis 负责 build job 调度，PostgreSQL 存平台元数据，文件系统或 S3 存 graphify artifacts。平台通过 Graphify Runner 包装 graphify CLI，按 KB 生成独立 workspace、release 与 artifact registry；前端用 Next.js 构建 Library / Archive Modernist 风格运营控制台。

**Tech Stack:** Python, FastAPI, SQLAlchemy, Alembic, Celery, Redis, PostgreSQL, Next.js, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, graphify CLI

---

## File Structure

当前仓库几乎为空。按职责拆成以下结构：

- Create: `backend/app/main.py` — FastAPI 入口，注册 HTTP API 与 MCP 路由
- Create: `backend/app/config.py` — 环境变量与运行配置
- Create: `backend/app/db/base.py` — SQLAlchemy engine/session/base
- Create: `backend/app/db/models/project.py` — Project 模型
- Create: `backend/app/db/models/source.py` — Source 模型
- Create: `backend/app/db/models/knowledge_base.py` — KnowledgeBase 模型
- Create: `backend/app/db/models/binding.py` — KnowledgeBaseSourceBinding 模型
- Create: `backend/app/db/models/build_job.py` — BuildJob 模型
- Create: `backend/app/db/models/release.py` — Release 模型
- Create: `backend/app/db/models/artifact_version.py` — ArtifactVersion 模型
- Create: `backend/app/db/models/__init__.py` — 模型导出
- Create: `backend/app/schemas/source.py` — Source 请求/响应 schema
- Create: `backend/app/schemas/knowledge_base.py` — KnowledgeBase schema
- Create: `backend/app/schemas/binding.py` — Binding schema
- Create: `backend/app/schemas/build_job.py` — BuildJob schema
- Create: `backend/app/schemas/release.py` — Release / Artifact schema
- Create: `backend/app/schemas/common.py` — 分页、错误返回等通用 schema
- Create: `backend/app/repositories/sources.py` — Source 数据访问
- Create: `backend/app/repositories/knowledge_bases.py` — KB 数据访问
- Create: `backend/app/repositories/bindings.py` — Binding 数据访问
- Create: `backend/app/repositories/build_jobs.py` — BuildJob 数据访问
- Create: `backend/app/repositories/releases.py` — Release 数据访问
- Create: `backend/app/services/source_service.py` — Source 业务逻辑
- Create: `backend/app/services/knowledge_base_service.py` — KB 业务逻辑
- Create: `backend/app/services/build_service.py` — build request、状态机、激活逻辑
- Create: `backend/app/services/artifact_service.py` — artifact register / list / resolve
- Create: `backend/app/services/mcp_gateway_service.py` — `kb_list/query/path/explain/status/artifacts`
- Create: `backend/app/runner/workspace.py` — workspace 路径、保留策略
- Create: `backend/app/runner/source_materializer.py` — Source 拉取与 normalize
- Create: `backend/app/runner/graphify_runner.py` — graphify CLI 执行与 stage 编排
- Create: `backend/app/runner/obsidian_enhancer.py` — vault post-process enhancement
- Create: `backend/app/tasks/build_tasks.py` — Celery build tasks
- Create: `backend/app/api/routes/sources.py` — Source HTTP routes
- Create: `backend/app/api/routes/knowledge_bases.py` — KB / binding / release / artifacts routes
- Create: `backend/app/api/routes/build_jobs.py` — Build routes / logs / retry / cancel
- Create: `backend/app/api/routes/projects.py` — Project routes
- Create: `backend/app/api/routes/__init__.py` — route registry
- Create: `backend/app/mcp/routes.py` — MCP Gateway route adapter
- Create: `backend/app/logging.py` — structured logging helpers
- Create: `backend/alembic.ini` — Alembic config
- Create: `backend/alembic/env.py` — migration env
- Create: `backend/alembic/versions/20260519_0001_init_platform_models.py` — 初始表结构迁移
- Create: `backend/tests/conftest.py` — pytest fixtures, test db, temp workspace
- Create: `backend/tests/test_source_api.py`
- Create: `backend/tests/test_kb_api.py`
- Create: `backend/tests/test_binding_api.py`
- Create: `backend/tests/test_build_api.py`
- Create: `backend/tests/test_release_api.py`
- Create: `backend/tests/test_mcp_gateway.py`
- Create: `backend/tests/test_graphify_runner.py`
- Create: `backend/tests/test_obsidian_enhancer.py`
- Create: `backend/tests/test_build_activation.py`
- Create: `frontend/package.json`
- Create: `frontend/next.config.js`
- Create: `frontend/tsconfig.json`
- Create: `frontend/src/app/layout.tsx` — 全局 layout
- Create: `frontend/src/app/page.tsx` — Dashboard
- Create: `frontend/src/app/sources/page.tsx`
- Create: `frontend/src/app/sources/[sourceId]/page.tsx`
- Create: `frontend/src/app/knowledge-bases/page.tsx`
- Create: `frontend/src/app/knowledge-bases/[kbId]/page.tsx`
- Create: `frontend/src/app/build-jobs/page.tsx`
- Create: `frontend/src/app/build-jobs/[jobId]/page.tsx`
- Create: `frontend/src/app/artifacts/[kbId]/page.tsx`
- Create: `frontend/src/app/query-playground/page.tsx`
- Create: `frontend/src/components/archive-sidebar.tsx`
- Create: `frontend/src/components/knowledge-header.tsx`
- Create: `frontend/src/components/release-status-chips.tsx`
- Create: `frontend/src/components/source-binding-table.tsx`
- Create: `frontend/src/components/build-timeline.tsx`
- Create: `frontend/src/components/artifact-preview-panel.tsx`
- Create: `frontend/src/components/graph-artifact-viewer.tsx`
- Create: `frontend/src/components/vault-index-browser.tsx`
- Create: `frontend/src/components/metadata-rail.tsx`
- Create: `frontend/src/components/query-result-panel.tsx`
- Create: `frontend/src/lib/api.ts` — frontend API client
- Create: `frontend/src/lib/types.ts` — frontend domain types
- Create: `frontend/src/lib/mock-data.ts` — 初期静态数据或 fallback
- Create: `frontend/src/app/globals.css` — 视觉系统 tokens
- Create: `README.md` — 运行说明

---

### Task 1: 搭后端骨架与配置

**Files:**
- Create: `backend/app/main.py`
- Create: `backend/app/config.py`
- Create: `backend/app/db/base.py`
- Create: `backend/app/api/routes/__init__.py`
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_app_smoke.py`

- [ ] **Step 1: 写失败测试，验证 FastAPI app 可启动**

```python
from fastapi.testclient import TestClient

from app.main import app


def test_healthcheck_returns_ok() -> None:
    client = TestClient(app)

    response = client.get("/healthz")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_app_smoke.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'app'` or `cannot import name 'app'`

- [ ] **Step 3: 写最小实现**

`backend/app/config.py`
```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ai-code-kb-platform"
    environment: str = "dev"
    database_url: str = "sqlite+pysqlite:///:memory:"
    redis_url: str = "redis://localhost:6379/0"
    artifact_root: str = "./data/artifacts"
    workspace_root: str = "./data/workspaces"

    model_config = SettingsConfigDict(env_prefix="AIKB_", extra="ignore")


settings = Settings()
```

`backend/app/db/base.py`
```python
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import create_engine

from app.config import settings


class Base(DeclarativeBase):
    pass


engine = create_engine(settings.database_url, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
```

`backend/app/api/routes/__init__.py`
```python
from fastapi import APIRouter

router = APIRouter()


@router.get("/healthz")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}
```

`backend/app/main.py`
```python
from fastapi import FastAPI

from app.api.routes import router
from app.config import settings

app = FastAPI(title=settings.app_name)
app.include_router(router)
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd backend && pytest tests/test_app_smoke.py -v`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add backend/app/main.py backend/app/config.py backend/app/db/base.py backend/app/api/routes/__init__.py backend/tests/test_app_smoke.py
git commit -m "feat: bootstrap backend application"
```

### Task 2: 建平台核心数据模型与迁移

**Files:**
- Create: `backend/app/db/models/project.py`
- Create: `backend/app/db/models/source.py`
- Create: `backend/app/db/models/knowledge_base.py`
- Create: `backend/app/db/models/binding.py`
- Create: `backend/app/db/models/build_job.py`
- Create: `backend/app/db/models/release.py`
- Create: `backend/app/db/models/artifact_version.py`
- Create: `backend/app/db/models/__init__.py`
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`
- Create: `backend/alembic/versions/20260519_0001_init_platform_models.py`
- Test: `backend/tests/test_models_smoke.py`

- [ ] **Step 1: 写失败测试，验证表结构能创建且关键外键存在**

```python
from sqlalchemy import inspect

from app.db.base import Base, engine
from app.db.models import ArtifactVersion, BuildJob, KnowledgeBase, KnowledgeBaseSourceBinding, Project, Release, Source


def test_core_tables_exist() -> None:
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)

    tables = set(inspector.get_table_names())

    assert "projects" in tables
    assert "sources" in tables
    assert "knowledge_bases" in tables
    assert "knowledge_base_source_bindings" in tables
    assert "build_jobs" in tables
    assert "releases" in tables
    assert "artifact_versions" in tables
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_models_smoke.py -v`
Expected: FAIL with import/model errors

- [ ] **Step 3: 写最小实现**

`backend/app/db/models/project.py`
```python
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
```

`backend/app/db/models/source.py`
```python
from sqlalchemy import ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Source(Base):
    __tablename__ = "sources"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    source_ref: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    auth_config: Mapped[dict] = mapped_column(JSON, default=dict)
    sync_strategy: Mapped[str] = mapped_column(String, nullable=False)
    include_rules: Mapped[list] = mapped_column(JSON, default=list)
    exclude_rules: Mapped[list] = mapped_column(JSON, default=list)
    normalization_options: Mapped[dict] = mapped_column(JSON, default=dict)
```

`backend/app/db/models/knowledge_base.py`
```python
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class KnowledgeBase(Base):
    __tablename__ = "knowledge_bases"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    visibility: Mapped[str] = mapped_column(String, nullable=False)
    active_release_id: Mapped[str | None] = mapped_column(String, nullable=True)
```

`backend/app/db/models/binding.py`
```python
from sqlalchemy import ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class KnowledgeBaseSourceBinding(Base):
    __tablename__ = "knowledge_base_source_bindings"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    knowledge_base_id: Mapped[str] = mapped_column(ForeignKey("knowledge_bases.id"), nullable=False)
    source_id: Mapped[str] = mapped_column(ForeignKey("sources.id"), nullable=False)
    binding_status: Mapped[str] = mapped_column(String, nullable=False)
    scope_override: Mapped[dict] = mapped_column(JSON, default=dict)
    include_rules_override: Mapped[list] = mapped_column(JSON, default=list)
    exclude_rules_override: Mapped[list] = mapped_column(JSON, default=list)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
```

`backend/app/db/models/build_job.py`
```python
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class BuildJob(Base):
    __tablename__ = "build_jobs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    knowledge_base_id: Mapped[str] = mapped_column(ForeignKey("knowledge_bases.id"), nullable=False)
    build_type: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    release_id: Mapped[str | None] = mapped_column(String, nullable=True)
    error_summary: Mapped[str | None] = mapped_column(String, nullable=True)
```

`backend/app/db/models/release.py`
```python
from sqlalchemy import ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Release(Base):
    __tablename__ = "releases"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    knowledge_base_id: Mapped[str] = mapped_column(ForeignKey("knowledge_bases.id"), nullable=False)
    build_job_id: Mapped[str] = mapped_column(ForeignKey("build_jobs.id"), nullable=False)
    version: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    artifact_status: Mapped[dict] = mapped_column(JSON, default=dict)
```

`backend/app/db/models/artifact_version.py`
```python
from sqlalchemy import ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ArtifactVersion(Base):
    __tablename__ = "artifact_versions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    release_id: Mapped[str] = mapped_column(ForeignKey("releases.id"), nullable=False)
    artifact_type: Mapped[str] = mapped_column(String, nullable=False)
    artifact_status: Mapped[str] = mapped_column(String, nullable=False)
    artifact_path: Mapped[str] = mapped_column(String, nullable=False)
    artifact_meta: Mapped[dict] = mapped_column(JSON, default=dict)
```

`backend/app/db/models/__init__.py`
```python
from app.db.models.artifact_version import ArtifactVersion
from app.db.models.binding import KnowledgeBaseSourceBinding
from app.db.models.build_job import BuildJob
from app.db.models.knowledge_base import KnowledgeBase
from app.db.models.project import Project
from app.db.models.release import Release
from app.db.models.source import Source

__all__ = [
    "ArtifactVersion",
    "BuildJob",
    "KnowledgeBase",
    "KnowledgeBaseSourceBinding",
    "Project",
    "Release",
    "Source",
]
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd backend && pytest tests/test_models_smoke.py -v`
Expected: PASS

- [ ] **Step 5: 写 Alembic 初始迁移**

```python
from alembic import op
import sqlalchemy as sa

revision = "20260519_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
    )
    # 其余表按 SQLAlchemy 模型一一展开，不引入额外字段


def downgrade() -> None:
    op.drop_table("artifact_versions")
    op.drop_table("releases")
    op.drop_table("build_jobs")
    op.drop_table("knowledge_base_source_bindings")
    op.drop_table("knowledge_bases")
    op.drop_table("sources")
    op.drop_table("projects")
```

- [ ] **Step 6: 提交**

```bash
git add backend/app/db/models backend/alembic.ini backend/alembic backend/tests/test_models_smoke.py
git commit -m "feat: add platform metadata models"
```

### Task 3: 实现 Source API

**Files:**
- Create: `backend/app/schemas/common.py`
- Create: `backend/app/schemas/source.py`
- Create: `backend/app/repositories/sources.py`
- Create: `backend/app/services/source_service.py`
- Create: `backend/app/api/routes/sources.py`
- Modify: `backend/app/api/routes/__init__.py`
- Test: `backend/tests/test_source_api.py`

- [ ] **Step 1: 写失败测试，验证创建 Source**

```python
from fastapi.testclient import TestClient

from app.main import app


def test_create_source_returns_source_payload() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/projects/proj_delivery_alpha/sources",
        json={
            "name": "checkout-service",
            "type": "github_repo",
            "source_ref": "acme/checkout-service",
            "description": "Checkout service source repository.",
            "auth_config": {"credential_ref": "github-app-prod"},
            "sync_strategy": "webhook",
            "include_rules": ["src/**"],
            "exclude_rules": ["tmp/**"],
            "normalization_options": {"preserve_metadata": True},
        },
    )

    assert response.status_code == 201
    assert response.json()["name"] == "checkout-service"
    assert response.json()["project_id"] == "proj_delivery_alpha"
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_source_api.py::test_create_source_returns_source_payload -v`
Expected: FAIL with 404 or route missing

- [ ] **Step 3: 写 schema 与最小业务逻辑**

`backend/app/schemas/common.py`
```python
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    error_code: str
    message: str
    request_id: str
    details: dict


class PageResponse(BaseModel):
    items: list
    page: int
    page_size: int
    total: int
```

`backend/app/schemas/source.py`
```python
from pydantic import BaseModel


class SourceCreate(BaseModel):
    name: str
    type: str
    source_ref: str
    description: str | None = None
    auth_config: dict = {}
    sync_strategy: str
    include_rules: list[str] = []
    exclude_rules: list[str] = []
    normalization_options: dict = {}


class SourceRead(SourceCreate):
    id: str
    project_id: str
    status: str
    last_synced_at: str | None = None
    created_at: str
    updated_at: str
```

`backend/app/api/routes/sources.py`
```python
from datetime import datetime, UTC
from fastapi import APIRouter, status

from app.schemas.source import SourceCreate

router = APIRouter(prefix="/api")


@router.post("/projects/{project_id}/sources", status_code=status.HTTP_201_CREATED)
def create_source(project_id: str, payload: SourceCreate) -> dict:
    now = datetime.now(UTC).isoformat()
    return {
        "id": f"src_{payload.name.replace('-', '_')}",
        "project_id": project_id,
        "status": "active",
        "last_synced_at": None,
        "created_at": now,
        "updated_at": now,
        **payload.model_dump(),
    }
```

- [ ] **Step 4: 挂路由并跑测试通过**

`backend/app/api/routes/__init__.py`
```python
from fastapi import APIRouter

from app.api.routes.sources import router as sources_router

router = APIRouter()
router.include_router(sources_router)


@router.get("/healthz")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}
```

Run: `cd backend && pytest tests/test_source_api.py::test_create_source_returns_source_payload -v`
Expected: PASS

- [ ] **Step 5: 扩展列表测试**

```python
def test_list_sources_returns_page_payload() -> None:
    client = TestClient(app)

    response = client.get("/api/projects/proj_delivery_alpha/sources")

    assert response.status_code == 200
    data = response.json()
    assert set(data.keys()) == {"items", "page", "page_size", "total"}
```

- [ ] **Step 6: 写最小列表实现并验证**

```python
@router.get("/projects/{project_id}/sources")
def list_sources(project_id: str) -> dict:
    return {
        "items": [],
        "page": 1,
        "page_size": 20,
        "total": 0,
    }
```

Run: `cd backend && pytest tests/test_source_api.py -v`
Expected: PASS

- [ ] **Step 7: 提交**

```bash
git add backend/app/schemas/common.py backend/app/schemas/source.py backend/app/api/routes/sources.py backend/app/api/routes/__init__.py backend/tests/test_source_api.py
git commit -m "feat: add source management api"
```

### Task 4: 实现 Knowledge Base 与 Binding API

**Files:**
- Create: `backend/app/schemas/knowledge_base.py`
- Create: `backend/app/schemas/binding.py`
- Create: `backend/app/repositories/knowledge_bases.py`
- Create: `backend/app/repositories/bindings.py`
- Create: `backend/app/services/knowledge_base_service.py`
- Create: `backend/app/api/routes/knowledge_bases.py`
- Modify: `backend/app/api/routes/__init__.py`
- Test: `backend/tests/test_kb_api.py`
- Test: `backend/tests/test_binding_api.py`

- [ ] **Step 1: 写失败测试，验证创建 KB**

```python
from fastapi.testclient import TestClient

from app.main import app


def test_create_knowledge_base_returns_payload() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/projects/proj_delivery_alpha/knowledge-bases",
        json={
            "name": "Checkout Core Knowledge Base",
            "visibility": "org_shared",
            "description": "Knowledge base for checkout domain code and docs.",
            "release_policy": {"activation_mode": "auto_activate"},
        },
    )

    assert response.status_code == 201
    assert response.json()["name"] == "Checkout Core Knowledge Base"
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_kb_api.py::test_create_knowledge_base_returns_payload -v`
Expected: FAIL with 404

- [ ] **Step 3: 写最小 KB 实现**

`backend/app/schemas/knowledge_base.py`
```python
from pydantic import BaseModel


class KnowledgeBaseCreate(BaseModel):
    name: str
    visibility: str
    description: str | None = None
    release_policy: dict = {}
```

`backend/app/api/routes/knowledge_bases.py`
```python
from datetime import UTC, datetime
from fastapi import APIRouter, status

from app.schemas.knowledge_base import KnowledgeBaseCreate

router = APIRouter(prefix="/api")


@router.post("/projects/{project_id}/knowledge-bases", status_code=status.HTTP_201_CREATED)
def create_knowledge_base(project_id: str, payload: KnowledgeBaseCreate) -> dict:
    now = datetime.now(UTC).isoformat()
    return {
        "id": "kb_checkout_core",
        "project_id": project_id,
        "name": payload.name,
        "status": "ready",
        "active_release_id": None,
        "visibility": payload.visibility,
        "created_at": now,
        "updated_at": now,
    }
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd backend && pytest tests/test_kb_api.py::test_create_knowledge_base_returns_payload -v`
Expected: PASS

- [ ] **Step 5: 写失败测试，验证创建 Binding**

```python
from fastapi.testclient import TestClient

from app.main import app


def test_create_binding_returns_payload() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/knowledge-bases/kb_checkout_core/bindings",
        json={
            "source_id": "src_checkout_repo",
            "binding_status": "active",
            "scope_override": {"tracked_branches": ["main"]},
            "include_rules_override": ["src/**"],
            "exclude_rules_override": ["tmp/**"],
            "priority": 100,
        },
    )

    assert response.status_code == 201
    assert response.json()["source_id"] == "src_checkout_repo"
```

- [ ] **Step 6: 跑测试确认失败**

Run: `cd backend && pytest tests/test_binding_api.py::test_create_binding_returns_payload -v`
Expected: FAIL with 404

- [ ] **Step 7: 写最小 Binding 实现**

`backend/app/schemas/binding.py`
```python
from pydantic import BaseModel


class BindingCreate(BaseModel):
    source_id: str
    binding_status: str
    scope_override: dict = {}
    include_rules_override: list[str] = []
    exclude_rules_override: list[str] = []
    priority: int = 100
```

`backend/app/api/routes/knowledge_bases.py`
```python
from app.schemas.binding import BindingCreate


@router.post("/knowledge-bases/{kb_id}/bindings", status_code=status.HTTP_201_CREATED)
def create_binding(kb_id: str, payload: BindingCreate) -> dict:
    return {
        "id": "bind_checkout_repo_main",
        "knowledge_base_id": kb_id,
        **payload.model_dump(),
    }
```

- [ ] **Step 8: 挂路由并跑测试通过**

`backend/app/api/routes/__init__.py`
```python
from fastapi import APIRouter

from app.api.routes.knowledge_bases import router as kb_router
from app.api.routes.sources import router as sources_router

router = APIRouter()
router.include_router(sources_router)
router.include_router(kb_router)


@router.get("/healthz")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}
```

Run: `cd backend && pytest tests/test_kb_api.py tests/test_binding_api.py -v`
Expected: PASS

- [ ] **Step 9: 提交**

```bash
git add backend/app/schemas/knowledge_base.py backend/app/schemas/binding.py backend/app/api/routes/knowledge_bases.py backend/app/api/routes/__init__.py backend/tests/test_kb_api.py backend/tests/test_binding_api.py
git commit -m "feat: add knowledge base and binding api"
```

### Task 5: 实现 Build / Release / Artifact API 与状态语义

**Files:**
- Create: `backend/app/schemas/build_job.py`
- Create: `backend/app/schemas/release.py`
- Create: `backend/app/repositories/build_jobs.py`
- Create: `backend/app/repositories/releases.py`
- Create: `backend/app/services/build_service.py`
- Create: `backend/app/services/artifact_service.py`
- Modify: `backend/app/api/routes/build_jobs.py`
- Modify: `backend/app/api/routes/knowledge_bases.py`
- Modify: `backend/app/api/routes/__init__.py`
- Test: `backend/tests/test_build_api.py`
- Test: `backend/tests/test_release_api.py`
- Test: `backend/tests/test_build_activation.py`

- [ ] **Step 1: 写失败测试，验证发起 build job**

```python
from fastapi.testclient import TestClient

from app.main import app


def test_create_build_job_returns_job_payload() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/knowledge-bases/kb_checkout_core/builds",
        json={
            "build_type": "incremental_update",
            "triggered_by": "manual",
            "reason": "Sync latest checkout service changes.",
        },
    )

    assert response.status_code == 201
    assert response.json()["build_type"] == "incremental_update"
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_build_api.py::test_create_build_job_returns_job_payload -v`
Expected: FAIL with 404

- [ ] **Step 3: 写最小 build API 实现**

`backend/app/schemas/build_job.py`
```python
from pydantic import BaseModel


class BuildJobCreate(BaseModel):
    build_type: str
    triggered_by: str
    reason: str | None = None
```

`backend/app/api/routes/build_jobs.py`
```python
from datetime import UTC, datetime
from fastapi import APIRouter, status

from app.schemas.build_job import BuildJobCreate

router = APIRouter(prefix="/api")


@router.post("/knowledge-bases/{kb_id}/builds", status_code=status.HTTP_201_CREATED)
def create_build_job(kb_id: str, payload: BuildJobCreate) -> dict:
    now = datetime.now(UTC).isoformat()
    return {
        "job_id": "job_2026_05_19_0021",
        "knowledge_base_id": kb_id,
        "build_type": payload.build_type,
        "status": "pending",
        "release_id": None,
        "started_at": now,
        "finished_at": None,
        "error_summary": None,
    }
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd backend && pytest tests/test_build_api.py::test_create_build_job_returns_job_payload -v`
Expected: PASS

- [ ] **Step 5: 写失败测试，验证 release 激活规则**

```python
def test_activate_release_requires_ready_graph() -> None:
    service = BuildService()

    release = {
        "id": "rel_1",
        "artifact_status": {"graph": "missing", "vault": "ready"},
    }

    assert service.can_activate_release(release) is False
```

- [ ] **Step 6: 跑测试确认失败**

Run: `cd backend && pytest tests/test_build_activation.py::test_activate_release_requires_ready_graph -v`
Expected: FAIL with `NameError: BuildService`

- [ ] **Step 7: 写最小状态机与激活规则**

`backend/app/services/build_service.py`
```python
class BuildService:
    def can_activate_release(self, release: dict) -> bool:
        return release.get("artifact_status", {}).get("graph") == "ready"
```

- [ ] **Step 8: 跑测试确认通过**

Run: `cd backend && pytest tests/test_build_activation.py::test_activate_release_requires_ready_graph -v`
Expected: PASS

- [ ] **Step 9: 写 release / artifacts 列表测试**

```python
from fastapi.testclient import TestClient

from app.main import app


def test_list_releases_returns_paginated_payload() -> None:
    client = TestClient(app)

    response = client.get("/api/knowledge-bases/kb_checkout_core/releases")

    assert response.status_code == 200
    assert set(response.json().keys()) == {"items", "page", "page_size", "total"}


def test_get_active_artifacts_returns_release_payload() -> None:
    client = TestClient(app)

    response = client.get("/api/knowledge-bases/kb_checkout_core/artifacts")

    assert response.status_code == 200
    assert response.json()["kb_id"] == "kb_checkout_core"
```

- [ ] **Step 10: 写最小 release / artifacts 路由并验证**

```python
@router.get("/knowledge-bases/{kb_id}/releases")
def list_releases(kb_id: str) -> dict:
    return {"items": [], "page": 1, "page_size": 20, "total": 0}


@router.get("/knowledge-bases/{kb_id}/artifacts")
def get_artifacts(kb_id: str) -> dict:
    return {
        "kb_id": kb_id,
        "release_id": None,
        "artifacts": [],
    }
```

Run: `cd backend && pytest tests/test_build_api.py tests/test_release_api.py tests/test_build_activation.py -v`
Expected: PASS

- [ ] **Step 11: 提交**

```bash
git add backend/app/schemas/build_job.py backend/app/services/build_service.py backend/app/api/routes/build_jobs.py backend/app/api/routes/knowledge_bases.py backend/app/api/routes/__init__.py backend/tests/test_build_api.py backend/tests/test_release_api.py backend/tests/test_build_activation.py
git commit -m "feat: add build release and artifact api"
```

### Task 6: 实现 Graphify Runner、workspace、artifact register

**Files:**
- Create: `backend/app/runner/workspace.py`
- Create: `backend/app/runner/source_materializer.py`
- Create: `backend/app/runner/graphify_runner.py`
- Modify: `backend/app/services/build_service.py`
- Modify: `backend/app/services/artifact_service.py`
- Test: `backend/tests/test_graphify_runner.py`

- [ ] **Step 1: 写失败测试，验证 workspace 目录创建**

```python
from pathlib import Path

from app.runner.workspace import WorkspaceManager


def test_workspace_manager_creates_expected_layout(tmp_path: Path) -> None:
    manager = WorkspaceManager(root=tmp_path)

    workspace = manager.create("job_2026_05_19_0021")

    assert (workspace / "source-materials").exists()
    assert (workspace / "graphify-input").exists()
    assert (workspace / "graphify-out").exists()
    assert (workspace / "obsidian-enhanced").exists()
    assert (workspace / "logs").exists()
    assert (workspace / "metadata").exists()
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_graphify_runner.py::test_workspace_manager_creates_expected_layout -v`
Expected: FAIL with import error

- [ ] **Step 3: 写最小 workspace 实现**

`backend/app/runner/workspace.py`
```python
from pathlib import Path


class WorkspaceManager:
    def __init__(self, root: Path):
        self.root = root

    def create(self, job_id: str) -> Path:
        workspace = self.root / job_id
        for name in [
            "source-materials",
            "graphify-input",
            "graphify-out",
            "obsidian-enhanced",
            "logs",
            "metadata",
        ]:
            (workspace / name).mkdir(parents=True, exist_ok=True)
        return workspace
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd backend && pytest tests/test_graphify_runner.py::test_workspace_manager_creates_expected_layout -v`
Expected: PASS

- [ ] **Step 5: 写失败测试，验证 runner stage 顺序**

```python
from pathlib import Path

from app.runner.graphify_runner import GraphifyRunner
from app.runner.workspace import WorkspaceManager


def test_graphify_runner_returns_stage_log(tmp_path: Path) -> None:
    manager = WorkspaceManager(root=tmp_path)
    runner = GraphifyRunner(workspace_manager=manager)

    result = runner.run(
        job_id="job_2026_05_19_0021",
        kb_id="kb_checkout_core",
        sources=[{"id": "src_checkout_repo"}],
    )

    assert result["stages"] == [
        "resolve_job_context",
        "materialize_sources",
        "normalize_inputs",
        "run_graphify",
        "enhance_obsidian",
        "register_release",
        "activate_or_roll_back",
    ]
```

- [ ] **Step 6: 跑测试确认失败**

Run: `cd backend && pytest tests/test_graphify_runner.py::test_graphify_runner_returns_stage_log -v`
Expected: FAIL with import error

- [ ] **Step 7: 写最小 runner 实现**

`backend/app/runner/graphify_runner.py`
```python
from app.runner.workspace import WorkspaceManager


class GraphifyRunner:
    def __init__(self, workspace_manager: WorkspaceManager):
        self.workspace_manager = workspace_manager

    def run(self, job_id: str, kb_id: str, sources: list[dict]) -> dict:
        self.workspace_manager.create(job_id)
        return {
            "job_id": job_id,
            "kb_id": kb_id,
            "stages": [
                "resolve_job_context",
                "materialize_sources",
                "normalize_inputs",
                "run_graphify",
                "enhance_obsidian",
                "register_release",
                "activate_or_roll_back",
            ],
            "sources": sources,
        }
```

- [ ] **Step 8: 跑测试确认通过**

Run: `cd backend && pytest tests/test_graphify_runner.py -v`
Expected: PASS

- [ ] **Step 9: 提交**

```bash
git add backend/app/runner/workspace.py backend/app/runner/graphify_runner.py backend/tests/test_graphify_runner.py
git commit -m "feat: add graphify runner skeleton"
```

### Task 7: 实现 Obsidian enhancement 与 artifact 语义

**Files:**
- Create: `backend/app/runner/obsidian_enhancer.py`
- Modify: `backend/app/runner/graphify_runner.py`
- Test: `backend/tests/test_obsidian_enhancer.py`

- [ ] **Step 1: 写失败测试，验证 enhancement 幂等**

```python
from pathlib import Path

from app.runner.obsidian_enhancer import ObsidianEnhancer


def test_obsidian_enhancer_is_idempotent(tmp_path: Path) -> None:
    vault = tmp_path / "obsidian"
    vault.mkdir()
    (vault / "index.md").write_text("# Vault\n", encoding="utf-8")

    enhancer = ObsidianEnhancer()
    enhancer.apply(vault, kb_id="kb_checkout_core", release_id="rel_2026_05_19_001")
    enhancer.apply(vault, kb_id="kb_checkout_core", release_id="rel_2026_05_19_001")

    content = (vault / "index.md").read_text(encoding="utf-8")
    assert content.count("kb_checkout_core") == 1
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_obsidian_enhancer.py::test_obsidian_enhancer_is_idempotent -v`
Expected: FAIL with import error

- [ ] **Step 3: 写最小 enhancement 实现**

`backend/app/runner/obsidian_enhancer.py`
```python
from pathlib import Path


class ObsidianEnhancer:
    def apply(self, vault: Path, kb_id: str, release_id: str) -> None:
        index_path = vault / "index.md"
        marker = f"\nKB: {kb_id}\nRelease: {release_id}\n"
        content = index_path.read_text(encoding="utf-8")
        if marker not in content:
            index_path.write_text(content + marker, encoding="utf-8")
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd backend && pytest tests/test_obsidian_enhancer.py::test_obsidian_enhancer_is_idempotent -v`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add backend/app/runner/obsidian_enhancer.py backend/tests/test_obsidian_enhancer.py
git commit -m "feat: add obsidian enhancement"
```

### Task 8: 实现 MCP Gateway

**Files:**
- Create: `backend/app/services/mcp_gateway_service.py`
- Create: `backend/app/mcp/routes.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/test_mcp_gateway.py`

- [ ] **Step 1: 写失败测试，验证 `kb_status`**

```python
from fastapi.testclient import TestClient

from app.main import app


def test_mcp_kb_status_returns_expected_payload() -> None:
    client = TestClient(app)

    response = client.post("/mcp/kb_status", json={"kb_id": "kb_checkout_core"})

    assert response.status_code == 200
    assert response.json()["kb_id"] == "kb_checkout_core"
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_mcp_gateway.py::test_mcp_kb_status_returns_expected_payload -v`
Expected: FAIL with 404

- [ ] **Step 3: 写最小 MCP service 与 route**

`backend/app/services/mcp_gateway_service.py`
```python
class MCPGatewayService:
    def kb_status(self, kb_id: str) -> dict:
        return {
            "kb_id": kb_id,
            "status": "ready",
            "active_release_id": "rel_2026_05_19_001",
            "graph_status": "ready",
            "vault_status": "ready",
            "last_build_job_id": "job_2026_05_19_0021",
            "last_build_at": "2026-05-19T10:40:13Z",
        }
```

`backend/app/mcp/routes.py`
```python
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.mcp_gateway_service import MCPGatewayService

router = APIRouter(prefix="/mcp")
service = MCPGatewayService()


class KBStatusRequest(BaseModel):
    kb_id: str


@router.post("/kb_status")
def kb_status(payload: KBStatusRequest) -> dict:
    return service.kb_status(payload.kb_id)
```

- [ ] **Step 4: 挂路由并跑测试通过**

`backend/app/main.py`
```python
from fastapi import FastAPI

from app.api.routes import router as api_router
from app.config import settings
from app.mcp.routes import router as mcp_router

app = FastAPI(title=settings.app_name)
app.include_router(api_router)
app.include_router(mcp_router)
```

Run: `cd backend && pytest tests/test_mcp_gateway.py::test_mcp_kb_status_returns_expected_payload -v`
Expected: PASS

- [ ] **Step 5: 扩展 `kb_query/path/explain/artifacts/list` 测试**

```python
def test_mcp_kb_list_returns_items() -> None:
    client = TestClient(app)
    response = client.post("/mcp/kb_list", json={})
    assert response.status_code == 200
    assert "items" in response.json()
```

- [ ] **Step 6: 写最小其余 MCP 实现并验证**

```python
class MCPGatewayService:
    def kb_list(self, project_id: str | None = None) -> dict:
        return {"items": []}

    def kb_query(self, kb_id: str, question: str) -> dict:
        return {
            "kb_id": kb_id,
            "release_id": "rel_2026_05_19_001",
            "updated_at": "2026-05-19T10:42:00Z",
            "answer": f"stub answer for {question}",
            "source_locations": [],
            "artifact_refs": {},
        }
```

Run: `cd backend && pytest tests/test_mcp_gateway.py -v`
Expected: PASS

- [ ] **Step 7: 提交**

```bash
git add backend/app/services/mcp_gateway_service.py backend/app/mcp/routes.py backend/app/main.py backend/tests/test_mcp_gateway.py
git commit -m "feat: add mcp gateway"
```

### Task 9: 搭前端骨架与视觉系统

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/next.config.js`
- Create: `frontend/tsconfig.json`
- Create: `frontend/src/app/layout.tsx`
- Create: `frontend/src/app/globals.css`
- Create: `frontend/src/components/archive-sidebar.tsx`
- Test: `frontend` lint / typecheck

- [ ] **Step 1: 初始化 Next.js 工程文件**

```json
{
  "name": "ai-code-kb-frontend",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 2: 写全局 layout**

`frontend/src/app/layout.tsx`
```tsx
import "./globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: 写 Library / Archive Modernist tokens**

`frontend/src/app/globals.css`
```css
:root {
  --paper: #f6f1e8;
  --ink: #1f1a17;
  --muted: #6f685f;
  --line: #d7ccbb;
  --accent: #274c5b;
  --success: #567a63;
  --warning: #9b6b2f;
  --danger: #8a3b32;
}

body {
  margin: 0;
  color: var(--ink);
  background: var(--paper);
  font-family: Georgia, "Source Han Serif SC", serif;
}
```

- [ ] **Step 4: 跑 typecheck**

Run: `cd frontend && npm run typecheck`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add frontend/package.json frontend/next.config.js frontend/tsconfig.json frontend/src/app/layout.tsx frontend/src/app/globals.css
git commit -m "feat: bootstrap frontend shell"
```

### Task 10: 实现前端核心页面与组件

**Files:**
- Create: `frontend/src/app/page.tsx`
- Create: `frontend/src/app/sources/page.tsx`
- Create: `frontend/src/app/sources/[sourceId]/page.tsx`
- Create: `frontend/src/app/knowledge-bases/page.tsx`
- Create: `frontend/src/app/knowledge-bases/[kbId]/page.tsx`
- Create: `frontend/src/app/build-jobs/page.tsx`
- Create: `frontend/src/app/build-jobs/[jobId]/page.tsx`
- Create: `frontend/src/app/artifacts/[kbId]/page.tsx`
- Create: `frontend/src/app/query-playground/page.tsx`
- Create: `frontend/src/components/knowledge-header.tsx`
- Create: `frontend/src/components/release-status-chips.tsx`
- Create: `frontend/src/components/source-binding-table.tsx`
- Create: `frontend/src/components/build-timeline.tsx`
- Create: `frontend/src/components/artifact-preview-panel.tsx`
- Create: `frontend/src/components/graph-artifact-viewer.tsx`
- Create: `frontend/src/components/vault-index-browser.tsx`
- Create: `frontend/src/components/metadata-rail.tsx`
- Create: `frontend/src/components/query-result-panel.tsx`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/lib/types.ts`
- Create: `frontend/src/lib/mock-data.ts`

- [ ] **Step 1: 实现 Dashboard 页面**

`frontend/src/app/page.tsx`
```tsx
export default function DashboardPage() {
  return (
    <main>
      <h1>Knowledge Archive</h1>
      <section>Projects / Knowledge Bases / Recent Builds</section>
    </main>
  );
}
```

- [ ] **Step 2: 实现 KB 详情页核心结构**

`frontend/src/app/knowledge-bases/[kbId]/page.tsx`
```tsx
export default function KnowledgeBaseDetailPage() {
  return (
    <main>
      <aside>Outline</aside>
      <section>Active release / artifacts / docs</section>
      <aside>Metadata / MCP access</aside>
    </main>
  );
}
```

- [ ] **Step 3: 实现 `graph.html` viewer**

`frontend/src/components/graph-artifact-viewer.tsx`
```tsx
export function GraphArtifactViewer({ src }: { src: string }) {
  return <iframe src={src} title="graph artifact viewer" style={{ width: "100%", height: "80vh", border: 0 }} />;
}
```

- [ ] **Step 4: 实现 Query Playground 页面**

`frontend/src/app/query-playground/page.tsx`
```tsx
export default function QueryPlaygroundPage() {
  return (
    <main>
      <h1>Query Playground</h1>
      <form>
        <input name="kb_id" placeholder="kb_id" />
        <textarea name="question" placeholder="question" />
        <button type="submit">Run Query</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 5: 跑 lint 与 typecheck**

Run: `cd frontend && npm run lint && npm run typecheck`
Expected: PASS

- [ ] **Step 6: 手动验页面**

Run: `cd frontend && npm run dev`
Expected: dev server starts

Check in browser:
- Dashboard loads
- KB detail uses three-column reading layout
- Artifact viewer can embed `graph.html`
- Query playground is not chat-bubble UI

- [ ] **Step 7: 提交**

```bash
git add frontend/src/app frontend/src/components frontend/src/lib
git commit -m "feat: add frontend management console pages"
```

### Task 11: 接 Celery / Redis 与 build orchestration

**Files:**
- Create: `backend/app/tasks/build_tasks.py`
- Modify: `backend/app/services/build_service.py`
- Modify: `backend/app/runner/graphify_runner.py`
- Test: `backend/tests/test_build_orchestration.py`

- [ ] **Step 1: 写失败测试，验证 build request 会触发 runner**

```python
from unittest.mock import Mock

from app.services.build_service import BuildService


def test_enqueue_build_calls_runner() -> None:
    runner = Mock()
    service = BuildService(runner=runner)

    service.enqueue_build({"id": "job_1", "kb_id": "kb_checkout_core"})

    runner.run.assert_called_once()
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_build_orchestration.py::test_enqueue_build_calls_runner -v`
Expected: FAIL with `TypeError` or missing method

- [ ] **Step 3: 写最小编排实现**

`backend/app/services/build_service.py`
```python
class BuildService:
    def __init__(self, runner=None):
        self.runner = runner

    def can_activate_release(self, release: dict) -> bool:
        return release.get("artifact_status", {}).get("graph") == "ready"

    def enqueue_build(self, job: dict) -> None:
        if self.runner is not None:
            self.runner.run(
                job_id=job["id"],
                kb_id=job["kb_id"],
                sources=job.get("sources", []),
            )
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd backend && pytest tests/test_build_orchestration.py::test_enqueue_build_calls_runner -v`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add backend/app/services/build_service.py backend/tests/test_build_orchestration.py backend/app/tasks/build_tasks.py
git commit -m "feat: add build orchestration"
```

### Task 12: 端到端校验、文档、收尾

**Files:**
- Create: `README.md`
- Modify: `docs/superpowers/specs/2026-05-19-ai-code-kb-platform-design.md`（仅在实现偏离 spec 时）
- Test: `backend/tests/...`
- Test: `frontend` lint/typecheck/build

- [ ] **Step 1: 跑后端测试套件**

Run: `cd backend && pytest -v`
Expected: PASS

- [ ] **Step 2: 跑前端检查**

Run: `cd frontend && npm run lint && npm run typecheck && npm run build`
Expected: PASS

- [ ] **Step 3: 写运行说明**

`README.md`
```md
# AI Code Multi-KB Platform

## Backend
- install dependencies
- configure AIKB_DATABASE_URL and AIKB_REDIS_URL
- run alembic upgrade head
- start FastAPI and Celery worker

## Frontend
- install dependencies
- run next dev
```

- [ ] **Step 4: 手动验收闭环**

Check:
- create source
- create knowledge base
- bind source
- start build
- inspect release / artifacts
- open `graph.html`
- call MCP `kb_status` / `kb_query`

- [ ] **Step 5: 提交**

```bash
git add README.md
git commit -m "docs: add local development guide"
```

## Spec Coverage Check

- Source / Knowledge Base / Binding / Build API：Task 3, Task 4, Task 5
- Release / Artifact 粒度、active release 语义：Task 5
- Graphify Runner / workspace / logging：Task 6, Task 11
- Obsidian enhancement 与增强后 vault：Task 7
- MCP Gateway：Task 8
- Frontend Admin Console 与 `graph.html` 预览：Task 9, Task 10
- E2E 闭环与运行文档：Task 12

无明显 spec 漏项，但 logging、structured stdout/stderr 展开、Source materialization 多源接入、真实数据库持久化仍在 skeleton 级别。实现时若要达到 production-ready，需要在当前 plan 基础上继续细化第二轮 plan。
