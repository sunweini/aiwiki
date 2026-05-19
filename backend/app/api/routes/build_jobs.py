from pathlib import Path

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.config import settings
from app.db.base import SessionLocal
from app.repositories.build_jobs import BuildJobRepository
from app.runner.graphify_runner import GraphifyRunner
from app.runner.workspace import WorkspaceManager
from app.schemas.build_job import BuildJobCreate, BuildJobRead
from app.schemas.common import PageResponse
from app.services.build_service import BuildService

router = APIRouter(prefix="/api")


def get_session() -> Session:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def _make_runner() -> GraphifyRunner:
    workspace_root = Path(settings.workspace_root)
    workspace_root.mkdir(parents=True, exist_ok=True)
    return GraphifyRunner(WorkspaceManager(workspace_root))


@router.post("/knowledge-bases/{kb_id}/builds", response_model=BuildJobRead, status_code=status.HTTP_201_CREATED)
def create_build_job(
    kb_id: str,
    payload: BuildJobCreate,
    session: Session = Depends(get_session),
) -> BuildJobRead:
    service = BuildService(session=session, runner=_make_runner())
    job, sources = service.create_build_job(kb_id, payload)
    service.enqueue_build(
        {
            "job_id": job.id,
            "knowledge_base_id": job.knowledge_base_id,
            "sources": sources,
        }
    )
    # Re-fetch to capture persisted status/release_id/finished_at from runner
    repo = BuildJobRepository(session)
    updated_job = repo.get(job.id)
    if updated_job is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Build job lost after creation")

    return BuildJobRead(
        job_id=updated_job.id,
        knowledge_base_id=updated_job.knowledge_base_id,
        build_type=updated_job.build_type,
        triggered_by=payload.triggered_by,
        reason=payload.reason,
        status=updated_job.status,
        release_id=updated_job.release_id,
        started_at=updated_job.started_at.isoformat(),
        finished_at=updated_job.finished_at.isoformat() if updated_job.finished_at else None,
        error_summary=updated_job.error_summary,
    )


@router.get("/knowledge-bases/{kb_id}/builds", response_model=PageResponse[BuildJobRead])
def list_build_jobs(
    kb_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: Session = Depends(get_session),
) -> PageResponse[BuildJobRead]:
    repo = BuildJobRepository(session)
    items, total = repo.list_by_kb_paginated(kb_id=kb_id, page=page, page_size=page_size)
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
def get_build_job(
    job_id: str,
    session: Session = Depends(get_session),
) -> BuildJobRead:
    repo = BuildJobRepository(session)
    job = repo.get(job_id)
    if job is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Build job not found")
    return BuildJobRead(
        job_id=job.id,
        knowledge_base_id=job.knowledge_base_id,
        build_type=job.build_type,
        triggered_by="manual",
        reason=None,
        status=job.status,
        release_id=job.release_id,
        started_at=job.started_at.isoformat(),
        finished_at=job.finished_at.isoformat() if job.finished_at else None,
        error_summary=job.error_summary,
    )
