import pytest
from datetime import UTC, datetime
from httpx import ASGITransport, AsyncClient

from app.db.base import SessionLocal, engine
from app.db.models.binding import KnowledgeBaseSourceBinding as BindingModel
from app.db.models.knowledge_base import KnowledgeBase as KnowledgeBaseModel
from app.db.models.project import Project as ProjectModel
from app.db.models.source import Source as SourceModel
from app.main import app


@pytest.fixture(autouse=True)
def create_tables() -> None:
    ProjectModel.__table__.create(bind=engine, checkfirst=True)
    SourceModel.__table__.create(bind=engine, checkfirst=True)
    KnowledgeBaseModel.__table__.create(bind=engine, checkfirst=True)
    BindingModel.__table__.create(bind=engine, checkfirst=True)
    yield
    BindingModel.__table__.drop(bind=engine, checkfirst=True)
    KnowledgeBaseModel.__table__.drop(bind=engine, checkfirst=True)
    SourceModel.__table__.drop(bind=engine, checkfirst=True)
    ProjectModel.__table__.drop(bind=engine, checkfirst=True)


@pytest.fixture
def seeded_data() -> None:
    with SessionLocal() as session:
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
        session.add(project)
        session.add(source)
        session.add(knowledge_base)
        session.commit()


@pytest.mark.anyio
async def test_create_binding_returns_payload(seeded_data: None) -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
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
    assert response.json()["knowledge_base_id"] == "kb_checkout_core"
