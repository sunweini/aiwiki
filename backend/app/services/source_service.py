from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy.orm import Session

from app.db.models import Source
from app.repositories.sources import SourceRepository
from app.schemas.source import SourceCreate


class SourceService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.repository = SourceRepository(session)

    def create_source(self, project_id: str, payload: SourceCreate) -> Source:
        now = datetime.now(UTC)
        source = Source(
            id=f"src_{uuid4().hex[:12]}",
            project_id=project_id,
            name=payload.name,
            type=payload.type,
            status="active",
            source_ref=payload.source_ref,
            description=payload.description,
            auth_config=payload.auth_config,
            sync_strategy=payload.sync_strategy,
            include_rules=payload.include_rules,
            exclude_rules=payload.exclude_rules,
            normalization_options=payload.normalization_options,
        )
        source.created_at = now
        source.updated_at = now
        source.last_synced_at = None
        return self.repository.create(source)

    def list_sources(self, project_id: str, page: int = 1, page_size: int = 20) -> tuple[list[Source], int]:
        items, total = self.repository.list_by_project(project_id=project_id, page=page, page_size=page_size)
        return list(items), total
