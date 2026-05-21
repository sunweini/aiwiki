#!/usr/bin/env python3
"""MCP Server for AI Code Knowledge Archive.

Exposes knowledge-base query tools via the Model Context Protocol so
Claude Code can discover and call them natively in chat.

Transport modes:
- stdio (default): For local Claude Code integration via ~/.claude.json
- sse: For remote Claude Code instances over HTTP
"""

import asyncio
import sys
from pathlib import Path

# Ensure backend root is on PYTHONPATH
BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.db.database import AsyncSessionLocal
from app.services.mcp_gateway_service import MCPGatewayService


async def _session():
    async with AsyncSessionLocal() as s:
        yield s


# ------------------------------------------------------------------
# fastmcp server
# ------------------------------------------------------------------

from fastmcp import FastMCP

mcp = FastMCP("aiwiki")


@mcp.tool()
async def kb_status(kb_id: str) -> dict:
    """Check status of a knowledge base including active release and graph availability.

    Args:
        kb_id: Knowledge base ID (e.g. "kb_aac292691c03").
    """
    async for session in _session():
        return await MCPGatewayService(session).kb_status(kb_id)


@mcp.tool()
async def kb_list(project_id: str | None = None) -> dict:
    """List all knowledge bases, optionally filtered by project.

    Args:
        project_id: Filter by project ID (optional).
    """
    async for session in _session():
        return await MCPGatewayService(session).kb_list(project_id)


@mcp.tool()
async def kb_query(kb_id: str, question: str, mode: str = "bfs", budget: int = 2000) -> dict:
    """Query a knowledge graph with a natural-language question.

    Uses BFS traversal to find matching nodes and returns structured context.

    Args:
        kb_id: Knowledge base ID.
        question: Natural language question in Chinese or English.
        mode: Traversal mode "bfs" or "dfs" (default "bfs").
        budget: Token budget for response (default 2000).
    """
    async for session in _session():
        return await MCPGatewayService(session).kb_query(kb_id, question, mode=mode, budget=budget)


@mcp.tool()
async def kb_path(kb_id: str, source_label: str, target_label: str) -> dict:
    """Find shortest path between two nodes in the knowledge graph.

    Use kb_query first to discover exact node labels.

    Args:
        kb_id: Knowledge base ID.
        source_label: Source node label (substring match).
        target_label: Target node label (substring match).
    """
    async for session in _session():
        return await MCPGatewayService(session).kb_path(kb_id, source_label, target_label)


@mcp.tool()
async def kb_explain(kb_id: str, node_label: str, budget: int = 2000) -> dict:
    """Explain a specific node's context in the knowledge graph.

    Args:
        kb_id: Knowledge base ID.
        node_label: Node label to explain (substring match).
        budget: Token budget for response (default 2000).
    """
    async for session in _session():
        return await MCPGatewayService(session).kb_explain(kb_id, node_label, budget=budget)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="AI Code Knowledge Archive MCP Server")
    parser.add_argument(
        "--transport",
        choices=["stdio", "sse"],
        default="stdio",
        help="MCP transport mode (default: stdio)",
    )
    parser.add_argument("--host", default="0.0.0.0", help="SSE bind host (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8765, help="SSE bind port (default: 8765)")
    args = parser.parse_args()

    if args.transport == "sse":
        print(f"Starting MCP SSE server on {args.host}:{args.port}")
        asyncio.run(mcp.run_sse_async(host=args.host, port=args.port))
    else:
        mcp.run(transport="stdio")
