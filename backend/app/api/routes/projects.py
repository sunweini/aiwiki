from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_async_session
from app.schemas.common import PageResponse
from app.schemas.project import ProjectCreate, ProjectRead
from app.services.knowledge_base_service import ProjectService

router = APIRouter(prefix="/api")


@router.post("/projects", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(payload: ProjectCreate, session: AsyncSession = Depends(get_async_session)) -> ProjectRead:
    project = await ProjectService(session).create_project(payload)
    return ProjectRead.model_validate(project, from_attributes=True)


@router.get("/projects", response_model=PageResponse[ProjectRead])
async def list_projects(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
) -> PageResponse[ProjectRead]:
    items, total = await ProjectService(session).list_projects(page=page, page_size=page_size)
    return PageResponse[ProjectRead](
        items=[ProjectRead.model_validate(item, from_attributes=True) for item in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get("/projects/{project_id}", response_model=ProjectRead)
async def get_project(project_id: str, session: AsyncSession = Depends(get_async_session)) -> ProjectRead:
    project = await ProjectService(session).get_project(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectRead.model_validate(project, from_attributes=True)


@router.put("/projects/{project_id}", response_model=ProjectRead)
async def update_project(project_id: str, payload: ProjectCreate, session: AsyncSession = Depends(get_async_session)) -> ProjectRead:
    try:
        project = await ProjectService(session).update_project(project_id, name=payload.name)
    except ValueError:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectRead.model_validate(project, from_attributes=True)


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str, session: AsyncSession = Depends(get_async_session)):
    try:
        await ProjectService(session).delete_project(project_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Project not found")
