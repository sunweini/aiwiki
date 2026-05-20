from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_async_session
from app.services.mcp_gateway_service import MCPGatewayService

router = APIRouter(prefix="/mcp")


class KBStatusRequest(BaseModel):
    kb_id: str


class KBQueryRequest(BaseModel):
    kb_id: str
    question: str


class KBListRequest(BaseModel):
    project_id: str | None = None


class KBPathRequest(BaseModel):
    kb_id: str
    source_label: str
    target_label: str


class KBExplainRequest(BaseModel):
    kb_id: str
    node_label: str
    budget: int = 2000


@router.post("/kb_status")
async def kb_status(payload: KBStatusRequest, session: AsyncSession = Depends(get_async_session)) -> dict:
    return await MCPGatewayService(session).kb_status(payload.kb_id)


@router.post("/kb_list")
async def kb_list(payload: KBListRequest, session: AsyncSession = Depends(get_async_session)) -> dict:
    return await MCPGatewayService(session).kb_list(payload.project_id)


@router.post("/kb_query")
async def kb_query(payload: KBQueryRequest, session: AsyncSession = Depends(get_async_session)) -> dict:
    return await MCPGatewayService(session).kb_query(payload.kb_id, payload.question)


@router.post("/kb_path")
async def kb_path(payload: KBPathRequest, session: AsyncSession = Depends(get_async_session)) -> dict:
    return await MCPGatewayService(session).kb_path(payload.kb_id, payload.source_label, payload.target_label)


@router.post("/kb_explain")
async def kb_explain(payload: KBExplainRequest, session: AsyncSession = Depends(get_async_session)) -> dict:
    return await MCPGatewayService(session).kb_explain(payload.kb_id, payload.node_label, payload.budget)
