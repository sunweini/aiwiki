# PostgreSQL 接入 + 全面 Async 改造 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 后端数据库从 SQLite 迁至 PostgreSQL 16，全栈 async 化，引入 BaseRepository 抽象层，graphify 逻辑不动

**Architecture:** AsyncEngine (asyncpg) → AsyncSession → BaseRepository[T] → async Service → async API endpoints。Alembic 用同步 URL 跑迁移。现有分层和文件结构保留，只做 sync→async 机械转换 + 抽象提升。

**Tech Stack:** PostgreSQL 16, asyncpg, SQLAlchemy 2.0 async, FastAPI async endpoints, Alembic

---

### Task 1: 基础设施 — config + database.py

**Files:**
- Modify: `backend/app/config.py`
- Create: `backend/app/db/database.py`
- Create: `backend/requirements.txt`

- [ ] **Step 1: 更新 config.py 的 database_url 和连接池参数**

```python
# backend/app/config.py — 将 database_url 行改为:
database_url: str = "postgresql+asyncpg://sunweini@localhost:5432/aiwiki"

# 在 database_url 之后新增 3 行:
db_pool_size: int = 10
db_max_overflow: int = 20
db_pool_recycle_seconds: int = 3600
```

- [ ] **Step 2: 创建 backend/app/db/database.py**

```python
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

engine = create_async_engine(
    settings.database_url,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_recycle=settings.db_pool_recycle_seconds,
    pool_pre_ping=True,
    echo=settings.environment == "dev",
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_async_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

- [ ] **Step 3: 创建 backend/requirements.txt**

```text
fastapi>=0.115.0
uvicorn[standard]>=0.34.0
sqlalchemy[asyncio]>=2.0.30
asyncpg>=0.30.0
alembic>=1.18.0
pydantic>=2.10.0
pydantic-settings>=2.7.0
psycopg2-binary>=2.9.10
redis>=5.2.0
httpx>=0.28.0
python-multipart>=0.0.19
```

- [ ] **Step 4: 安装依赖**

Run: `cd backend && source .venv/bin/activate && pip install asyncpg sqlalchemy[asyncio] -i https://pypi.tuna.tsinghua.edu.cn/simple`
Expected: asyncpg installed successfully

- [ ] **Step 5: 验证 database.py 可导入**

Run: `cd backend && source .venv/bin/activate && python -c "from app.db.database import engine, AsyncSessionLocal, get_async_session; print('OK')"`
Expected: OK

- [ ] **Step 6: Commit**

```bash
git add backend/app/config.py backend/app/db/database.py backend/requirements.txt
git commit -m "feat: add async database engine and connection pool config"
```

---

### Task 2: Repository 抽象层 — BaseRepository + 6 个改造

**Files:**
- Create: `backend/app/db/repository.py`
- Modify: `backend/app/repositories/sources.py`
- Modify: `backend/app/repositories/knowledge_bases.py`
- Modify: `backend/app/repositories/build_jobs.py`
- Modify: `backend/app/repositories/releases.py`
- Modify: `backend/app/repositories/artifact_versions.py`
- Modify: `backend/app/repositories/bindings.py`

- [ ] **Step 1: 创建 BaseRepository**

```python
# backend/app/db/repository.py
from typing import Generic, TypeVar

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar("T")


class BaseRepository(Generic[T]):
    model: type[T]

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, id: str) -> T | None:
        return await self.session.get(self.model, id)

    async def list(self, *filters, limit: int = 100, offset: int = 0) -> list[T]:
        stmt = select(self.model).filter(*filters).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, entity: T) -> T:
        self.session.add(entity)
        await self.session.commit()
        await self.session.refresh(entity)
        return entity

    async def update(self, entity: T) -> T:
        self.session.add(entity)
        await self.session.commit()
        return entity

    async def delete(self, entity: T) -> None:
        await self.session.delete(entity)
        await self.session.commit()
```

- [ ] **Step 2: 改造 SourceRepository**

```python
# backend/app/repositories/sources.py
from collections.abc import Sequence

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.source import Source
from app.db.repository import BaseRepository


class SourceRepository(BaseRepository[Source]):
    model = Source

    async def list_by_project(self, project_id: str, page: int, page_size: int) -> tuple[Sequence[Source], int]:
        stmt = (
            select(Source)
            .where(Source.project_id == project_id)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self.session.execute(stmt)
        items = result.scalars().all()

        count_stmt = select(func.count()).select_from(Source).where(Source.project_id == project_id)
        total = (await self.session.execute(count_stmt)).scalar_one()
        return items, total

    async def list_all_polling(self) -> list[Source]:
        stmt = select(Source).where(Source.git_poll_interval_minutes > 0)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
```

- [ ] **Step 3: 改造 KnowledgeBaseRepository**

```python
# backend/app/repositories/knowledge_bases.py
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.knowledge_base import KnowledgeBase
from app.db.repository import BaseRepository


class KnowledgeBaseRepository(BaseRepository[KnowledgeBase]):
    model = KnowledgeBase

    async def list(self, project_id: str | None = None) -> list[KnowledgeBase]:
        stmt = select(KnowledgeBase)
        if project_id is not None:
            stmt = stmt.where(KnowledgeBase.project_id == project_id)
        stmt = stmt.order_by(KnowledgeBase.id.asc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
```

- [ ] **Step 4: 改造 BuildJobRepository**

```python
# backend/app/repositories/build_jobs.py
from sqlalchemy import select, text, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.build_job import BuildJob
from app.db.repository import BaseRepository


class BuildJobRepository(BaseRepository[BuildJob]):
    model = BuildJob

    async def list_by_kb(self, kb_id: str) -> list[BuildJob]:
        stmt = (
            select(BuildJob)
            .where(BuildJob.knowledge_base_id == kb_id)
            .order_by(BuildJob.created_at.desc(), BuildJob.id.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def list_by_kb_paginated(self, kb_id: str, page: int, page_size: int) -> tuple[list[BuildJob], int]:
        base = select(BuildJob).where(BuildJob.knowledge_base_id == kb_id)
        count_stmt = select(func.count()).select_from(BuildJob).where(BuildJob.knowledge_base_id == kb_id)
        total = (await self.session.execute(count_stmt)).scalar_one()

        stmt = base.order_by(BuildJob.created_at.desc(), BuildJob.id.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total

    async def list_sources(self, kb_id: str) -> list[dict[str, str]]:
        rows = await self.session.execute(
            text(
                """
                SELECT s.id, s.name, s.type, s.source_ref
                FROM knowledge_base_source_bindings AS b
                JOIN sources AS s ON s.id = b.source_id
                WHERE b.knowledge_base_id = :kb_id AND b.binding_status = 'active'
                ORDER BY b.priority ASC, b.id ASC
                """
            ),
            {"kb_id": kb_id},
        )
        return [
            {"id": row.id, "name": row.name, "type": row.type, "source_ref": row.source_ref}
            for row in rows
        ]
```

