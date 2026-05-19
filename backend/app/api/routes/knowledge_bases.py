from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.base import SessionLocal
from app.schemas.binding import BindingCreate, BindingRead
from app.schemas.common import PageResponse
from app.schemas.knowledge_base import KnowledgeBaseCreate, KnowledgeBaseRead
from app.schemas.release import ArtifactRead, ArtifactsResponse, ReleaseRead
from app.services.artifact_service import ArtifactService
from app.services.knowledge_base_service import KnowledgeBaseService

router = APIRouter(prefix="/api")


def get_session() -> Session:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@router.post("/projects/{project_id}/knowledge-bases", response_model=KnowledgeBaseRead, status_code=status.HTTP_201_CREATED)
def create_knowledge_base(
    project_id: str,
    payload: KnowledgeBaseCreate,
    session: Session = Depends(get_session),
) -> KnowledgeBaseRead:
    knowledge_base = KnowledgeBaseService(session).create_knowledge_base(project_id=project_id, payload=payload)
    return KnowledgeBaseRead.model_validate(knowledge_base, from_attributes=True)


@router.post("/knowledge-bases/{kb_id}/bindings", response_model=BindingRead, status_code=status.HTTP_201_CREATED)
def create_binding(
    kb_id: str,
    payload: BindingCreate,
    session: Session = Depends(get_session),
) -> BindingRead:
    binding = KnowledgeBaseService(session).create_binding(kb_id=kb_id, payload=payload)
    return BindingRead.model_validate(binding, from_attributes=True)


@router.get("/knowledge-bases/{kb_id}", response_model=KnowledgeBaseRead)
def get_knowledge_base(
    kb_id: str,
    session: Session = Depends(get_session),
) -> KnowledgeBaseRead:
    knowledge_base = KnowledgeBaseService(session).get_knowledge_base(kb_id)
    return KnowledgeBaseRead.model_validate(knowledge_base, from_attributes=True)


@router.get("/projects/{project_id}/knowledge-bases", response_model=PageResponse[KnowledgeBaseRead])
def list_knowledge_bases(
    project_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: Session = Depends(get_session),
) -> PageResponse[KnowledgeBaseRead]:
    items, total = KnowledgeBaseService(session).list_knowledge_bases(project_id, page=page, page_size=page_size)
    return PageResponse[KnowledgeBaseRead](
        items=[KnowledgeBaseRead.model_validate(item, from_attributes=True) for item in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get("/knowledge-bases/{kb_id}/releases", response_model=PageResponse[ReleaseRead])
def list_releases(
    kb_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: Session = Depends(get_session),
) -> PageResponse[ReleaseRead]:
    items, total = ArtifactService(session).list_releases(kb_id=kb_id, page=page, page_size=page_size)
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
def get_artifacts(
    kb_id: str,
    session: Session = Depends(get_session),
) -> ArtifactsResponse:
    artifacts = ArtifactService(session).get_artifacts_for_kb(kb_id)
    return ArtifactsResponse(
        kb_id=artifacts["kb_id"],
        release_id=artifacts["release_id"],
        artifacts=[ArtifactRead.model_validate(item, from_attributes=True) for item in artifacts["artifacts"]],
    )
