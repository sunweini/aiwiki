from datetime import UTC, datetime

import pytest
from httpx import ASGITransport, AsyncClient

from app.db.base import engine, SessionLocal
from app.db.models.artifact_version import ArtifactVersion
from app.db.models.build_job import BuildJob
from app.db.models.knowledge_base import KnowledgeBase
from app.db.models.project import Project
from app.db.models.release import Release
from app.main import app


@pytest.fixture(autouse=True)
def create_tables() -> None:
    Project.__table__.create(bind=engine, checkfirst=True)
    KnowledgeBase.__table__.create(bind=engine, checkfirst=True)
    Release.__table__.create(bind=engine, checkfirst=True)
    BuildJob.__table__.create(bind=engine, checkfirst=True)
    ArtifactVersion.__table__.create(bind=engine, checkfirst=True)
    yield
    ArtifactVersion.__table__.drop(bind=engine, checkfirst=True)
    BuildJob.__table__.drop(bind=engine, checkfirst=True)
    Release.__table__.drop(bind=engine, checkfirst=True)
    KnowledgeBase.__table__.drop(bind=engine, checkfirst=True)
    Project.__table__.drop(bind=engine, checkfirst=True)


@pytest.fixture(autouse=True)
def seeded_data() -> datetime:
    with SessionLocal() as session:
        now = datetime.now(UTC)
        session.add(Project(id="proj_checkout", name="Checkout", description=None))
        session.add(
            KnowledgeBase(
                id="kb_checkout_core",
                project_id="proj_checkout",
                name="Checkout Core",
                status="ready",
                visibility="org_shared",
                active_release_id="rel_2026_05_19_001",
                created_at=now,
                updated_at=now,
            )
        )
        session.add(
            Release(
                id="rel_2026_05_19_001",
                knowledge_base_id="kb_checkout_core",
                build_job_id="job_2026_05_19_0021",
                version="v1",
                status="active",
                artifact_status={"obsidian_vault": "active"},
                created_at=now,
            )
        )
        session.add(
            BuildJob(
                id="job_2026_05_19_0021",
                knowledge_base_id="kb_checkout_core",
                build_type="full_build",
                status="succeeded",
                release_id="rel_2026_05_19_001",
                error_summary=None,
                created_at=now,
                started_at=now,
            )
        )
        session.add(
            ArtifactVersion(
                id="art_2026_05_19_001",
                release_id="rel_2026_05_19_001",
                artifact_type="obsidian_vault",
                artifact_status="active",
                artifact_path="artifacts/kb_checkout_core/rel_2026_05_19_001/vault",
                artifact_meta={"format": "obsidian"},
            )
        )
        session.commit()
    return now


@pytest.mark.anyio
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
    assert response.json()["items"][0]["created_at"] == seeded_data.replace(tzinfo=None).isoformat()


@pytest.mark.anyio
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