- [ ] **Step 5: 改造 ReleaseRepository**

```python
# backend/app/repositories/releases.py
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.knowledge_base import KnowledgeBase
from app.db.models.release import Release
from app.db.repository import BaseRepository


class ReleaseRepository(BaseRepository[Release]):
    model = Release

    async def list_by_kb(self, kb_id: str, page: int, page_size: int) -> tuple[list[Release], int]:
        offset = (page - 1) * page_size
        count_stmt = select(func.count()).select_from(Release).where(Release.knowledge_base_id == kb_id)
        total = (await self.session.execute(count_stmt)).scalar_one()

        stmt = (
            select(Release)
            .where(Release.knowledge_base_id == kb_id)
            .order_by(Release.id.desc())
            .offset(offset)
            .limit(page_size)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total

    async def get_active_release_id(self, kb_id: str) -> str | None:
        kb = await self.session.get(KnowledgeBase, kb_id)
        if kb is None:
            return None
        return kb.active_release_id
```

- [ ] **Step 6: 改造 ArtifactVersionRepository**

```python
# backend/app/repositories/artifact_versions.py
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.artifact_version import ArtifactVersion
from app.db.repository import BaseRepository


class ArtifactVersionRepository(BaseRepository[ArtifactVersion]):
    model = ArtifactVersion

    async def batch_create(self, artifacts: list[ArtifactVersion]) -> list[ArtifactVersion]:
        self.session.add_all(artifacts)
        await self.session.commit()
        for a in artifacts:
            await self.session.refresh(a)
        return artifacts
```

- [ ] **Step 7: 改造 BindingRepository**

```python
# backend/app/repositories/bindings.py
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.binding import KnowledgeBaseSourceBinding
from app.db.repository import BaseRepository


class BindingRepository(BaseRepository[KnowledgeBaseSourceBinding]):
    model = KnowledgeBaseSourceBinding
```

- [ ] **Step 8: 验证 import**

Run: `cd backend && source .venv/bin/activate && python -c "from app.repositories.sources import SourceRepository; from app.repositories.knowledge_bases import KnowledgeBaseRepository; print('All repos OK')"`
Expected: All repos OK

- [ ] **Step 9: Commit**

```bash
git add backend/app/db/repository.py backend/app/repositories/
git commit -m "feat: add BaseRepository[T] and migrate all 6 repos to async"
```

---

### Task 3: Service 层 async 化 (请求级)

**Files:**
- Modify: `backend/app/services/source_service.py`
- Modify: `backend/app/services/knowledge_base_service.py`
- Modify: `backend/app/services/artifact_service.py`
- Modify: `backend/app/services/mcp_gateway_service.py`

- [ ] **Step 1: 改造 SourceService**

将所有方法改为 `async def`，`Session` → `AsyncSession`，repository 调用加 `await`。`WorkspaceManager` 和 `SourceMaterializer` 保持同步（文件操作）。

```python
# backend/app/services/source_service.py
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4
import subprocess

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.models import Source
from app.repositories.sources import SourceRepository
from app.runner.source_materializer import SourceMaterializer
from app.runner.workspace import WorkspaceManager
from app.schemas.source import SourceCreate


class SourceService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repository = SourceRepository(session)
        self.wm = WorkspaceManager(Path(settings.data_root))

    async def create_source(self, project_id: str, payload: SourceCreate) -> Source:
        now = datetime.now(UTC)
        source_id = f"src_{uuid4().hex[:12]}"

        self.wm.ensure_project_dir(project_id)

        source = Source(
            id=source_id,
            project_id=project_id,
            name=payload.name,
            type=payload.type,
            status="active",
            source_ref=payload.source_ref,
            description=payload.description,
            auth_config=payload.auth_config,
            sync_strategy=payload.sync_strategy,
            include_rules=payload.include_rules,
            exclude_rules=payload.exclude_rules,
            normalization_options=payload.normalization_options,
            git_tracking_branch=payload.git_tracking_branch,
            git_poll_interval_minutes=payload.git_poll_interval_minutes,
        )
        source.created_at = now
        source.updated_at = now
        source.last_synced_at = None

        source = await self.repository.create(source)

        mat = SourceMaterializer(project_id, self.wm.project_root(project_id))
        try:
            mat.materialize({
                "id": source_id,
                "type": payload.type,
                "source_ref": payload.source_ref,
                "git_tracking_branch": payload.git_tracking_branch,
            })
            source_dir = self.wm.source_dir(project_id, source_id)
            if (source_dir / ".git").exists():
                try:
                    head = subprocess.run(
                        ["git", "-C", str(source_dir), "rev-parse", "HEAD"],
                        capture_output=True, text=True, timeout=10
                    ).stdout.strip()
                    source.git_last_commit = head
                except subprocess.CalledProcessError:
                    pass
            source.last_synced_at = now
            await self.repository.update(source)
        except Exception:
            source.status = "error"
            await self.repository.update(source)

        return source

    async def list_sources(self, project_id: str, page: int = 1, page_size: int = 20) -> tuple[list[Source], int]:
        items, total = await self.repository.list_by_project(project_id=project_id, page=page, page_size=page_size)
        return list(items), total

    async def update_source(self, source_id: str, name: str) -> Source:
        source = await self.repository.get(source_id)
        if source is None:
            raise ValueError("source not found")
        source.name = name
        source.updated_at = datetime.now(UTC)
        return await self.repository.update(source)

    async def delete_source(self, source_id: str) -> None:
        source = await self.repository.get(source_id)
        if source is None:
            raise ValueError("source not found")
        await self.repository.delete(source)
```

