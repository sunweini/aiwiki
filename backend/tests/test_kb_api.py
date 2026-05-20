import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_create_knowledge_base_returns_payload() -> None:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Create project first via API
        project_response = await client.post(
            "/api/projects",
            json={"name": "Delivery Alpha"},
        )
        assert project_response.status_code == 201
        project_id = project_response.json()["id"]

        response = await client.post(
            f"/api/projects/{project_id}/knowledge-bases",
            json={
                "name": "Checkout Core Knowledge Base",
                "visibility": "org_shared",
                "description": "Knowledge base for checkout domain code and docs.",
                "release_policy": {"activation_mode": "auto_activate"},
            },
        )

    assert response.status_code == 201
    assert response.json()["name"] == "Checkout Core Knowledge Base"
    assert response.json()["project_id"] == project_id
