from fastapi import FastAPI

from app.api.routes import router
from app.config import settings
from app.mcp.routes import router as mcp_router

app = FastAPI(title=settings.app_name)
app.include_router(router)
app.include_router(mcp_router)
