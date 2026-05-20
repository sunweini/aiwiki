from datetime import UTC, datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.models.artifact_version import ArtifactVersion
from app.db.models.build_job import BuildJob
from app.db.models.knowledge_base import KnowledgeBase
from app.db.models.project import Project
from app.db.models.release import Release
from app.services.build_service import BuildService


def test_read_llm_config_returns_config_dict() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)

    with Session(engine) as session:
        now = datetime.now(UTC)
        session.add(Project(id="proj_1", name="P1", description=None))
        session.add(
            KnowledgeBase(
                id="kb_1", project_id="proj_1", name="KB1",
                status="ready", visibility="org_shared",
                active_release_id=None,
                llm_backend="deepseek",
                llm_api_key_ref="env:DEEPSEEK_API_KEY",
                llm_model_override="deepseek-v4-flash",
                llm_extraction_budget=30000,
                llm_base_url_override="https://api.deepseek.com/v1",
                created_at=now, updated_at=now,
            )
        )
        session.commit()

        service = BuildService(session_factory=lambda: session)
        config = service._read_llm_config("kb_1")

    assert config == {
        "llm_backend": "deepseek",
        "llm_api_key_ref": "env:DEEPSEEK_API_KEY",
        "llm_model_override": "deepseek-v4-flash",
        "llm_extraction_budget": 30000,
        "llm_base_url_override": "https://api.deepseek.com/v1",
    }


def test_read_llm_config_returns_empty_when_kb_not_found() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)

    with Session(engine) as session:
        service = BuildService(session_factory=lambda: session)
        config = service._read_llm_config("nonexistent_kb")

    assert config == {}


def test_persist_result_creates_release_and_artifacts() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)

    with Session(engine) as session:
        now = datetime.now(UTC)
        session.add(Project(id="proj_1", name="P1", description=None))
        session.add(
            BuildJob(
                id="job_test_1", knowledge_base_id="kb_1",
                build_type="full_rebuild", status="pending",
                release_id=None, error_summary=None,
                created_at=now, started_at=now,
            )
        )
        session.add(
            KnowledgeBase(
                id="kb_1", project_id="proj_1", name="KB1",
                status="ready", visibility="org_shared",
                active_release_id=None,
                created_at=now, updated_at=now,
            )
        )
        session.commit()

        now_ts = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")
        release_dict = {
            "id": "rel_test_1",
            "knowledge_base_id": "kb_1",
            "build_job_id": "job_test_1",
            "version": now_ts,
            "status": "draft",
            "artifact_status": {"graph": "ready", "report": "ready"},
            "created_at": now,
        }
        artifacts = [
            {
                "id": "art_rel_test_1_graph",
                "release_id": "rel_test_1",
                "artifact_type": "graph",
                "artifact_status": "ready",
                "artifact_path": "/tmp/graph.json",
                "artifact_meta": {},
            },
            {
                "id": "art_rel_test_1_report",
                "release_id": "rel_test_1",
                "artifact_type": "report",
                "artifact_status": "ready",
                "artifact_path": "/tmp/GRAPH_REPORT.md",
                "artifact_meta": {},
            },
        ]
        result = {
            "release": release_dict,
            "artifacts": artifacts,
            "graph_ready": True,
            "stages": [{"name": "extract", "status": "completed"}],
        }

        # _persist_result opens and closes its own session; give it a fresh one
        service = BuildService(session_factory=lambda: Session(engine))
        service._persist_result("job_test_1", "kb_1", result, "proj_1")

    # Verify results in a fresh session
    with Session(engine) as verify_session:
        build_job = verify_session.get(BuildJob, "job_test_1")
        assert build_job.status == "completed"
        assert build_job.release_id == "rel_test_1"
        assert build_job.finished_at is not None

        release = verify_session.get(Release, "rel_test_1")
        assert release is not None
        assert release.knowledge_base_id == "kb_1"
        assert release.version == now_ts

        art_graph = verify_session.get(ArtifactVersion, "art_rel_test_1_graph")
        assert art_graph is not None
        assert art_graph.artifact_type == "graph"
        art_report = verify_session.get(ArtifactVersion, "art_rel_test_1_report")
        assert art_report is not None
        assert art_report.artifact_type == "report"

        kb = verify_session.get(KnowledgeBase, "kb_1")
        assert kb.active_release_id == "rel_test_1"


def test_persist_result_marks_build_failed_on_stage_failure() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)

    with Session(engine) as session:
        now = datetime.now(UTC)
        session.add(Project(id="proj_1", name="P1", description=None))
        session.add(
            BuildJob(
                id="job_fail_1", knowledge_base_id="kb_1",
                build_type="full_rebuild", status="pending",
                release_id=None, error_summary=None,
                created_at=now, started_at=now,
            )
        )
        session.commit()

        result = {
            "release": None,
            "artifacts": [],
            "graph_ready": False,
            "stages": [
                {"name": "extract", "status": "completed"},
                {"name": "build", "status": "failed", "error": "graphify module not available"},
                {"name": "validate", "status": "degraded", "error": "edge refs"},
            ],
        }

        service = BuildService(session_factory=lambda: Session(engine))
        service._persist_result("job_fail_1", "kb_1", result, "proj_1")

    with Session(engine) as verify_session:
        build_job = verify_session.get(BuildJob, "job_fail_1")
        assert build_job.status == "failed"
        assert build_job.finished_at is not None
