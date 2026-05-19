import json
from datetime import UTC, datetime
from pathlib import Path
from tempfile import TemporaryDirectory

import networkx as nx
import pytest
from httpx import ASGITransport, AsyncClient
from networkx.readwrite import json_graph

from app.db.base import SessionLocal, engine
from app.db.models.artifact_version import ArtifactVersion
from app.db.models.knowledge_base import KnowledgeBase
from app.db.models.project import Project
from app.db.models.release import Release
from app.main import app


@pytest.fixture(autouse=True)
def create_tables() -> None:
    Project.__table__.create(bind=engine, checkfirst=True)
    KnowledgeBase.__table__.create(bind=engine, checkfirst=True)
    Release.__table__.create(bind=engine, checkfirst=True)
    ArtifactVersion.__table__.create(bind=engine, checkfirst=True)
    yield
    ArtifactVersion.__table__.drop(bind=engine, checkfirst=True)
    Release.__table__.drop(bind=engine, checkfirst=True)
    KnowledgeBase.__table__.drop(bind=engine, checkfirst=True)
    Project.__table__.drop(bind=engine, checkfirst=True)


@pytest.fixture
def graph_file() -> Path:
    """Create a minimal graph.json for testing query operations."""
    G = nx.Graph()
    G.add_node("checkout_service", label="checkout_service", type="module")
    G.add_node("payment_gateway", label="payment_gateway", type="module")
    G.add_edge("checkout_service", "payment_gateway", kind="EXTRACTED")
    data = json_graph.node_link_data(G, link="links")
    tmp = TemporaryDirectory()
    path = Path(tmp.name) / "graph.json"
    path.write_text(json.dumps(data))
    yield path
    tmp.cleanup()


@pytest.fixture
def seeded_now(graph_file: Path) -> datetime:
    now = datetime.now(UTC)
    with SessionLocal() as session:
        session.add(Project(id="proj_checkout", name="Checkout", description=None))
        session.add(Project(id="proj_other", name="Other", description=None))
        session.add(
            Release(
                id="rel_2026_05_19_001",
                knowledge_base_id="kb_checkout_core",
                build_job_id="job_2026_05_19_0021",
                version="v1",
                status="active",
                artifact_status={"graph": "ready", "obsidian_vault": "ready"},
                created_at=now,
            )
        )
        session.add(
            ArtifactVersion(
                id="art_graph_001",
                release_id="rel_2026_05_19_001",
                artifact_type="graph",
                artifact_status="ready",
                artifact_path=str(graph_file),
                artifact_meta={},
            )
        )
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
            KnowledgeBase(
                id="kb_no_release",
                project_id="proj_checkout",
                name="No Release KB",
                status="empty",
                visibility="org_shared",
                active_release_id=None,
                created_at=now,
                updated_at=now,
            )
        )
        session.add(
            KnowledgeBase(
                id="kb_other_project",
                project_id="proj_other",
                name="Other KB",
                status="ready",
                visibility="org_shared",
                active_release_id=None,
                created_at=now,
                updated_at=now,
            )
        )
        session.commit()
    return now


@pytest.mark.anyio
async def test_kb_status_returns_real_active_release(seeded_now: datetime) -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post("/mcp/kb_status", json={"kb_id": "kb_checkout_core"})

    assert response.status_code == 200
    data = response.json()
    assert data["kb_id"] == "kb_checkout_core"
    assert data["status"] == "ready"
    assert data["active_release_id"] == "rel_2026_05_19_001"
    assert data["graph_status"] == "ready"
    assert data["artifact_status"] == {"graph": "ready", "obsidian_vault": "ready"}


@pytest.mark.anyio
async def test_kb_status_returns_missing_when_no_active_release(seeded_now: datetime) -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post("/mcp/kb_status", json={"kb_id": "kb_no_release"})

    assert response.status_code == 200
    data = response.json()
    assert data["kb_id"] == "kb_no_release"
    assert data["active_release_id"] is None
    assert data["graph_status"] == "missing"
    assert data["status"] == "empty"


@pytest.mark.anyio
async def test_kb_status_returns_missing_for_unknown_kb(seeded_now: datetime) -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post("/mcp/kb_status", json={"kb_id": "kb_unknown"})

    assert response.status_code == 200
    data = response.json()
    assert data["kb_id"] == "kb_unknown"
    assert data["status"] == "missing"
    assert data["active_release_id"] is None
    assert data["graph_status"] == "missing"


@pytest.mark.anyio
async def test_kb_list_returns_all_seeded_items(seeded_now: datetime) -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post("/mcp/kb_list", json={})

    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 3
    ids = {item["kb_id"] for item in data["items"]}
    assert ids == {"kb_checkout_core", "kb_no_release", "kb_other_project"}
    checkout = next(item for item in data["items"] if item["kb_id"] == "kb_checkout_core")
    assert checkout["name"] == "Checkout Core"
    assert checkout["project_id"] == "proj_checkout"
    assert checkout["status"] == "ready"
    assert checkout["active_release_id"] == "rel_2026_05_19_001"
    assert checkout["updated_at"] == seeded_now.replace(tzinfo=None).isoformat()


@pytest.mark.anyio
async def test_kb_list_filters_by_project_id(seeded_now: datetime) -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post("/mcp/kb_list", json={"project_id": "proj_other"})

    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["kb_id"] == "kb_other_project"


@pytest.mark.anyio
async def test_kb_query_returns_real_answer(seeded_now: datetime) -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/mcp/kb_query",
            json={"kb_id": "kb_checkout_core", "question": "What is checkout_service?"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["kb_id"] == "kb_checkout_core"
    assert data["release_id"] == "rel_2026_05_19_001"
    assert "answer" in data
    assert "source_locations" in data
    assert "artifact_refs" in data


@pytest.mark.anyio
async def test_kb_query_returns_error_when_no_active_release(seeded_now: datetime) -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/mcp/kb_query",
            json={"kb_id": "kb_no_release", "question": "ping"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["release_id"] is None
    assert data.get("error_code") == "knowledge_base_not_ready"
