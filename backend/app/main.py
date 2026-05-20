from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.api.routes import router
from app.config import settings
from app.db.base import Base, engine
from app.mcp.routes import router as mcp_router

app = FastAPI(title=settings.app_name)
app.include_router(router)
app.include_router(mcp_router)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Serve data/ at project root
data_path = Path(settings.data_root)
app.mount("/data", StaticFiles(directory=str(data_path)), name="artifacts")


@app.on_event("startup")
def startup_create_tables():
    Base.metadata.create_all(bind=engine)


@app.on_event("startup")
async def startup_git_poll():
    """Start background git polling for sources with git_poll_interval_minutes > 0."""
    import asyncio
    asyncio.create_task(_git_poll_loop())


async def _git_poll_loop():
    """Background loop that polls git sources for changes."""
    import asyncio
    from app.config import settings
    from app.db.base import SessionLocal
    from app.repositories.sources import SourceRepository
    from app.runner.source_materializer import SourceMaterializer
    from app.runner.workspace import WorkspaceManager
    from pathlib import Path

    wm = WorkspaceManager(Path(settings.data_root))

    while True:
        await asyncio.sleep(60)
        session = SessionLocal()
        try:
            repo = SourceRepository(session)
            sources = repo.list_all_polling()
            for src in sources:
                mat = SourceMaterializer(src.project_id, wm.project_root(src.project_id))
                if mat.check_for_updates({
                    "id": src.id, "type": src.type, "source_ref": src.source_ref,
                    "git_tracking_branch": src.git_tracking_branch,
                }):
                    mat.pull_updates({
                        "id": src.id, "type": src.type, "source_ref": src.source_ref,
                        "git_tracking_branch": src.git_tracking_branch,
                    })
        except Exception:
            pass
        finally:
            session.close()
