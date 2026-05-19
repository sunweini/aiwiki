from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.base import SessionLocal
from app.schemas.common import PageResponse
from app.schemas.source import SourceCreate, SourceRead
from app.services.source_service import SourceService

router = APIRouter(prefix="/api")


def get_session() -> Session:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@router.post("/projects/{project_id}/sources", response_model=SourceRead, status_code=status.HTTP_201_CREATED)
def create_source(project_id: str, payload: SourceCreate, session: Session = Depends(get_session)) -> SourceRead:
    source = SourceService(session).create_source(project_id=project_id, payload=payload)
    return SourceRead.model_validate(source, from_attributes=True)


@router.get("/projects/{project_id}/sources", response_model=PageResponse[SourceRead])
def list_sources(
    project_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: Session = Depends(get_session),
) -> PageResponse[SourceRead]:
    items, total = SourceService(session).list_sources(project_id=project_id, page=page, page_size=page_size)
    return PageResponse[SourceRead](
        items=[SourceRead.model_validate(item, from_attributes=True) for item in items],
        page=page,
        page_size=page_size,
        total=total,
    )
