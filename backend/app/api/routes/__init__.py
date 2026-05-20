from fastapi import APIRouter

from app.api.routes.build_jobs import router as build_jobs_router
from app.api.routes.knowledge_bases import router as knowledge_bases_router
from app.api.routes.projects import router as projects_router
from app.api.routes.sources import router as sources_router

router = APIRouter()


@router.get("/healthz")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


router.include_router(projects_router)
router.include_router(sources_router)
router.include_router(knowledge_bases_router)
router.include_router(build_jobs_router)
