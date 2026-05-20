from sqlalchemy import select

from app.db.models.knowledge_base import KnowledgeBase
from app.db.repository import BaseRepository


class KnowledgeBaseRepository(BaseRepository[KnowledgeBase]):
    model = KnowledgeBase

    async def list(self, project_id: str | None = None) -> list[KnowledgeBase]:
        stmt = select(KnowledgeBase)
        if project_id is not None:
            stmt = stmt.where(KnowledgeBase.project_id == project_id)
        stmt = stmt.order_by(KnowledgeBase.id.asc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
