from collections.abc import Sequence

from sqlalchemy import func, select

from app.db.models.source import Source
from app.db.repository import BaseRepository


class SourceRepository(BaseRepository[Source]):
    model = Source

    async def list_by_project(self, project_id: str, page: int, page_size: int) -> tuple[Sequence[Source], int]:
        stmt = (
            select(Source)
            .where(Source.project_id == project_id)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self.session.execute(stmt)
        items = result.scalars().all()

        count_stmt = select(func.count()).select_from(Source).where(Source.project_id == project_id)
        total = (await self.session.execute(count_stmt)).scalar_one()
        return items, total

    async def list_all_polling(self) -> list[Source]:
        stmt = select(Source).where(Source.git_poll_interval_minutes > 0)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
