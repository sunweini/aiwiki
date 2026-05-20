import logging
from pathlib import Path

import networkx as nx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.artifact_version import ArtifactVersion
from app.repositories.knowledge_bases import KnowledgeBaseRepository
from app.repositories.releases import ReleaseRepository
from app.services.graphify_query_adapter import GraphifyQueryAdapter

logger = logging.getLogger(__name__)

GRAPH_MAX_BYTES = 500 * 1024 * 1024  # 500 MB


class KBNotReadyError(Exception):
    pass


class GraphMissingError(Exception):
    pass


class MCPGatewayService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.knowledge_bases = KnowledgeBaseRepository(session)
        self.releases = ReleaseRepository(session)

    # ------------------------------------------------------------------
    # kb_status
    # ------------------------------------------------------------------

    async def kb_status(self, kb_id: str) -> dict:
        kb = await self.knowledge_bases.get(kb_id)
        if kb is None:
            return {
                "kb_id": kb_id,
                "status": "missing",
                "active_release_id": None,
                "graph_status": "missing",
            }

        active_release_id = kb.active_release_id
        if active_release_id is None:
            return {
                "kb_id": kb_id,
                "status": kb.status,
                "active_release_id": None,
                "graph_status": "missing",
            }

        release = await self.releases.get(active_release_id)
        artifact_status = release.artifact_status if release is not None else {}

        if not self._graphify_available():
            return {
                "kb_id": kb_id,
                "status": kb.status,
                "active_release_id": active_release_id,
                "graph_status": "graphify_unavailable",
                "artifact_status": artifact_status,
            }

        graph_status = artifact_status.get("graph", "missing")
        return {
            "kb_id": kb_id,
            "status": kb.status,
            "active_release_id": active_release_id,
            "graph_status": graph_status,
            "artifact_status": artifact_status,
        }

    # ------------------------------------------------------------------
    # kb_list
    # ------------------------------------------------------------------

    async def kb_list(self, project_id: str | None = None) -> dict:
        items = await self.knowledge_bases.list(project_id=project_id)
        return {
            "items": [
                {
                    "kb_id": item.id,
                    "name": item.name,
                    "project_id": item.project_id,
                    "status": item.status,
                    "active_release_id": item.active_release_id,
                    "updated_at": item.updated_at.isoformat() if item.updated_at is not None else None,
                }
                for item in items
            ]
        }

    # ------------------------------------------------------------------
    # kb_query
    # ------------------------------------------------------------------

    async def kb_query(self, kb_id: str, question: str, *, mode: str = "bfs", budget: int = 2000) -> dict:
        try:
            G = await self._load_graph(kb_id)
        except KBNotReadyError:
            return self._error(kb_id, "knowledge_base_not_ready", "KB has no active release", retryable=False)
        except GraphMissingError as exc:
            return self._error(kb_id, "active_graph_missing", str(exc), retryable=False)

        try:
            answer = GraphifyQueryAdapter.query(G, question, mode=mode, budget=budget)
        except Exception as exc:
            logger.exception("graph query failed")
            return self._error(kb_id, "graph_corrupted", str(exc), retryable=False)

        return {
            "kb_id": kb_id,
            "release_id": await self._active_release_id(kb_id),
            "answer": answer,
            "source_locations": [],
            "artifact_refs": await self._build_artifact_refs(kb_id),
        }

    # ------------------------------------------------------------------
    # kb_path
    # ------------------------------------------------------------------

    async def kb_path(self, kb_id: str, source_label: str, target_label: str) -> dict:
        try:
            G = await self._load_graph(kb_id)
        except KBNotReadyError:
            return self._error(kb_id, "knowledge_base_not_ready", "KB has no active release", retryable=False)
        except GraphMissingError as exc:
            return self._error(kb_id, "active_graph_missing", str(exc), retryable=False)

        try:
            result = GraphifyQueryAdapter.path(G, source_label, target_label)
        except ValueError as exc:
            return self._error(kb_id, "invalid_query_params", str(exc), retryable=False)
        except Exception as exc:
            logger.exception("graph path failed")
            return self._error(kb_id, "graph_corrupted", str(exc), retryable=False)

        return {
            "kb_id": kb_id,
            "release_id": await self._active_release_id(kb_id),
            **result,
        }

    # ------------------------------------------------------------------
    # kb_explain
    # ------------------------------------------------------------------

    async def kb_explain(self, kb_id: str, node_label: str, budget: int = 2000) -> dict:
        try:
            G = await self._load_graph(kb_id)
        except KBNotReadyError:
            return self._error(kb_id, "knowledge_base_not_ready", "KB has no active release", retryable=False)
        except GraphMissingError as exc:
            return self._error(kb_id, "active_graph_missing", str(exc), retryable=False)

        try:
            result = GraphifyQueryAdapter.explain(G, node_label, budget=budget)
        except ValueError as exc:
            return self._error(kb_id, "invalid_query_params", str(exc), retryable=False)
        except Exception as exc:
            logger.exception("graph explain failed")
            return self._error(kb_id, "graph_corrupted", str(exc), retryable=False)

        return {
            "kb_id": kb_id,
            "release_id": await self._active_release_id(kb_id),
            **result,
        }

    # ------------------------------------------------------------------
    # internal
    # ------------------------------------------------------------------

    async def _load_graph(self, kb_id: str) -> nx.Graph:
        kb = await self.knowledge_bases.get(kb_id)
        if kb is None:
            raise KBNotReadyError(f"KB {kb_id} not found")
        if not kb.active_release_id:
            raise KBNotReadyError(f"KB {kb_id} has no active release")

        release = await self.releases.get(kb.active_release_id)
        if release is None:
            raise KBNotReadyError(f"Active release {kb.active_release_id} not found")

        graph_path = await self._resolve_graph_path(release)
        if graph_path is None or not Path(graph_path).exists():
            raise GraphMissingError(f"No graph artifact for KB {kb_id}")

        path = Path(graph_path)
        if path.stat().st_size > GRAPH_MAX_BYTES:
            raise GraphMissingError(f"Graph file exceeds {GRAPH_MAX_BYTES // 1024 // 1024}MB limit")

        return GraphifyQueryAdapter.load_graph(str(path))

    async def _resolve_graph_path(self, release) -> str | None:
        stmt = (
            select(ArtifactVersion)
            .where(ArtifactVersion.release_id == release.id)
        )
        result = await self.session.execute(stmt)
        artifacts = result.scalars().all()
        for a in artifacts:
            if a.artifact_type == "graph" and a.artifact_status == "ready":
                return a.artifact_path
        return None

    async def _active_release_id(self, kb_id: str) -> str | None:
        kb = await self.knowledge_bases.get(kb_id)
        return kb.active_release_id if kb else None

    async def _build_artifact_refs(self, kb_id: str) -> dict[str, str]:
        kb = await self.knowledge_bases.get(kb_id)
        if not kb or not kb.active_release_id:
            return {}
        release = await self.releases.get(kb.active_release_id)
        if not release:
            return {}
        stmt = (
            select(ArtifactVersion)
            .where(ArtifactVersion.release_id == release.id)
        )
        result = await self.session.execute(stmt)
        artifacts = result.scalars().all()
        return {a.artifact_type: a.artifact_path for a in artifacts if a.artifact_status == "ready"}

    @staticmethod
    def _graphify_available() -> bool:
        try:
            import graphify  # noqa: F401
            return True
        except ImportError:
            return False

    @staticmethod
    def _error(kb_id: str, error_code: str, message: str, retryable: bool) -> dict:
        return {
            "kb_id": kb_id,
            "release_id": None,
            "answer": "",
            "source_locations": [],
            "artifact_refs": {},
            "error_code": error_code,
            "message": message,
            "retryable": retryable,
        }
