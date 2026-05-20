from datetime import UTC, datetime
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

from app.db.base import SessionLocal, engine
from app.db.models.artifact_version import ArtifactVersion
from app.db.models.binding import KnowledgeBaseSourceBinding
from app.db.models.build_job import BuildJob
from app.db.models.knowledge_base import KnowledgeBase
from app.db.models.project import Project
from app.db.models.release import Release
from app.db.models.source import Source
from app.main import app
from app.runner.graphify_runner import GraphifyRunner
from app.runner.workspace import WorkspaceManager


def test_workspace_manager_creates_expected_layout(tmp_path: Path) -> None:
    manager = WorkspaceManager(data_root=tmp_path)

    workspace = manager.create_build_workspace("p", "kb_test", "job_2026_05_19_0021")

    assert (workspace / "input").exists()
    assert (workspace / "out").exists()
    assert (workspace / "logs").exists()
    assert (workspace / "metadata").exists()


def test_graphify_runner_returns_stage_log(tmp_path: Path) -> None:
    manager = WorkspaceManager(data_root=tmp_path)
    runner = GraphifyRunner(workspace_manager=manager)

    result = runner.run(
        job_id="job_2026_05_19_0021",
        kb_id="kb_checkout_core",
        sources=[{"id": "src_checkout_repo"}],
    )

    stage_names = [s["name"] for s in result["stages"]]
    assert stage_names[:7] == [
        "validate_boundary",
        "resolve_job_context",
        "materialize_sources",
        "normalize_inputs",
        "extract",
        "build",
        "validate",
    ]
    assert "release" in result
    assert "stats" in result


def test_source_materializer_creates_source_dirs(tmp_path: Path) -> None:
    manager = WorkspaceManager(data_root=tmp_path)
    runner = GraphifyRunner(workspace_manager=manager)

    runner.run(
        job_id="job_2026_05_19_0021",
        kb_id="kb_checkout_core",
        sources=[
            {"id": "src_checkout_repo"},
            {"id": "src_orders_service"},
        ],
    )

    assert manager.source_dir("proj_default", "src_checkout_repo").exists()
    assert manager.source_dir("proj_default", "src_orders_service").exists()


@pytest.fixture
def demo_loop_tables() -> None:
    Project.__table__.create(bind=engine, checkfirst=True)
    Source.__table__.create(bind=engine, checkfirst=True)
    KnowledgeBase.__table__.create(bind=engine, checkfirst=True)
    KnowledgeBaseSourceBinding.__table__.create(bind=engine, checkfirst=True)
    Release.__table__.create(bind=engine, checkfirst=True)
    BuildJob.__table__.create(bind=engine, checkfirst=True)
    ArtifactVersion.__table__.create(bind=engine, checkfirst=True)
    with SessionLocal() as session:
        now = datetime.now(UTC)
        session.add(
            Project(id="proj_delivery_alpha", name="Delivery Alpha", description=None)
        )
        session.commit()
    yield
    ArtifactVersion.__table__.drop(bind=engine, checkfirst=True)
    BuildJob.__table__.drop(bind=engine, checkfirst=True)
    Release.__table__.drop(bind=engine, checkfirst=True)
    KnowledgeBaseSourceBinding.__table__.drop(bind=engine, checkfirst=True)
    KnowledgeBase.__table__.drop(bind=engine, checkfirst=True)
    Source.__table__.drop(bind=engine, checkfirst=True)
    Project.__table__.drop(bind=engine, checkfirst=True)


@pytest.mark.anyio
async def test_minimum_demo_loop(demo_loop_tables: None) -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        source_response = await client.post(
            "/api/projects/proj_delivery_alpha/sources",
            json={
                "name": "checkout-service",
                "type": "github_repo",
                "source_ref": "acme/checkout-service",
                "sync_strategy": "webhook",
            },
        )
        assert source_response.status_code == 201
        source_id = source_response.json()["id"]

        kb_response = await client.post(
            "/api/projects/proj_delivery_alpha/knowledge-bases",
            json={"name": "Checkout Core", "visibility": "org_shared"},
        )
        assert kb_response.status_code == 201
        kb_id = kb_response.json()["id"]

        binding_response = await client.post(
            f"/api/knowledge-bases/{kb_id}/bindings",
            json={"source_id": source_id, "binding_status": "active"},
        )
        assert binding_response.status_code == 201

        build_response = await client.post(
            f"/api/knowledge-bases/{kb_id}/builds",
            json={
                "build_type": "incremental_update",
                "triggered_by": "manual",
                "reason": "demo loop",
            },
        )
        assert build_response.status_code == 202
        assert build_response.json()["job_id"].startswith("job_")

        releases_response = await client.get(
            f"/api/knowledge-bases/{kb_id}/releases"
        )
        assert releases_response.status_code == 200
        releases_payload = releases_response.json()
        assert set(releases_payload.keys()) >= {"items", "page", "page_size", "total"}
        assert isinstance(releases_payload["items"], list)

        artifacts_response = await client.get(
            f"/api/knowledge-bases/{kb_id}/artifacts"
        )
        assert artifacts_response.status_code == 200
        artifacts_payload = artifacts_response.json()
        assert set(artifacts_payload.keys()) >= {"kb_id", "release_id", "artifacts"}
        assert artifacts_payload["kb_id"] == kb_id
        assert isinstance(artifacts_payload["artifacts"], list)

        status_response = await client.post(
            "/mcp/kb_status", json={"kb_id": kb_id}
        )
        assert status_response.status_code == 200
        status_payload = status_response.json()
        assert status_payload["kb_id"] == kb_id
        assert "status" in status_payload
        assert "active_release_id" in status_payload
        assert "graph_status" in status_payload
