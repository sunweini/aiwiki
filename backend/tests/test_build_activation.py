from app.services.build_service import BuildService


def test_can_activate_release_requires_ready_graph() -> None:
    service = BuildService()

    release = {
        "id": "rel_1",
        "artifact_status": {"graph": "missing", "vault": "ready"},
    }

    assert service.can_activate_release(release) is False


def test_can_activate_release_when_graph_is_ready() -> None:
    service = BuildService()

    release = {
        "id": "rel_2",
        "artifact_status": {"graph": "ready", "vault": "ready"},
    }

    assert service.can_activate_release(release) is True


def test_can_activate_release_without_artifact_status() -> None:
    service = BuildService()

    release = {"id": "rel_3"}

    assert service.can_activate_release(release) is False
