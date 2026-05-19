from sqlalchemy.orm import Session

from app.db.models.knowledge_base import KnowledgeBase
from app.db.models.release import Release


class ReleaseRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_by_kb(self, kb_id: str, page: int, page_size: int) -> tuple[list[Release], int]:
        offset = (page - 1) * page_size
        query = self.session.query(Release).filter(Release.knowledge_base_id == kb_id)
        total = query.count()
        items = query.order_by(Release.id.desc()).offset(offset).limit(page_size).all()
        return items, total

    def get_active_release_id(self, kb_id: str) -> str | None:
        knowledge_base = self.session.get(KnowledgeBase, kb_id)
        if knowledge_base is None:
            return None
        return knowledge_base.active_release_id

    def get(self, release_id: str) -> Release | None:
        return self.session.get(Release, release_id)

    def create(self, release: Release) -> Release:
        self.session.add(release)
        self.session.commit()
        self.session.refresh(release)
        return release
