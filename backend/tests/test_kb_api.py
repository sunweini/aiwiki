import pytest
from httpx import ASGITransport, AsyncClient

from app.db.base import SessionLocal, engine
from app.db.models.project import Project as ProjectModel
from app.db.models.knowledge_base import KnowledgeBase as KnowledgeBaseModel
from app.main import app


@pytest.fixture(autouse=True)
def create_tables() -> None:
    ProjectModel.__table__.create(bind=engine, checkfirst=True)
    KnowledgeBaseModel.__table__.create(bind=engine, checkfirst=True)
    yield
    KnowledgeBaseModel.__table__.drop(bind=engine, checkfirst=True)
    ProjectModel.__table__.drop(bind=engine, checkfirst=True)


@pytest.fixture
def project() -> ProjectModel:
    with SessionLocal() as session:
        project = ProjectModel(id="proj_delivery_alpha", name="Delivery Alpha", description=None)
        session.add(project)
        session.commit()
        session.refresh(project)
        return project


@pytest.mark.anyio
async def test_create_knowledge_base_returns_payload(project: ProjectModel) -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
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
    assert response.json()["project_id"] == "proj_delivery_alpha"