- [ ] **Step 2: 改造 KnowledgeBaseService**

```python
# backend/app/services/knowledge_base_service.py
from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.binding import KnowledgeBaseSourceBinding
from app.db.models.knowledge_base import KnowledgeBase
from app.repositories.bindings import BindingRepository
from app.repositories.knowledge_bases import KnowledgeBaseRepository
from app.schemas.binding import BindingCreate
from app.schemas.knowledge_base import KnowledgeBaseCreate


class KnowledgeBaseService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.knowledge_base_repository = KnowledgeBaseRepository(session)
        self.binding_repository = BindingRepository(session)

    async def create_knowledge_base(self, project_id: str, payload: KnowledgeBaseCreate) -> KnowledgeBase:
        now = datetime.now(UTC)
        knowledge_base = KnowledgeBase(
            id=f"kb_{uuid4().hex[:12]}",
            project_id=project_id,
            name=payload.name,
            description=payload.description,
            status="ready",
            visibility=payload.visibility,
            active_release_id=None,
            release_policy=payload.release_policy,
            llm_backend=payload.llm_backend,
            llm_api_key_ref=payload.llm_api_key_ref,
            llm_model_override=payload.llm_model_override,
            llm_extraction_budget=payload.llm_extraction_budget,
            llm_base_url_override=payload.llm_base_url_override,
        )
        knowledge_base.created_at = now
        knowledge_base.updated_at = now
        knowledge_base = await self.knowledge_base_repository.create(knowledge_base)

        from pathlib import Path
        from app.config import settings
        from app.runner.workspace import WorkspaceManager

        wm = WorkspaceManager(Path(settings.data_root))
        wm.ensure_project_dir(project_id)
        kb_root = wm.ensure_kb_dir(project_id, knowledge_base.id)

        for name in ["obsidian", "wiki"]:
            repo_dir = kb_root / name
            if not (repo_dir / ".git").exists():
                import subprocess
                subprocess.run(
                    ["git", "init", str(repo_dir)],
                    capture_output=True, timeout=10,
                )
                (repo_dir / ".gitkeep").touch()
                subprocess.run(
                    ["git", "-C", str(repo_dir), "add", "-A"],
                    capture_output=True, timeout=10,
                )
                subprocess.run(
                    ["git", "-C", str(repo_dir), "commit", "-m", "initial"],
                    capture_output=True, timeout=10,
                )

        return knowledge_base

    async def get_knowledge_base(self, kb_id: str) -> KnowledgeBase:
        return await self.knowledge_base_repository.get(kb_id)

    async def list_knowledge_bases(self, project_id: str, page: int = 1, page_size: int = 20) -> tuple[list[KnowledgeBase], int]:
        items = await self.knowledge_base_repository.list(project_id=project_id)
        total = len(items)
        start = (page - 1) * page_size
        return items[start:start + page_size], total

    async def update_knowledge_base(self, kb_id: str, name: str) -> KnowledgeBase:
        kb = await self.knowledge_base_repository.get(kb_id)
        if kb is None:
            raise ValueError("knowledge base not found")
        kb.name = name
        kb.updated_at = datetime.now(UTC)
        return await self.knowledge_base_repository.update(kb)

    async def delete_knowledge_base(self, kb_id: str) -> None:
        kb = await self.knowledge_base_repository.get(kb_id)
        if kb is None:
            raise ValueError("knowledge base not found")
        await self.knowledge_base_repository.delete(kb)

    async def create_binding(self, kb_id: str, payload: BindingCreate) -> KnowledgeBaseSourceBinding:
        binding = KnowledgeBaseSourceBinding(
            id=f"bind_{uuid4().hex[:12]}",
            knowledge_base_id=kb_id,
            source_id=payload.source_id,
            binding_status=payload.binding_status,
            scope_override=payload.scope_override,
            include_rules_override=payload.include_rules_override,
            exclude_rules_override=payload.exclude_rules_override,
            priority=payload.priority,
        )
        return await self.binding_repository.create(binding)
```

- [ ] **Step 3: 改造 ArtifactService**

```python
# backend/app/services/artifact_service.py
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.artifact_version import ArtifactVersion
from app.repositories.releases import ReleaseRepository


class ArtifactService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.release_repository = ReleaseRepository(session)

    async def list_releases(self, kb_id: str, page: int, page_size: int) -> tuple[list, int]:
        return await self.release_repository.list_by_kb(kb_id=kb_id, page=page, page_size=page_size)

    async def get_artifacts_for_kb(self, kb_id: str) -> dict:
        release_id = await self.release_repository.get_active_release_id(kb_id)
        if release_id:
            stmt = (
                select(ArtifactVersion)
                .where(ArtifactVersion.release_id == release_id)
                .order_by(ArtifactVersion.id.asc())
            )
            result = await self.session.execute(stmt)
            artifacts = list(result.scalars().all())
        else:
            artifacts = []
        return {
            "kb_id": kb_id,
            "release_id": release_id,
            "artifacts": artifacts,
        }
```

- [ ] **Step 4: 改造 MCPGatewayService — 所有方法加 async/await**

`MCPGatewayService` 中所有 `self.knowledge_bases.get/get_active_release_id/list` 和 `self.releases.get` 调用前加 `await`。`GraphifyQueryAdapter` 调用不动（纯静态）。`self.session.query()` 改为 `select()` + `await self.session.execute()`。

关键改动点：
- `kb_status()` → `async def`，两个 DB 调用加 `await`
- `kb_list()` → `async def`，`self.knowledge_bases.list()` 加 `await`
- `_load_graph()` → `async def`，DB 调用加 `await`
- `_resolve_graph_path()` → `async def`，`self.session.query()` → `select()` + `await`
- `_active_release_id()` → `async def`，`self.knowledge_bases.get()` 加 `await`
- `_build_artifact_refs()` → `async def`，DB 调用加 `await`

- [ ] **Step 5: 验证 import**

