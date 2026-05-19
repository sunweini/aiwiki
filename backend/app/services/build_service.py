import logging
from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy.orm import Session

from app.db.models.build_job import BuildJob
from app.repositories.build_jobs import BuildJobRepository
from app.repositories.knowledge_bases import KnowledgeBaseRepository
from app.schemas.build_job import BuildJobCreate

logger = logging.getLogger(__name__)


class BuildService:
    def __init__(self, session: Session | None = None, runner=None):
        self._session = session
        self.runner = runner
        self.repository = BuildJobRepository(session) if session is not None else None
        self.kb_repo = KnowledgeBaseRepository(session) if session is not None else None

    def create_build_job(self, kb_id: str, payload: BuildJobCreate) -> tuple[BuildJob, list[dict[str, str]]]:
        if self.repository is None:
            raise ValueError("session is required to create build jobs")

        created_at = datetime.now(UTC)
        build_job = BuildJob(
            id=f"job_{uuid4().hex[:12]}",
            knowledge_base_id=kb_id,
            build_type=payload.build_type,
            status="pending",
            release_id=None,
            error_summary=None,
            created_at=created_at,
            started_at=created_at,
        )
        build_job = self.repository.create(build_job)
        return build_job, self.repository.list_sources(kb_id)

    def can_activate_release(self, release: dict) -> bool:
        return release.get("artifact_status", {}).get("graph") in ("ready", "degraded")

    def enqueue_build(self, job: dict) -> dict:
        if self.runner is None:
            return {
                "job_id": job["job_id"],
                "kb_id": job["knowledge_base_id"],
                "stages": [],
                "sources": job.get("sources", []),
            }

        kb_id = job["knowledge_base_id"]
        job_id = job["job_id"]
        llm_config = self._read_llm_config(kb_id)

        result = self.runner.run(
            job_id=job_id,
            kb_id=kb_id,
            sources=job.get("sources", []),
            llm_config=llm_config,
        )

        try:
            self._persist_result(job_id, kb_id, result)
        except Exception:
            logger.exception("Failed to persist build result for job %s", job_id)
            if self.repository is not None:
                build_job = self.repository.get(job_id)
                if build_job is not None:
                    build_job.status = "failed"
                    build_job.error_summary = "Persistence error after runner completion"
                    build_job.finished_at = datetime.now(UTC)
                    try:
                        self.repository.update(build_job)
                    except Exception:
                        logger.exception("Failed to mark job %s as failed after persistence error", job_id)

        return result

    # ------------------------------------------------------------------
    # internal
    # ------------------------------------------------------------------

    def _persist_result(self, job_id: str, kb_id: str, result: dict) -> None:
        from app.db.models.artifact_version import ArtifactVersion
        from app.db.models.release import Release
        from app.repositories.artifact_versions import ArtifactVersionRepository
        from app.repositories.releases import ReleaseRepository

        if self.repository is None or self._session is None:
            return

        release_dict = result.get("release")
        artifacts_list = result.get("artifacts", [])
        graph_ready = result.get("graph_ready", False)
        stages = result.get("stages", [])

        build_job = self.repository.get(job_id)
        if build_job is None:
            logger.error("Build job %s not found for persistence", job_id)
            return

        # Determine final status from stages
        has_failure = any(s.get("status") == "failed" for s in stages)
        if has_failure:
            build_job.status = "failed"
            failed_stage = next((s for s in stages if s.get("status") == "failed"), stages[-1])
            build_job.error_summary = failed_stage.get("error") or "Unknown error during build"
        else:
            build_job.status = "completed"

        build_job.finished_at = datetime.now(UTC)

        # Persist release + artifacts + update KB in a single transaction.
        # Use direct session operations instead of repository methods that
        # auto-commit, so all writes succeed or fail together.
        if release_dict is not None:
            created_at = release_dict.get("created_at", datetime.now(UTC))
            if isinstance(created_at, str):
                created_at = datetime.fromisoformat(created_at)
            release = Release(
                id=release_dict["id"],
                knowledge_base_id=release_dict.get("knowledge_base_id", kb_id),
                build_job_id=release_dict.get("build_job_id", job_id),
                version=release_dict.get("version", "unknown"),
                status=release_dict.get("status", "draft"),
                artifact_status=release_dict.get("artifact_status", {}),
                created_at=created_at,
            )
            self._session.add(release)
            build_job.release_id = release.id

            if artifacts_list:
                for a in artifacts_list:
                    self._session.add(ArtifactVersion(
                        id=a["id"],
                        release_id=a.get("release_id", release.id),
                        artifact_type=a["artifact_type"],
                        artifact_status=a.get("artifact_status", "ready"),
                        artifact_path=a.get("artifact_path", ""),
                        artifact_meta=a.get("artifact_meta", {}),
                    ))

            if graph_ready and self.kb_repo is not None:
                kb = self.kb_repo.get(kb_id)
                if kb is not None:
                    kb.active_release_id = release.id
                    kb.updated_at = datetime.now(UTC)

        self._session.commit()

    def _read_llm_config(self, kb_id: str) -> dict:
        if self.kb_repo is None:
            return {}
        kb = self.kb_repo.get(kb_id)
        if kb is None:
            return {}
        return {
            "llm_backend": kb.llm_backend,
            "llm_api_key_ref": kb.llm_api_key_ref,
            "llm_model_override": kb.llm_model_override,
            "llm_extraction_budget": kb.llm_extraction_budget,
            "llm_base_url_override": kb.llm_base_url_override,
        }
