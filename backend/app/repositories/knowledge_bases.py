from sqlalchemy.orm import Session

from app.db.models.knowledge_base import KnowledgeBase


class KnowledgeBaseRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(self, knowledge_base: KnowledgeBase) -> KnowledgeBase:
        self.session.add(knowledge_base)
        self.session.commit()
        self.session.refresh(knowledge_base)
        return knowledge_base

    def get(self, kb_id: str) -> KnowledgeBase | None:
        return self.session.get(KnowledgeBase, kb_id)

    def list(self, project_id: str | None = None) -> list[KnowledgeBase]:
        query = self.session.query(KnowledgeBase)
        if project_id is not None:
            query = query.filter(KnowledgeBase.project_id == project_id)
        return query.order_by(KnowledgeBase.id.asc()).all()

    def update(self, knowledge_base: KnowledgeBase) -> KnowledgeBase:
        self.session.add(knowledge_base)
        self.session.commit()
        self.session.refresh(knowledge_base)
        return knowledge_base