Run: `cd backend && source .venv/bin/activate && python -c "from app.services.source_service import SourceService; from app.services.knowledge_base_service import KnowledgeBaseService; print('All services OK')"`
Expected: All services OK

- [ ] **Step 6: Commit**

```bash
git add backend/app/services/
git commit -m "feat: async-ify all request-scoped services"
```

---

### Task 4: BuildService async 化

**Files:**
- Modify: `backend/app/services/build_service.py`

- [ ] **Step 1: 改造 BuildService**

将所有方法改为 `async def`，`Session` → `AsyncSession`，`SessionLocal()` → `AsyncSessionLocal()`。

核心改动：
- `create_build_job()` → `async def`，用 `AsyncSessionLocal()` 获取 session，repository 调用加 `await`
- `_update_job_stage()` → `async def`，通过 `AsyncSessionLocal()` 获取 session，加 `await`
- `_persist_result()` → `async def`，加 `await`
- `_mark_job_failed()` → `async def`，加 `await`
- `_read_llm_config()` → `async def`，加 `await`
- `enqueue_build()` → `GraphifyRunner.run()` 仍用 `run_in_executor`（graphify 同步），但改 `loop.run_in_executor` 的参数引用

```python
# backend/app/services/build_service.py 关键方法改动:

import asyncio
import json
import logging
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.database import AsyncSessionLocal
from app.db.models.artifact_version import ArtifactVersion
from app.db.models.build_job import BuildJob
from app.db.models.release import Release
from app.repositories.build_jobs import BuildJobRepository
from app.repositories.knowledge_bases import KnowledgeBaseRepository
from app.runner.graphify_runner import GraphifyRunner
from app.runner.workspace import WorkspaceManager
from app.schemas.build_job import BuildJobCreate

logger = logging.getLogger(__name__)


class BuildService:
    def __init__(self, session_factory=None, runner: GraphifyRunner | None = None):
        self._session_factory = session_factory or AsyncSessionLocal
        self.runner = runner
        self.wm = WorkspaceManager(Path(settings.data_root))

    async def create_build_job(self, kb_id: str, payload: BuildJobCreate, project_id: str = "proj_default") -> tuple[BuildJob, list[dict], str]:
        async with self._session_factory() as session:
            repo = BuildJobRepository(session)
            kb_repo = KnowledgeBaseRepository(session)

            kb = await kb_repo.get(kb_id)
            project_id = kb.project_id if kb else project_id

            now = datetime.now(UTC)
            build_job = BuildJob(
                id=f"job_{uuid4().hex[:12]}",
                knowledge_base_id=kb_id,
                build_type=payload.build_type,
                status="pending",
                current_stage=None,
                release_id=None,
                error_summary=None,
                created_at=now,
                started_at=now,
            )
            build_job = await repo.create(build_job)
            sources = await repo.list_sources(kb_id)
            return build_job, sources, project_id

    async def enqueue_build(self, job_id: str, kb_id: str, sources: list[dict],
                             llm_config: dict | None = None, project_id: str = "proj_default") -> None:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            self._sync_run_and_persist,
            job_id, kb_id, sources, llm_config, project_id,
        )

    def _sync_run_and_persist(self, job_id, kb_id, sources, llm_config, project_id):
        """同步部分：graphify 运行 + 异步数据库写入通过 asyncio.run"""
        def on_progress(stage_name: str, status: str, **meta):
            import asyncio as _asyncio
            try:
                loop = _asyncio.get_running_loop()
            except RuntimeError:
                self._update_job_stage_sync(job_id, stage_name, status, **meta)
            else:
                loop.create_task(self._update_job_stage(job_id, stage_name, status, **meta))

        if self.runner is None:
            return

        result = self.runner.run(
            job_id=job_id,
            kb_id=kb_id,
            sources=sources,
            llm_config=llm_config,
            progress_callback=on_progress,
            project_id=project_id,
        )

        try:
            import asyncio as _asyncio
            _asyncio.run(self._persist_result(job_id, kb_id, result, project_id))
        except Exception:
            logger.exception("Failed to persist build result for job %s", job_id)
            import asyncio as _asyncio
            _asyncio.run(self._mark_job_failed(job_id, "Persistence error after runner completion"))

    def _update_job_stage_sync(self, job_id, stage_name, status, **meta):
        import asyncio as _asyncio
        _asyncio.run(self._update_job_stage(job_id, stage_name, status, **meta))

    async def _update_job_stage(self, job_id: str, stage_name: str, status: str, **meta):
        async with self._session_factory() as session:
            repo = BuildJobRepository(session)
            job = await repo.get(job_id)
            if job is None:
                return
            job.current_stage = stage_name
            if job.stages is None:
                job.stages = []
            existing = next((s for s in job.stages if s.get("name") == stage_name), None)
            stage_entry = {"name": stage_name, "status": status, **meta}
            if existing:
                existing.update(stage_entry)
            else:
                job.stages.append(stage_entry)
            if status == "running" and job.status == "pending":
                job.status = "running"
            await repo.update(job)

    async def _persist_result(self, job_id: str, kb_id: str, result: dict, project_id: str):
        async with self._session_factory() as session:
            repo = BuildJobRepository(session)
            job = await repo.get(job_id)
            if job is None:
                return

            stages = result.get("stages", [])
            has_failure = any(s.get("status") == "failed" for s in stages)
            job.status = "failed" if has_failure else "completed"
            job.finished_at = datetime.now(UTC)
            job.stages = stages

            release_dict = result.get("release")
            if release_dict is not None:
                created_at = release_dict.get("created_at", datetime.now(UTC))
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at)
                release = Release(
                    id=release_dict["id"],
                    knowledge_base_id=release_dict.get("knowledge_base_id", kb_id),
                    build_job_id=release_dict.get("build_job_id", job_id),
                    version=release_dict.get("version", "unknown"),
                    status=release_dict.get("status", "draft"),
                    artifact_status=release_dict.get("artifact_status", {}),
                    created_at=created_at,
                )
                session.add(release)
                job.release_id = release.id

                for a in result.get("artifacts", []):
                    session.add(ArtifactVersion(
                        id=a["id"],
                        release_id=a.get("release_id", release.id),
                        artifact_type=a["artifact_type"],
                        artifact_status=a.get("artifact_status", "ready"),
                        artifact_path=a.get("artifact_path", ""),
                        artifact_meta=a.get("artifact_meta", {}),
                    ))

                if result.get("graph_ready"):
                    kb_repo = KnowledgeBaseRepository(session)
                    kb = await kb_repo.get(kb_id)
                    if kb is not None:
                        kb.active_release_id = release.id
                        kb.updated_at = datetime.now(UTC)

            await session.commit()

    async def _mark_job_failed(self, job_id: str, error: str):
        async with self._session_factory() as session:
            repo = BuildJobRepository(session)
            job = await repo.get(job_id)
            if job:
                job.status = "failed"
                job.error_summary = error
                job.finished_at = datetime.now(UTC)
                await repo.update(job)

    async def _read_llm_config(self, kb_id: str) -> dict:
        async with self._session_factory() as session:
            kb_repo = KnowledgeBaseRepository(session)
            kb = await kb_repo.get(kb_id)
            if kb is None:
                return {}
            return {
                "llm_backend": kb.llm_backend,
                "llm_api_key_ref": kb.llm_api_key_ref,
                "llm_model_override": kb.llm_model_override,
                "llm_extraction_budget": kb.llm_extraction_budget,
                "llm_base_url_override": kb.llm_base_url_override,
            }

    def can_activate_release(self, release: dict) -> bool:
        return release.get("artifact_status", {}).get("graph") in ("ready", "degraded")
```

