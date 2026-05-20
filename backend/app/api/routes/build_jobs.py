import asyncio
import logging
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.database import AsyncSessionLocal, get_async_session
from app.repositories.build_jobs import BuildJobRepository
from app.runner.graphify_runner import GraphifyRunner
from app.runner.workspace import WorkspaceManager
from app.schemas.build_job import BuildJobCreate, BuildJobRead
from app.schemas.common import PageResponse
from app.services.build_service import BuildService

router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)


def _log_task_exception(task: asyncio.Task) -> None:
    try:
        task.result()
    except Exception:
        logger.exception("Background build task failed")


def _make_runner() -> GraphifyRunner:
    data_root = Path(settings.data_root)
    data_root.mkdir(parents=True, exist_ok=True)
    return GraphifyRunner(WorkspaceManager(data_root))


@router.post("/knowledge-bases/{kb_id}/builds", response_model=BuildJobRead, status_code=status.HTTP_202_ACCEPTED)
async def create_build_job(
    kb_id: str,
    payload: BuildJobCreate,
    session: AsyncSession = Depends(get_async_session),
) -> BuildJobRead:
    runner = _make_runner()
    service = BuildService(session_factory=AsyncSessionLocal, runner=runner)

    job, sources, project_id = await service.create_build_job(kb_id, payload)
    llm_config = await service._read_llm_config(kb_id)

    task = asyncio.create_task(service.enqueue_build(
        job.id, kb_id, sources, llm_config=llm_config, project_id=project_id
    ))
    task.add_done_callback(_log_task_exception)

    return BuildJobRead(
        job_id=job.id,
        knowledge_base_id=job.knowledge_base_id,
        build_type=job.build_type,
        triggered_by=payload.triggered_by,
        reason=payload.reason,
        status=job.status,
        release_id=None,
        current_stage=job.current_stage,
        started_at=job.started_at.isoformat(),
        finished_at=None,
        error_summary=None,
        stages=job.stages,
    )


@router.get("/knowledge-bases/{kb_id}/builds", response_model=PageResponse[BuildJobRead])
async def list_build_jobs(
    kb_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
) -> PageResponse[BuildJobRead]:
    repo = BuildJobRepository(session)
    items, total = await repo.list_by_kb_paginated(kb_id=kb_id, page=page, page_size=page_size)
    return PageResponse[BuildJobRead](
        items=[
            BuildJobRead(
                job_id=item.id,
                knowledge_base_id=item.knowledge_base_id,
                build_type=item.build_type,
                triggered_by="manual",
                reason=None,
                status=item.status,
                release_id=item.release_id,
                current_stage=item.current_stage,
                started_at=item.started_at.isoformat(),
                finished_at=item.finished_at.isoformat() if item.finished_at else None,
                error_summary=item.error_summary,
            )
            for item in items
        ],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get("/build-jobs/{job_id}", response_model=BuildJobRead)
async def get_build_job(
    job_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> BuildJobRead:
    repo = BuildJobRepository(session)
    job = await repo.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Build job not found")
    return BuildJobRead(
        job_id=job.id,
        knowledge_base_id=job.knowledge_base_id,
        build_type=job.build_type,
        triggered_by="manual",
        reason=None,
        status=job.status,
        release_id=job.release_id,
        current_stage=job.current_stage,
        started_at=job.started_at.isoformat(),
        finished_at=job.finished_at.isoformat() if job.finished_at else None,
        error_summary=job.error_summary,
        stages=job.stages,
    )
