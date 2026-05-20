from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.api.routes import router
from app.config import settings
from app.db.database import AsyncSessionLocal, engine
from app.db.base import Base
from app.mcp.routes import router as mcp_router

app = FastAPI(title=settings.app_name)
app.include_router(router)
app.include_router(mcp_router)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

data_path = Path(settings.data_root)
app.mount("/data", StaticFiles(directory=str(data_path)), name="artifacts")


@app.on_event("startup")
async def startup_create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.on_event("startup")
async def startup_git_poll():
    import asyncio
    asyncio.create_task(_git_poll_loop())


async def _git_poll_loop():
    import asyncio
    from app.config import settings
    from app.db.database import AsyncSessionLocal
    from app.repositories.sources import SourceRepository
    from app.runner.source_materializer import SourceMaterializer
    from app.runner.workspace import WorkspaceManager
    from pathlib import Path

    wm = WorkspaceManager(Path(settings.data_root))

    while True:
        await asyncio.sleep(60)
        async with AsyncSessionLocal() as session:
            try:
                repo = SourceRepository(session)
                sources = await repo.list_all_polling()
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