- [ ] **Step 2: 验证 import**

Run: `cd backend && source .venv/bin/activate && python -c "from app.services.build_service import BuildService; print('BuildService OK')"`
Expected: BuildService OK

- [ ] **Step 3: Commit**

```bash
git add backend/app/services/build_service.py
git commit -m "feat: async-ify BuildService with AsyncSessionLocal"
```

---

### Task 5: API 路由层 async 化

**Files:**
- Modify: `backend/app/api/routes/sources.py`
- Modify: `backend/app/api/routes/knowledge_bases.py`
- Modify: `backend/app/api/routes/build_jobs.py`

- [ ] **Step 1: 改造 sources.py — async 端点 + 新增 PUT/DELETE**

```python
# backend/app/api/routes/sources.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_async_session
from app.schemas.common import PageResponse
from app.schemas.source import SourceCreate, SourceRead
from app.services.source_service import SourceService

router = APIRouter(prefix="/api")


@router.post("/projects/{project_id}/sources", response_model=SourceRead, status_code=status.HTTP_201_CREATED)
async def create_source(project_id: str, payload: SourceCreate, session: AsyncSession = Depends(get_async_session)) -> SourceRead:
    source = await SourceService(session).create_source(project_id=project_id, payload=payload)
    return SourceRead.model_validate(source, from_attributes=True)


@router.get("/projects/{project_id}/sources", response_model=PageResponse[SourceRead])
async def list_sources(
    project_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
) -> PageResponse[SourceRead]:
    items, total = await SourceService(session).list_sources(project_id=project_id, page=page, page_size=page_size)
    return PageResponse[SourceRead](
        items=[SourceRead.model_validate(item, from_attributes=True) for item in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.put("/sources/{source_id}", response_model=SourceRead)
async def update_source(source_id: str, payload: SourceCreate, session: AsyncSession = Depends(get_async_session)) -> SourceRead:
    try:
        source = await SourceService(session).update_source(source_id, name=payload.name)
    except ValueError:
        raise HTTPException(status_code=404, detail="Source not found")
    return SourceRead.model_validate(source, from_attributes=True)


@router.delete("/sources/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_source(source_id: str, session: AsyncSession = Depends(get_async_session)):
    try:
        await SourceService(session).delete_source(source_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Source not found")
```

- [ ] **Step 2: 改造 knowledge_bases.py — async 端点 + 新增 PUT/DELETE**

```python
# backend/app/api/routes/knowledge_bases.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_async_session
from app.schemas.binding import BindingCreate, BindingRead
from app.schemas.common import PageResponse
from app.schemas.knowledge_base import KnowledgeBaseCreate, KnowledgeBaseRead
from app.schemas.release import ArtifactRead, ArtifactsResponse, ReleaseRead
from app.services.artifact_service import ArtifactService
from app.services.knowledge_base_service import KnowledgeBaseService

router = APIRouter(prefix="/api")


@router.post("/projects/{project_id}/knowledge-bases", response_model=KnowledgeBaseRead, status_code=status.HTTP_201_CREATED)
async def create_knowledge_base(
    project_id: str,
    payload: KnowledgeBaseCreate,
    session: AsyncSession = Depends(get_async_session),
) -> KnowledgeBaseRead:
    knowledge_base = await KnowledgeBaseService(session).create_knowledge_base(project_id=project_id, payload=payload)
    return KnowledgeBaseRead.model_validate(knowledge_base, from_attributes=True)


@router.post("/knowledge-bases/{kb_id}/bindings", response_model=BindingRead, status_code=status.HTTP_201_CREATED)
async def create_binding(
    kb_id: str,
    payload: BindingCreate,
    session: AsyncSession = Depends(get_async_session),
) -> BindingRead:
    binding = await KnowledgeBaseService(session).create_binding(kb_id=kb_id, payload=payload)
    return BindingRead.model_validate(binding, from_attributes=True)


@router.get("/knowledge-bases/{kb_id}", response_model=KnowledgeBaseRead)
async def get_knowledge_base(
    kb_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> KnowledgeBaseRead:
    knowledge_base = await KnowledgeBaseService(session).get_knowledge_base(kb_id)
    return KnowledgeBaseRead.model_validate(knowledge_base, from_attributes=True)


@router.get("/projects/{project_id}/knowledge-bases", response_model=PageResponse[KnowledgeBaseRead])
async def list_knowledge_bases(
    project_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
) -> PageResponse[KnowledgeBaseRead]:
    items, total = await KnowledgeBaseService(session).list_knowledge_bases(project_id, page=page, page_size=page_size)
    return PageResponse[KnowledgeBaseRead](
        items=[KnowledgeBaseRead.model_validate(item, from_attributes=True) for item in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.put("/knowledge-bases/{kb_id}", response_model=KnowledgeBaseRead)
async def update_knowledge_base(
    kb_id: str,
    payload: KnowledgeBaseCreate,
    session: AsyncSession = Depends(get_async_session),
) -> KnowledgeBaseRead:
    try:
        kb = await KnowledgeBaseService(session).update_knowledge_base(kb_id, name=payload.name)
    except ValueError:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    return KnowledgeBaseRead.model_validate(kb, from_attributes=True)


@router.delete("/knowledge-bases/{kb_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_knowledge_base(kb_id: str, session: AsyncSession = Depends(get_async_session)):
    try:
        await KnowledgeBaseService(session).delete_knowledge_base(kb_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Knowledge base not found")


@router.get("/knowledge-bases/{kb_id}/releases", response_model=PageResponse[ReleaseRead])
async def list_releases(
    kb_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
) -> PageResponse[ReleaseRead]:
    items, total = await ArtifactService(session).list_releases(kb_id=kb_id, page=page, page_size=page_size)
    return PageResponse[ReleaseRead](
        items=[
            ReleaseRead(
                id=item.id,
                knowledge_base_id=item.knowledge_base_id,
                build_job_id=item.build_job_id,
                version=item.version,
                status=item.status,
                artifact_status=item.artifact_status,
                created_at=item.created_at,
            )
            for item in items
        ],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get("/knowledge-bases/{kb_id}/artifacts", response_model=ArtifactsResponse)
async def get_artifacts(
    kb_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> ArtifactsResponse:
    artifacts = await ArtifactService(session).get_artifacts_for_kb(kb_id)
    return ArtifactsResponse(
        kb_id=artifacts["kb_id"],
        release_id=artifacts["release_id"],
        artifacts=[ArtifactRead.model_validate(item, from_attributes=True) for item in artifacts["artifacts"]],
    )
```

