from datetime import UTC, datetime
from unittest.mock import ANY, Mock

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.models.binding import KnowledgeBaseSourceBinding as BindingModel
from app.db.models.build_job import BuildJob as BuildJobModel
from app.db.models.knowledge_base import KnowledgeBase as KnowledgeBaseModel
from app.db.models.project import Project as ProjectModel
from app.db.models.source import Source as SourceModel
from app.schemas.build_job import BuildJobCreate
from app.services.build_service import BuildService


@pytest_asyncio.fixture
async def sqlite_engine():
    """Per-test in-memory SQLite engine, disposed after each test."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


def test_enqueue_build_calls_runner_once() -> None:
    """Sync test — _sync_run_and_persist uses asyncio.run internally."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    import asyncio

    async def _setup():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    asyncio.run(_setup())

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    runner = Mock()
    runner.run.return_value = {
        "job_id": "job_1",
        "kb_id": "kb_1",
        "stages": [],
        "sources": [{"id": "src_1"}],
        "graph_ready": True,
        "release": None,
        "artifacts": [],
        "stats": {},
    }
    service = BuildService(session_factory=session_factory, runner=runner)

    service._sync_run_and_persist(
        "job_1", "kb_1", [{"id": "src_1"}], {}, "proj_default"
    )

    runner.run.assert_called_once_with(
        job_id="job_1",
        kb_id="kb_1",
        sources=[{"id": "src_1"}],
        llm_config={},
        progress_callback=ANY,
        project_id="proj_default",
    )

    async def _cleanup():
        await engine.dispose()

    asyncio.run(_cleanup())


@pytest.mark.asyncio
async def test_create_build_job_persists_and_returns_sources(sqlite_engine) -> None:
    session_factory = async_sessionmaker(sqlite_engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as session:
        now = datetime.now(UTC)
        session.add(ProjectModel(id="proj_1", name="Project 1", description=None))
        session.add(
            SourceModel(
                id="src_1",
                project_id="proj_1",
                name="checkout-service",
                type="github_repo",
                status="active",
                source_ref="acme/checkout-service",
                description=None,
                auth_config={},
                sync_strategy="webhook",
                include_rules=[],
                exclude_rules=[],
                normalization_options={},
                last_synced_at=None,
                created_at=now,
                updated_at=now,
            )
        )
        session.add(
            KnowledgeBaseModel(
                id="kb_1",
                project_id="proj_1",
                name="KB 1",
                status="ready",
                visibility="org_shared",
                active_release_id=None,
                created_at=now,
                updated_at=now,
            )
        )
        session.add(
            BindingModel(
                id="bind_1",
                knowledge_base_id="kb_1",
                source_id="src_1",
                binding_status="active",
                scope_override={},
                include_rules_override=[],
                exclude_rules_override=[],
                priority=100,
            )
        )
        await session.commit()

    service = BuildService(session_factory=session_factory)
    payload = BuildJobCreate(build_type="full_build", triggered_by="system", reason=None)

    job, sources, project_id = await service.create_build_job("kb_1", payload)

    async with session_factory() as session2:
        persisted = await session2.get(BuildJobModel, job.id)
        assert persisted is not None
        assert persisted.knowledge_base_id == "kb_1"
        assert persisted.build_type == "full_build"
        assert persisted.status == "pending"
        assert persisted.created_at == job.created_at
        assert persisted.started_at == job.started_at
        assert sources == [
            {
                "id": "src_1",
                "name": "checkout-service",
                "type": "github_repo",
                "source_ref": "acme/checkout-service",
            }
        ]
        from app.repositories.build_jobs import BuildJobRepository
        jobs = await BuildJobRepository(session2).list_by_kb("kb_1")
        assert jobs[0].id == job.id
        assert project_id == "proj_1"
