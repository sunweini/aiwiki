from datetime import UTC, datetime
from unittest.mock import ANY, Mock

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.models.binding import KnowledgeBaseSourceBinding as BindingModel
from app.db.models.build_job import BuildJob as BuildJobModel
from app.db.models.knowledge_base import KnowledgeBase as KnowledgeBaseModel
from app.db.models.project import Project as ProjectModel
from app.db.models.source import Source as SourceModel
from app.repositories.build_jobs import BuildJobRepository
from app.schemas.build_job import BuildJobCreate
from app.services.build_service import BuildService


def test_enqueue_build_calls_runner_once() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)

    with Session(engine) as session:
        runner = Mock()
        runner.run.return_value = {
            "job_id": "job_1",
            "kb_id": "kb_1",
            "stages": [],
            "sources": [{"id": "src_1"}],
            "graph_ready": True,
            "release": None,
            "artifacts": [],
            "stats": {},
        }
        service = BuildService(session_factory=lambda: session, runner=runner)

        service._sync_run_and_persist(
            "job_1", "kb_1", [{"id": "src_1"}], {}, "proj_default"
        )

        runner.run.assert_called_once_with(
            job_id="job_1",
            kb_id="kb_1",
            sources=[{"id": "src_1"}],
            llm_config={},
            progress_callback=ANY,
            project_id="proj_default",
        )


def test_create_build_job_persists_and_returns_sources() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)

    with Session(engine) as session:
        now = datetime.now(UTC)
        session.add(ProjectModel(id="proj_1", name="Project 1", description=None))
        session.add(
            SourceModel(
                id="src_1",
                project_id="proj_1",
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
        )
        session.add(
            KnowledgeBaseModel(
                id="kb_1",
                project_id="proj_1",
                name="KB 1",
                status="ready",
                visibility="org_shared",
                active_release_id=None,
                created_at=now,
                updated_at=now,
            )
        )
        session.add(
            BindingModel(
                id="bind_1",
                knowledge_base_id="kb_1",
                source_id="src_1",
                binding_status="active",
                scope_override={},
                include_rules_override=[],
                exclude_rules_override=[],
                priority=100,
            )
        )
        session.commit()

        service = BuildService(session_factory=lambda: session)
        payload = BuildJobCreate(build_type="full_build", triggered_by="system", reason=None)

        job, sources, project_id = service.create_build_job("kb_1", payload)

        # Verify the session was closed by create_build_job; re-open
        session2 = Session(engine)
        persisted = session2.get(BuildJobModel, job.id)
        assert persisted is not None
        assert persisted.knowledge_base_id == "kb_1"
        assert persisted.build_type == "full_build"
        assert persisted.status == "pending"
        assert persisted.created_at == job.created_at
        assert persisted.started_at == job.started_at
        assert sources == [
            {
                "id": "src_1",
                "name": "checkout-service",
                "type": "github_repo",
                "source_ref": "acme/checkout-service",
            }
        ]
        assert BuildJobRepository(session2).list_by_kb("kb_1")[0].id == job.id
        assert project_id == "proj_1"
        session2.close()