- [ ] **Step 3: 改造 build_jobs.py**

```python
# backend/app/api/routes/build_jobs.py
import asyncio
import logging
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.database import AsyncSessionLocal, get_async_session
from app.repositories.build_jobs import BuildJobRepository
from app.runner.graphify_runner import GraphifyRunner
from app.runner.workspace import WorkspaceManager
from app.schemas.build_job import BuildJobCreate, BuildJobRead
from app.schemas.common import PageResponse
from app.services.build_service import BuildService

router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)


def _log_task_exception(task: asyncio.Task) -> None:
    try:
        task.result()
    except Exception:
        logger.exception("Background build task failed")


def _make_runner() -> GraphifyRunner:
    data_root = Path(settings.data_root)
    data_root.mkdir(parents=True, exist_ok=True)
    return GraphifyRunner(WorkspaceManager(data_root))


@router.post("/knowledge-bases/{kb_id}/builds", response_model=BuildJobRead, status_code=status.HTTP_202_ACCEPTED)
async def create_build_job(
    kb_id: str,
    payload: BuildJobCreate,
    session: AsyncSession = Depends(get_async_session),
) -> BuildJobRead:
    runner = _make_runner()
    service = BuildService(session_factory=AsyncSessionLocal, runner=runner)

    job, sources, project_id = await service.create_build_job(kb_id, payload)
    llm_config = await service._read_llm_config(kb_id)

    task = asyncio.create_task(service.enqueue_build(
        job.id, kb_id, sources, llm_config=llm_config, project_id=project_id
    ))
    task.add_done_callback(_log_task_exception)

    return BuildJobRead(
        job_id=job.id,
        knowledge_base_id=job.knowledge_base_id,
        build_type=job.build_type,
        triggered_by=payload.triggered_by,
        reason=payload.reason,
        status=job.status,
        release_id=None,
        current_stage=job.current_stage,
        started_at=job.started_at.isoformat(),
        finished_at=None,
        error_summary=None,
        stages=job.stages,
    )


@router.get("/knowledge-bases/{kb_id}/builds", response_model=PageResponse[BuildJobRead])
async def list_build_jobs(
    kb_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
) -> PageResponse[BuildJobRead]:
    repo = BuildJobRepository(session)
    items, total = await repo.list_by_kb_paginated(kb_id=kb_id, page=page, page_size=page_size)
    return PageResponse[BuildJobRead](
        items=[
            BuildJobRead(
                job_id=item.id,
                knowledge_base_id=item.knowledge_base_id,
                build_type=item.build_type,
                triggered_by="manual",
                reason=None,
                status=item.status,
                release_id=item.release_id,
                current_stage=item.current_stage,
                started_at=item.started_at.isoformat(),
                finished_at=item.finished_at.isoformat() if item.finished_at else None,
                error_summary=item.error_summary,
            )
            for item in items
        ],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get("/build-jobs/{job_id}", response_model=BuildJobRead)
async def get_build_job(
    job_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> BuildJobRead:
    repo = BuildJobRepository(session)
    job = await repo.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Build job not found")
    return BuildJobRead(
        job_id=job.id,
        knowledge_base_id=job.knowledge_base_id,
        build_type=job.build_type,
        triggered_by="manual",
        reason=None,
        status=job.status,
        release_id=job.release_id,
        current_stage=job.current_stage,
        started_at=job.started_at.isoformat(),
        finished_at=job.finished_at.isoformat() if job.finished_at else None,
        error_summary=job.error_summary,
        stages=job.stages,
    )
```

- [ ] **Step 4: 删除 routes 中重复的 get_session 定义**

确保 `sources.py`、`knowledge_bases.py`、`build_jobs.py` 都从 `app.db.database` import `get_async_session`，不再各自定义 `get_session()`。

- [ ] **Step 5: 验证 import**

Run: `cd backend && source .venv/bin/activate && python -c "from app.api.routes import router; print('Routes OK')"`
Expected: Routes OK

- [ ] **Step 6: Commit**

```bash
git add backend/app/api/routes/
git commit -m "feat: async-ify API routes, add PUT/DELETE for KB and Source"
```

---

### Task 6: Project CRUD — Repository + Service + Routes

**Files:**
- Create: `backend/app/repositories/projects.py`
- Modify: `backend/app/services/knowledge_base_service.py` — 新增 ProjectService 或单独文件
- Modify: `backend/app/api/routes/__init__.py` — 注册 project router
- Modify: `backend/app/schemas/project.py` (如不存在则创建)

