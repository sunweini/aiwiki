from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_async_session
from app.schemas.common import PageResponse
from app.schemas.source import SourceCreate, SourceRead
from app.services.source_service import SourceService

router = APIRouter(prefix="/api")


@router.post("/projects/{project_id}/sources", response_model=SourceRead, status_code=status.HTTP_201_CREATED)
async def create_source(project_id: str, payload: SourceCreate, session: AsyncSession = Depends(get_async_session)) -> SourceRead:
    source = await SourceService(session).create_source(project_id=project_id, payload=payload)
    return SourceRead.model_validate(source, from_attributes=True)


@router.get("/projects/{project_id}/sources", response_model=PageResponse[SourceRead])
async def list_sources(
    project_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
) -> PageResponse[SourceRead]:
    items, total = await SourceService(session).list_sources(project_id=project_id, page=page, page_size=page_size)
    return PageResponse[SourceRead](
        items=[SourceRead.model_validate(item, from_attributes=True) for item in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.put("/sources/{source_id}", response_model=SourceRead)
async def update_source(source_id: str, payload: SourceCreate, session: AsyncSession = Depends(get_async_session)) -> SourceRead:
    try:
        source = await SourceService(session).update_source(source_id, name=payload.name)
    except ValueError:
        raise HTTPException(status_code=404, detail="Source not found")
    return SourceRead.model_validate(source, from_attributes=True)


@router.delete("/sources/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_source(source_id: str, session: AsyncSession = Depends(get_async_session)):
    try:
        await SourceService(session).delete_source(source_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Source not found")
