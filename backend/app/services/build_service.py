import asyncio
import logging
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from app.config import settings
from app.db.database import AsyncSessionLocal
from app.db.models.artifact_version import ArtifactVersion
from app.db.models.build_job import BuildJob
from app.db.models.release import Release
from app.repositories.build_jobs import BuildJobRepository
from app.repositories.knowledge_bases import KnowledgeBaseRepository
from app.runner.graphify_runner import GraphifyRunner
from app.runner.workspace import WorkspaceManager
from app.schemas.build_job import BuildJobCreate

logger = logging.getLogger(__name__)


class BuildService:
    def __init__(self, session_factory=None, runner: GraphifyRunner | None = None):
        self._session_factory = session_factory or AsyncSessionLocal
        self.runner = runner
        self.wm = WorkspaceManager(Path(settings.data_root))

    async def create_build_job(self, kb_id: str, payload: BuildJobCreate, project_id: str = "proj_default") -> tuple[BuildJob, list[dict], str]:
        async with self._session_factory() as session:
            repo = BuildJobRepository(session)
            kb_repo = KnowledgeBaseRepository(session)

            kb = await kb_repo.get(kb_id)
            project_id = kb.project_id if kb else project_id

            now = datetime.now(UTC)
            build_job = BuildJob(
                id=f"job_{uuid4().hex[:12]}",
                knowledge_base_id=kb_id,
                build_type=payload.build_type,
                status="pending",
                current_stage=None,
                release_id=None,
                error_summary=None,
                created_at=now,
                started_at=now,
            )
            build_job = await repo.create(build_job)
            sources = await repo.list_sources(kb_id)
            return build_job, sources, project_id

    async def enqueue_build(self, job_id: str, kb_id: str, sources: list[dict],
                            llm_config: dict | None = None, project_id: str = "proj_default") -> None:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(
            None,
            self._sync_run_and_persist,
            job_id, kb_id, sources, llm_config, project_id, loop,
        )

    def _sync_run_and_persist(self, job_id, kb_id, sources, llm_config, project_id, loop):
        """Runs in thread: sync graphify + bridge to async DB ops via run_coroutine_threadsafe."""
        def on_progress(stage_name: str, status: str, **meta):
            asyncio.run_coroutine_threadsafe(
                self._update_job_stage(job_id, stage_name, status, **meta), loop
            )

        if self.runner is None:
            return

        result = self.runner.run(
            job_id=job_id,
            kb_id=kb_id,
            sources=sources,
            llm_config=llm_config,
            progress_callback=on_progress,
            project_id=project_id,
        )

        try:
            f = asyncio.run_coroutine_threadsafe(
                self._persist_result(job_id, kb_id, result, project_id), loop
            )
            f.result(timeout=120)
        except Exception:
            logger.exception("Failed to persist build result for job %s", job_id)
            f = asyncio.run_coroutine_threadsafe(
                self._mark_job_failed(job_id, "Persistence error after runner completion"), loop
            )
            f.result(timeout=30)

    async def _update_job_stage(self, job_id: str, stage_name: str, status: str, **meta):
        async with self._session_factory() as session:
            repo = BuildJobRepository(session)
            job = await repo.get(job_id)
            if job is None:
                return
            job.current_stage = stage_name
            if job.stages is None:
                job.stages = []
            existing = next((s for s in job.stages if s.get("name") == stage_name), None)
            stage_entry = {"name": stage_name, "status": status, **meta}
            if existing:
                existing.update(stage_entry)
            else:
                job.stages.append(stage_entry)
            if status == "running" and job.status == "pending":
                job.status = "running"
            await repo.update(job)

    async def _persist_result(self, job_id: str, kb_id: str, result: dict, project_id: str):
        async with self._session_factory() as session:
            repo = BuildJobRepository(session)
            job = await repo.get(job_id)
            if job is None:
                return

            stages = result.get("stages", [])
            has_failure = any(s.get("status") == "failed" for s in stages)
            job.status = "failed" if has_failure else "completed"
            job.finished_at = datetime.now(UTC)
            job.stages = stages

            release_dict = result.get("release")
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
                session.add(release)
                job.release_id = release.id

                for a in result.get("artifacts", []):
                    session.add(ArtifactVersion(
                        id=a["id"],
                        release_id=a.get("release_id", release.id),
                        artifact_type=a["artifact_type"],
                        artifact_status=a.get("artifact_status", "ready"),
                        artifact_path=a.get("artifact_path", ""),
                        artifact_meta=a.get("artifact_meta", {}),
                    ))

                if result.get("graph_ready"):
                    kb_repo = KnowledgeBaseRepository(session)
                    kb = await kb_repo.get(kb_id)
                    if kb is not None:
                        kb.active_release_id = release.id
                        kb.updated_at = datetime.now(UTC)

            await session.commit()

    async def _mark_job_failed(self, job_id: str, error: str):
        async with self._session_factory() as session:
            repo = BuildJobRepository(session)
            job = await repo.get(job_id)
            if job:
                job.status = "failed"
                job.error_summary = error
                job.finished_at = datetime.now(UTC)
                await repo.update(job)

    async def _read_llm_config(self, kb_id: str) -> dict:
        async with self._session_factory() as session:
            kb_repo = KnowledgeBaseRepository(session)
            kb = await kb_repo.get(kb_id)
            if kb is None:
                return {}
            return {
                "llm_backend": kb.llm_backend,
                "llm_api_key_ref": kb.llm_api_key_ref,
                "llm_model_override": kb.llm_model_override,
                "llm_extraction_budget": kb.llm_extraction_budget,
                "llm_base_url_override": kb.llm_base_url_override,
            }

    def can_activate_release(self, release: dict) -> bool:
        return release.get("artifact_status", {}).get("graph") in ("ready", "degraded")