- [ ] **Step 1: 创建 ProjectRepository**

```python
# backend/app/repositories/projects.py
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.project import Project
from app.db.repository import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    model = Project

    async def list_all(self, page: int = 1, page_size: int = 20) -> tuple[list[Project], int]:
        from sqlalchemy import func
        count_stmt = select(func.count()).select_from(Project)
        total = (await self.session.execute(count_stmt)).scalar_one()

        stmt = select(Project).order_by(Project.id.asc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total
```

- [ ] **Step 2: 新建 ProjectService 到 knowledge_base_service.py 或独立文件**

在 `backend/app/services/knowledge_base_service.py` 末尾追加 ProjectService:

```python
# 追加到 knowledge_base_service.py 末尾
from datetime import UTC, datetime
from uuid import uuid4
from app.db.models.project import Project
from app.repositories.projects import ProjectRepository
from app.schemas.project import ProjectCreate


class ProjectService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = ProjectRepository(session)

    async def create_project(self, payload: ProjectCreate) -> Project:
        now = datetime.now(UTC)
        project = Project(
            id=f"proj_{uuid4().hex[:12]}",
            name=payload.name,
            description=payload.description,
        )
        # Project model 没有 created_at/updated_at，跳过
        return await self.repo.create(project)

    async def list_projects(self, page: int = 1, page_size: int = 20) -> tuple[list[Project], int]:
        return await self.repo.list_all(page=page, page_size=page_size)

    async def get_project(self, project_id: str) -> Project | None:
        return await self.repo.get(project_id)

    async def update_project(self, project_id: str, name: str) -> Project:
        project = await self.repo.get(project_id)
        if project is None:
            raise ValueError("project not found")
        project.name = name
        return await self.repo.update(project)

    async def delete_project(self, project_id: str) -> None:
        project = await self.repo.get(project_id)
        if project is None:
            raise ValueError("project not found")
        await self.repo.delete(project)
```

- [ ] **Step 3: 创建 Project 路由文件**

```python
# backend/app/api/routes/projects.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_async_session
from app.schemas.common import PageResponse
from app.schemas.project import ProjectCreate, ProjectRead
from app.services.knowledge_base_service import ProjectService

router = APIRouter(prefix="/api")


@router.post("/projects", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(payload: ProjectCreate, session: AsyncSession = Depends(get_async_session)) -> ProjectRead:
    project = await ProjectService(session).create_project(payload)
    return ProjectRead.model_validate(project, from_attributes=True)


@router.get("/projects", response_model=PageResponse[ProjectRead])
async def list_projects(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
) -> PageResponse[ProjectRead]:
    items, total = await ProjectService(session).list_projects(page=page, page_size=page_size)
    return PageResponse[ProjectRead](
        items=[ProjectRead.model_validate(item, from_attributes=True) for item in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get("/projects/{project_id}", response_model=ProjectRead)
async def get_project(project_id: str, session: AsyncSession = Depends(get_async_session)) -> ProjectRead:
    project = await ProjectService(session).get_project(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectRead.model_validate(project, from_attributes=True)


@router.put("/projects/{project_id}", response_model=ProjectRead)
async def update_project(project_id: str, payload: ProjectCreate, session: AsyncSession = Depends(get_async_session)) -> ProjectRead:
    try:
        project = await ProjectService(session).update_project(project_id, name=payload.name)
    except ValueError:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectRead.model_validate(project, from_attributes=True)


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str, session: AsyncSession = Depends(get_async_session)):
    try:
        await ProjectService(session).delete_project(project_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Project not found")
```

- [ ] **Step 4: 注册 project router**

在 `backend/app/api/routes/__init__.py` 中添加:

```python
from app.api.routes.projects import router as projects_router
# ...
router.include_router(projects_router)
```

- [ ] **Step 5: 检查/创建 Project Schema**

如果 `backend/app/schemas/project.py` 不存在，创建:

```python
# backend/app/schemas/project.py
from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None


class ProjectRead(ProjectCreate):
    id: str
```

- [ ] **Step 6: 验证 import**

Run: `cd backend && source .venv/bin/activate && python -c "from app.repositories.projects import ProjectRepository; from app.services.knowledge_base_service import ProjectService; print('Project CRUD OK')"`
Expected: Project CRUD OK

- [ ] **Step 7: Commit**

```bash
git add backend/app/repositories/projects.py backend/app/api/routes/projects.py backend/app/api/routes/__init__.py backend/app/schemas/project.py backend/app/services/knowledge_base_service.py
git commit -m "feat: add Project CRUD with Repository, Service, and API routes"
```

---

### Task 7: MCP 路由 + main.py 改造

**Files:**
- Modify: `backend/app/mcp/routes.py`
- Modify: `backend/app/main.py`
- Modify: `backend/app/db/base.py`

- [ ] **Step 1: 改造 MCP 路由 — async 化**

```python
# backend/app/mcp/routes.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_async_session
from app.services.mcp_gateway_service import MCPGatewayService

router = APIRouter(prefix="/mcp")


class KBStatusRequest(BaseModel):
    kb_id: str


class KBQueryRequest(BaseModel):
    kb_id: str
    question: str


class KBListRequest(BaseModel):
    project_id: str | None = None


class KBPathRequest(BaseModel):
    kb_id: str
    source_label: str
    target_label: str


class KBExplainRequest(BaseModel):
    kb_id: str
    node_label: str
    budget: int = 2000


@router.post("/kb_status")
async def kb_status(payload: KBStatusRequest, session: AsyncSession = Depends(get_async_session)) -> dict:
    return await MCPGatewayService(session).kb_status(payload.kb_id)


@router.post("/kb_list")
async def kb_list(payload: KBListRequest, session: AsyncSession = Depends(get_async_session)) -> dict:
    return await MCPGatewayService(session).kb_list(payload.project_id)


@router.post("/kb_query")
async def kb_query(payload: KBQueryRequest, session: AsyncSession = Depends(get_async_session)) -> dict:
    return await MCPGatewayService(session).kb_query(payload.kb_id, payload.question)


@router.post("/kb_path")
async def kb_path(payload: KBPathRequest, session: AsyncSession = Depends(get_async_session)) -> dict:
    return await MCPGatewayService(session).kb_path(payload.kb_id, payload.source_label, payload.target_label)


@router.post("/kb_explain")
async def kb_explain(payload: KBExplainRequest, session: AsyncSession = Depends(get_async_session)) -> dict:
    return await MCPGatewayService(session).kb_explain(payload.kb_id, payload.node_label, payload.budget)
```

