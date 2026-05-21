from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse, HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_async_session
from app.schemas.binding import BindingCreate, BindingRead
from app.schemas.common import PageResponse
from app.schemas.knowledge_base import KnowledgeBaseCreate, KnowledgeBaseRead
from app.schemas.release import ArtifactRead, ArtifactsResponse, ReleaseRead
from app.services.artifact_service import ArtifactService
from app.services.knowledge_base_service import KnowledgeBaseService

router = APIRouter(prefix="/api")


@router.post("/projects/{project_id}/knowledge-bases", response_model=KnowledgeBaseRead, status_code=status.HTTP_201_CREATED)
async def create_knowledge_base(
    project_id: str,
    payload: KnowledgeBaseCreate,
    session: AsyncSession = Depends(get_async_session),
) -> KnowledgeBaseRead:
    knowledge_base = await KnowledgeBaseService(session).create_knowledge_base(project_id=project_id, payload=payload)
    return KnowledgeBaseRead.model_validate(knowledge_base, from_attributes=True)


@router.post("/knowledge-bases/{kb_id}/bindings", response_model=BindingRead, status_code=status.HTTP_201_CREATED)
async def create_binding(
    kb_id: str,
    payload: BindingCreate,
    session: AsyncSession = Depends(get_async_session),
) -> BindingRead:
    binding = await KnowledgeBaseService(session).create_binding(kb_id=kb_id, payload=payload)
    return BindingRead.model_validate(binding, from_attributes=True)


@router.get("/knowledge-bases/{kb_id}", response_model=KnowledgeBaseRead)
async def get_knowledge_base(
    kb_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> KnowledgeBaseRead:
    knowledge_base = await KnowledgeBaseService(session).get_knowledge_base(kb_id)
    return KnowledgeBaseRead.model_validate(knowledge_base, from_attributes=True)


@router.get("/projects/{project_id}/knowledge-bases", response_model=PageResponse[KnowledgeBaseRead])
async def list_knowledge_bases(
    project_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
) -> PageResponse[KnowledgeBaseRead]:
    items, total = await KnowledgeBaseService(session).list_knowledge_bases(project_id, page=page, page_size=page_size)
    return PageResponse[KnowledgeBaseRead](
        items=[KnowledgeBaseRead.model_validate(item, from_attributes=True) for item in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.put("/knowledge-bases/{kb_id}", response_model=KnowledgeBaseRead)
async def update_knowledge_base(
    kb_id: str,
    payload: KnowledgeBaseCreate,
    session: AsyncSession = Depends(get_async_session),
) -> KnowledgeBaseRead:
    try:
        kb = await KnowledgeBaseService(session).update_knowledge_base(kb_id, name=payload.name)
    except ValueError:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    return KnowledgeBaseRead.model_validate(kb, from_attributes=True)


@router.delete("/knowledge-bases/{kb_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_knowledge_base(kb_id: str, session: AsyncSession = Depends(get_async_session)):
    try:
        await KnowledgeBaseService(session).delete_knowledge_base(kb_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Knowledge base not found")


@router.get("/knowledge-bases/{kb_id}/releases", response_model=PageResponse[ReleaseRead])
async def list_releases(
    kb_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
) -> PageResponse[ReleaseRead]:
    items, total = await ArtifactService(session).list_releases(kb_id=kb_id, page=page, page_size=page_size)
    return PageResponse[ReleaseRead](
        items=[
            ReleaseRead(
                id=item.id,
                knowledge_base_id=item.knowledge_base_id,
                build_job_id=item.build_job_id,
                version=item.version,
                status=item.status,
                artifact_status=item.artifact_status,
                created_at=item.created_at,
            )
            for item in items
        ],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get("/knowledge-bases/{kb_id}/artifacts", response_model=ArtifactsResponse)
async def get_artifacts(
    kb_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> ArtifactsResponse:
    artifacts = await ArtifactService(session).get_artifacts_for_kb(kb_id)
    return ArtifactsResponse(
        kb_id=artifacts["kb_id"],
        release_id=artifacts["release_id"],
        artifacts=[ArtifactRead.model_validate(item, from_attributes=True) for item in artifacts["artifacts"]],
    )


@router.get("/knowledge-bases/{kb_id}/artifacts/{artifact_type}/view")
async def view_artifact(
    kb_id: str,
    artifact_type: str,
    session: AsyncSession = Depends(get_async_session),
):
    """Serve artifact file content for viewing (HTML, SVG, image, text, etc.)."""
    svc = ArtifactService(session)
    artifact = await svc.get_artifact_by_type(kb_id, artifact_type)
    path = svc.resolve_artifact_path(artifact)

    media_map = {
        "html": "text/html; charset=utf-8",
        "svg": "image/svg+xml",
        "graph": "application/json",
        "graphml": "application/xml",
        "report": "text/markdown; charset=utf-8",
        "logs": "text/plain; charset=utf-8",
    }
    media_type = media_map.get(artifact_type, "application/octet-stream")

    # HTML: return as inline HTMLResponse so browser renders it in iframe
    if artifact_type in ("html",):
        return HTMLResponse(content=path.read_text(encoding="utf-8"), media_type=media_type)
    if artifact_type in ("graph", "graphml"):
        return HTMLResponse(content=path.read_text(encoding="utf-8"), media_type=media_type)

    return FileResponse(str(path), media_type=media_type)
