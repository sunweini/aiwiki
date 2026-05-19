import pytest
from httpx import ASGITransport, AsyncClient

from app.db.base import SessionLocal, engine
from app.db.models import Project
from app.db.models.project import Project as ProjectModel
from app.db.models.source import Source as SourceModel
from app.main import app


@pytest.fixture(autouse=True)
def create_tables() -> None:
    ProjectModel.__table__.create(bind=engine, checkfirst=True)
    SourceModel.__table__.create(bind=engine, checkfirst=True)
    yield
    SourceModel.__table__.drop(bind=engine, checkfirst=True)
    ProjectModel.__table__.drop(bind=engine, checkfirst=True)


@pytest.fixture
def project() -> Project:
    with SessionLocal() as session:
        project = Project(id="proj_delivery_alpha", name="Delivery Alpha", description=None)
        session.add(project)
        session.commit()
        session.refresh(project)
        return project


@pytest.mark.anyio
async def test_create_source_returns_source_payload(project: Project) -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
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


@pytest.mark.anyio
async def test_list_sources_returns_page_payload(project: Project) -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        create_response = await client.post(
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
        response = await client.get("/api/projects/proj_delivery_alpha/sources")

    assert create_response.status_code == 201
    assert response.status_code == 200
    data = response.json()
    assert set(data.keys()) == {"items", "page", "page_size", "total"}
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == "checkout-service"
    assert data["items"][0]["source_ref"] == "acme/checkout-service"
    assert data["items"][0]["project_id"] == "proj_delivery_alpha"
