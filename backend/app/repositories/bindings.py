from sqlalchemy.orm import Session

from app.db.models.binding import KnowledgeBaseSourceBinding


class BindingRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(self, binding: KnowledgeBaseSourceBinding) -> KnowledgeBaseSourceBinding:
        self.session.add(binding)
        self.session.commit()
        self.session.refresh(binding)
        return binding
