from sqlalchemy import func, select

from app.db.models.knowledge_base import KnowledgeBase
from app.db.models.release import Release
from app.db.repository import BaseRepository


class ReleaseRepository(BaseRepository[Release]):
    model = Release

    async def list_by_kb(self, kb_id: str, page: int, page_size: int) -> tuple[list[Release], int]:
        offset = (page - 1) * page_size
        count_stmt = select(func.count()).select_from(Release).where(Release.knowledge_base_id == kb_id)
        total = (await self.session.execute(count_stmt)).scalar_one()

        stmt = (
            select(Release)
            .where(Release.knowledge_base_id == kb_id)
            .order_by(Release.id.desc())
            .offset(offset)
            .limit(page_size)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total

    async def get_active_release_id(self, kb_id: str) -> str | None:
        kb = await self.session.get(KnowledgeBase, kb_id)
        if kb is None:
            return None
        return kb.active_release_id