- [ ] **Step 2: 改造 main.py — 启动事件**

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.api.routes import router
from app.config import settings
from app.db.database import AsyncSessionLocal, engine
from app.db.base import Base
from app.mcp.routes import router as mcp_router

app = FastAPI(title=settings.app_name)
app.include_router(router)
app.include_router(mcp_router)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

data_path = Path(settings.data_root)
app.mount("/data", StaticFiles(directory=str(data_path)), name="artifacts")


@app.on_event("startup")
async def startup_create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.on_event("startup")
async def startup_git_poll():
    import asyncio
    asyncio.create_task(_git_poll_loop())


async def _git_poll_loop():
    import asyncio
    from app.config import settings
    from app.db.database import AsyncSessionLocal
    from app.repositories.sources import SourceRepository
    from app.runner.source_materializer import SourceMaterializer
    from app.runner.workspace import WorkspaceManager
    from pathlib import Path

    wm = WorkspaceManager(Path(settings.data_root))

    while True:
        await asyncio.sleep(60)
        async with AsyncSessionLocal() as session:
            try:
                repo = SourceRepository(session)
                sources = await repo.list_all_polling()
                for src in sources:
                    mat = SourceMaterializer(src.project_id, wm.project_root(src.project_id))
                    if mat.check_for_updates({
                        "id": src.id, "type": src.type, "source_ref": src.source_ref,
                        "git_tracking_branch": src.git_tracking_branch,
                    }):
                        mat.pull_updates({
                            "id": src.id, "type": src.type, "source_ref": src.source_ref,
                            "git_tracking_branch": src.git_tracking_branch,
                        })
            except Exception:
                pass
```

- [ ] **Step 3: 清理 base.py — 删 sync engine/session，只留 Base**

```python
# backend/app/db/base.py
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
```

- [ ] **Step 4: 验证 full import chain**

Run: `cd backend && source .venv/bin/activate && python -c "from app.main import app; print('App OK')"`
Expected: App OK

- [ ] **Step 5: Commit**

```bash
git add backend/app/main.py backend/app/db/base.py backend/app/mcp/routes.py
git commit -m "feat: async startup, git poll loop, MCP routes; trim base.py"
```

---

### Task 8: Alembic 适配 + 数据库迁移

**Files:**
- Modify: `backend/alembic/env.py`

- [ ] **Step 1: 修改 alembic/env.py 的 URL scheme**

```python
# backend/alembic/env.py 第9-11行区域改为:
from app.config import settings

sync_url = settings.database_url.replace("+asyncpg", "")
config.set_main_option("sqlalchemy.url", sync_url)
```

- [ ] **Step 2: 运行 alembic migration**

Run: `cd backend && source .venv/bin/activate && python -m alembic upgrade head`
Expected: 5 migrations run successfully, output shows "Running upgrade ... -> 20260519_0001", "... -> 20260519_0002", etc.

- [ ] **Step 3: 验证 PostgreSQL 中表已创建**

Run: `/opt/homebrew/opt/postgresql@16/bin/psql -d aiwiki -c "\dt"`
Expected: 列出 7 张表 (projects, sources, knowledge_bases, build_jobs, knowledge_base_source_bindings, releases, artifact_versions)

- [ ] **Step 4: Commit**

```bash
git add backend/alembic/env.py
git commit -m "fix: alembic env.py strips +asyncpg for migration URL"
```

---

### Task 9: 集成测试 + 服务启动验证

- [ ] **Step 1: 启动后端**

Run: `cd backend && source .venv/bin/activate && AIKB_DATABASE_URL="postgresql+asyncpg://sunweini@localhost:5432/aiwiki" uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir app/`
Expected: Server starts without errors, no "no such table" errors

- [ ] **Step 2: 测试 healthcheck**

Run: `curl http://localhost:8000/api/healthz`
Expected: `{"status":"ok"}`

- [ ] **Step 3: 创建 Project**

Run: `curl -X POST http://localhost:8000/api/projects -H "Content-Type: application/json" -d '{"name":"测试项目"}'`
Expected: 201, 返回含 `id`、`name` 的 JSON

- [ ] **Step 4: 创建 Source**

Run: `curl -X POST http://localhost:8000/api/projects/<project_id>/sources -H "Content-Type: application/json" -d '{"name":"测试数据源","type":"markdown_dir","source_ref":"/tmp/test"}'`
Expected: 201

- [ ] **Step 5: 创建 KnowledgeBase**

Run: `curl -X POST http://localhost:8000/api/projects/<project_id>/knowledge-bases -H "Content-Type: application/json" -d '{"name":"测试知识库","llm_backend":"deepseek","llm_api_key_ref":"env:CUSTOM_LLM_API_KEY"}'`
Expected: 201

- [ ] **Step 6: 测试 PUT (编辑 name)**

Run: `curl -X PUT http://localhost:8000/api/knowledge-bases/<kb_id> -H "Content-Type: application/json" -d '{"name":"改名后的知识库"}'`
Expected: 200, `name` 已更新，`id` 不变

- [ ] **Step 7: 测试 DELETE**

Run: `curl -X DELETE http://localhost:8000/api/knowledge-bases/<kb_id>`
Expected: 204

---

## 验证

1. `cd backend && python -m alembic upgrade head` — 7 张表在 PostgreSQL 中
2. `curl http://localhost:8000/api/healthz` — `{"status":"ok"}`
3. CRUD 全流程: POST Project → POST Source → POST KB → PUT KB name → DELETE Source → DELETE KB → DELETE Project
4. `AIKB_DATABASE_URL` 环境变量可覆盖默认 URL
5. graphify runner 逻辑不受影响（Task 4 中 `_sync_run_and_persist` 保持同步线程模式）
