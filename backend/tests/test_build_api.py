import pytest
import pytest_asyncio
from datetime import UTC, datetime
from unittest.mock import patch

from httpx import ASGITransport, AsyncClient

from app.db.database import AsyncSessionLocal
from app.db.models.binding import KnowledgeBaseSourceBinding as BindingModel
from app.db.models.build_job import BuildJob as BuildJobModel
from app.db.models.knowledge_base import KnowledgeBase as KnowledgeBaseModel
from app.db.models.project import Project as ProjectModel
from app.db.models.source import Source as SourceModel
from app.main import app


@pytest_asyncio.fixture
async def seeded_data() -> None:
    async with AsyncSessionLocal() as session:
        now = datetime.now(UTC)
        project = ProjectModel(id="proj_delivery_alpha", name="Delivery Alpha", description=None)
        source = SourceModel(
            id="src_checkout_repo",
            project_id="proj_delivery_alpha",
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
        knowledge_base = KnowledgeBaseModel(
            id="kb_checkout_core",
            project_id="proj_delivery_alpha",
            name="Checkout Core Knowledge Base",
            status="ready",
            visibility="org_shared",
            active_release_id=None,
            created_at=now,
            updated_at=now,
        )
        binding = BindingModel(
            id="bind_checkout_repo",
            knowledge_base_id="kb_checkout_core",
            source_id="src_checkout_repo",
            binding_status="active",
            scope_override={},
            include_rules_override=[],
            exclude_rules_override=[],
            priority=100,
        )
        session.add(project)
        session.add(source)
        await session.flush()
        session.add(knowledge_base)
        await session.flush()
        session.add(binding)
        await session.commit()


@pytest.mark.asyncio
async def test_create_build_job_returns_persisted_job_payload(seeded_data: None) -> None:
    transport = ASGITransport(app=app)

    with patch("app.api.routes.build_jobs.BuildService.enqueue_build") as enqueue_build:
        enqueue_build.return_value = None
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            response = await client.post(
                "/api/knowledge-bases/kb_checkout_core/builds",
                json={
                    "build_type": "incremental_update",
                    "triggered_by": "manual",
                    "reason": "Sync latest checkout service changes.",
                },
            )

    assert response.status_code == 202
    data = response.json()
    assert data["build_type"] == "incremental_update"
    assert data["knowledge_base_id"] == "kb_checkout_core"
    assert data["job_id"].startswith("job_")

    async with AsyncSessionLocal() as session:
        job = await session.get(BuildJobModel, data["job_id"])
        assert job is not None
        assert job.knowledge_base_id == "kb_checkout_core"
        assert job.build_type == "incremental_update"
        assert job.status == "pending"
        assert job.started_at is not None
        assert data["started_at"] == job.started_at.isoformat()

    enqueue_build.assert_called_once()


@pytest.mark.asyncio
async def test_create_build_job_status_is_pending_and_enqueues_runner(seeded_data: None) -> None:
    transport = ASGITransport(app=app)

    with patch("app.api.routes.build_jobs.BuildService.enqueue_build") as enqueue_build:
        enqueue_build.return_value = None
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            response = await client.post(
                "/api/knowledge-bases/kb_checkout_core/builds",
                json={"build_type": "full_build", "triggered_by": "system"},
            )

    assert response.status_code == 202
    data = response.json()
    assert data["status"] == "pending"
    enqueue_build.assert_called_once()
    call_args = enqueue_build.call_args
    assert call_args[0][0] == data["job_id"]
    assert call_args[0][1] == "kb_checkout_core"
    assert call_args[0][2] == [
        {
            "id": "src_checkout_repo",
            "name": "checkout-service",
            "type": "github_repo",
            "source_ref": "acme/checkout-service",
        }
    ]
