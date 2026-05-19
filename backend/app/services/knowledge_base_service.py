from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy.orm import Session

from app.db.models.binding import KnowledgeBaseSourceBinding
from app.db.models.knowledge_base import KnowledgeBase
from app.repositories.bindings import BindingRepository
from app.repositories.knowledge_bases import KnowledgeBaseRepository
from app.schemas.binding import BindingCreate
from app.schemas.knowledge_base import KnowledgeBaseCreate


class KnowledgeBaseService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.knowledge_base_repository = KnowledgeBaseRepository(session)
        self.binding_repository = BindingRepository(session)

    def create_knowledge_base(self, project_id: str, payload: KnowledgeBaseCreate) -> KnowledgeBase:
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
        return self.knowledge_base_repository.create(knowledge_base)

    def get_knowledge_base(self, kb_id: str) -> KnowledgeBase:
        return self.knowledge_base_repository.get(kb_id)

    def list_knowledge_bases(self, project_id: str, page: int = 1, page_size: int = 20) -> tuple[list[KnowledgeBase], int]:
        items = self.knowledge_base_repository.list(project_id=project_id)
        total = len(items)
        start = (page - 1) * page_size
        return items[start:start + page_size], total

    def create_binding(self, kb_id: str, payload: BindingCreate) -> KnowledgeBaseSourceBinding:
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
        return self.binding_repository.create(binding)
