from datetime import UTC, datetime

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.db.database import AsyncSessionLocal
from app.db.models.artifact_version import ArtifactVersion
from app.db.models.build_job import BuildJob
from app.db.models.knowledge_base import KnowledgeBase
from app.db.models.project import Project
from app.db.models.release import Release
from app.main import app


@pytest_asyncio.fixture(autouse=True)
async def seeded_data() -> datetime:
    async with AsyncSessionLocal() as session:
        now = datetime.now(UTC)
        p = Project(id="proj_checkout", name="Checkout", description=None)
        session.add(p)
        await session.flush()

        kb = KnowledgeBase(
            id="kb_checkout_core",
            project_id="proj_checkout",
            name="Checkout Core",
            status="ready",
            visibility="org_shared",
            active_release_id=None,
            created_at=now, updated_at=now,
        )
        session.add(kb)
        await session.flush()

        # BuildJob first: release_id nullable, so can be None
        bj = BuildJob(
            id="job_2026_05_19_0021",
            knowledge_base_id="kb_checkout_core",
            build_type="full_build",
            status="succeeded",
            release_id=None,
            error_summary=None,
            created_at=now, started_at=now,
        )
        session.add(bj)
        await session.flush()

        # Release references existing BuildJob (build_job_id NOT NULL)
        rel = Release(
            id="rel_2026_05_19_001",
            knowledge_base_id="kb_checkout_core",
            build_job_id="job_2026_05_19_0021",
            version="v1",
            status="active",
            artifact_status={"obsidian_vault": "active"},
            created_at=now,
        )
        session.add(rel)
        await session.flush()

        av = ArtifactVersion(
            id="art_2026_05_19_001",
            release_id="rel_2026_05_19_001",
            artifact_type="obsidian_vault",
            artifact_status="active",
            artifact_path="artifacts/kb_checkout_core/rel_2026_05_19_001/vault",
            artifact_meta={"format": "obsidian"},
        )
        session.add(av)
        await session.flush()

        # Resolve circular refs
        kb.active_release_id = rel.id
        bj.release_id = rel.id
        await session.flush()
        await session.commit()
    return now


@pytest.mark.asyncio
async def test_list_releases_returns_paginated_payload(seeded_data: datetime) -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.get("/api/knowledge-bases/kb_checkout_core/releases")

    assert response.status_code == 200
    assert response.json()["page"] == 1
    assert response.json()["page_size"] == 20
    assert response.json()["total"] == 1
    assert response.json()["items"][0]["id"] == "rel_2026_05_19_001"
    assert response.json()["items"][0]["knowledge_base_id"] == "kb_checkout_core"
    assert response.json()["items"][0]["build_job_id"] == "job_2026_05_19_0021"
    assert response.json()["items"][0]["version"] == "v1"
    assert response.json()["items"][0]["status"] == "active"
    assert response.json()["items"][0]["artifact_status"] == {"obsidian_vault": "active"}
    from datetime import timezone

    assert response.json()["items"][0]["created_at"] == seeded_data.isoformat().replace("+00:00", "Z")


@pytest.mark.asyncio
async def test_get_active_artifacts_returns_release_payload() -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.get("/api/knowledge-bases/kb_checkout_core/artifacts")

    assert response.status_code == 200
    assert response.json() == {
        "kb_id": "kb_checkout_core",
        "release_id": "rel_2026_05_19_001",
        "artifacts": [
            {
                "id": "art_2026_05_19_001",
                "artifact_type": "obsidian_vault",
                "artifact_status": "active",
                "artifact_path": "artifacts/kb_checkout_core/rel_2026_05_19_001/vault",
                "artifact_meta": {"format": "obsidian"},
            }
        ],
    }
