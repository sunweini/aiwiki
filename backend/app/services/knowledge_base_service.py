from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.binding import KnowledgeBaseSourceBinding
from app.db.models.knowledge_base import KnowledgeBase
from app.db.models.project import Project
from app.repositories.bindings import BindingRepository
from app.repositories.knowledge_bases import KnowledgeBaseRepository
from app.repositories.projects import ProjectRepository
from app.schemas.binding import BindingCreate
from app.schemas.knowledge_base import KnowledgeBaseCreate
from app.schemas.project import ProjectCreate


class KnowledgeBaseService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.knowledge_base_repository = KnowledgeBaseRepository(session)
        self.binding_repository = BindingRepository(session)

    async def create_knowledge_base(self, project_id: str, payload: KnowledgeBaseCreate) -> KnowledgeBase:
        now = datetime.now(UTC)
        knowledge_base = KnowledgeBase(
            id=f"kb_{uuid4().hex[:12]}",
            project_id=project_id,
            name=payload.name,
            description=payload.description,
            status="ready",
            visibility=payload.visibility,
            active_release_id=None,
            release_policy=payload.release_policy,
            llm_backend=payload.llm_backend,
            llm_api_key_ref=payload.llm_api_key_ref,
            llm_model_override=payload.llm_model_override,
            llm_extraction_budget=payload.llm_extraction_budget,
            llm_base_url_override=payload.llm_base_url_override,
        )
        knowledge_base.created_at = now
        knowledge_base.updated_at = now
        knowledge_base = await self.knowledge_base_repository.create(knowledge_base)

        from pathlib import Path
        from app.config import settings
        from app.runner.workspace import WorkspaceManager

        wm = WorkspaceManager(Path(settings.data_root))
        wm.ensure_project_dir(project_id)
        kb_root = wm.ensure_kb_dir(project_id, knowledge_base.id)

        for name in ["obsidian", "wiki"]:
            repo_dir = kb_root / name
            if not (repo_dir / ".git").exists():
                import subprocess
                subprocess.run(
                    ["git", "init", str(repo_dir)],
                    capture_output=True, timeout=10,
                )
                (repo_dir / ".gitkeep").touch()
                subprocess.run(
                    ["git", "-C", str(repo_dir), "add", "-A"],
                    capture_output=True, timeout=10,
                )
                subprocess.run(
                    ["git", "-C", str(repo_dir), "commit", "-m", "initial"],
                    capture_output=True, timeout=10,
                )

        return knowledge_base

    async def get_knowledge_base(self, kb_id: str) -> KnowledgeBase:
        return await self.knowledge_base_repository.get(kb_id)

    async def list_knowledge_bases(self, project_id: str, page: int = 1, page_size: int = 20) -> tuple[list[KnowledgeBase], int]:
        items = await self.knowledge_base_repository.list(project_id=project_id)
        total = len(items)
        start = (page - 1) * page_size
        return items[start:start + page_size], total

    async def update_knowledge_base(self, kb_id: str, name: str) -> KnowledgeBase:
        kb = await self.knowledge_base_repository.get(kb_id)
        if kb is None:
            raise ValueError("knowledge base not found")
        kb.name = name
        kb.updated_at = datetime.now(UTC)
        return await self.knowledge_base_repository.update(kb)

    async def delete_knowledge_base(self, kb_id: str) -> None:
        kb = await self.knowledge_base_repository.get(kb_id)
        if kb is None:
            raise ValueError("knowledge base not found")
        await self.knowledge_base_repository.delete(kb)

    async def create_binding(self, kb_id: str, payload: BindingCreate) -> KnowledgeBaseSourceBinding:
        binding = KnowledgeBaseSourceBinding(
            id=f"bind_{uuid4().hex[:12]}",
            knowledge_base_id=kb_id,
            source_id=payload.source_id,
            binding_status=payload.binding_status,
            scope_override=payload.scope_override,
            include_rules_override=payload.include_rules_override,
            exclude_rules_override=payload.exclude_rules_override,
            priority=payload.priority,
        )
        return await self.binding_repository.create(binding)


class ProjectService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = ProjectRepository(session)

    async def create_project(self, payload: ProjectCreate) -> Project:
        project = Project(
            id=f"proj_{uuid4().hex[:12]}",
            name=payload.name,
            description=payload.description,
        )
        return await self.repo.create(project)

    async def list_projects(self, page: int = 1, page_size: int = 20) -> tuple[list[Project], int]:
        return await self.repo.list_all(page=page, page_size=page_size)

    async def get_project(self, project_id: str) -> Project | None:
        return await self.repo.get(project_id)

    async def update_project(self, project_id: str, name: str) -> Project:
        project = await self.repo.get(project_id)
        if project is None:
            raise ValueError("project not found")
        project.name = name
        return await self.repo.update(project)

    async def delete_project(self, project_id: str) -> None:
        project = await self.repo.get(project_id)
        if project is None:
            raise ValueError("project not found")
        await self.repo.delete(project)
