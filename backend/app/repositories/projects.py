from sqlalchemy import func, select

from app.db.models.project import Project
from app.db.repository import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    model = Project

    async def list_all(self, page: int = 1, page_size: int = 20) -> tuple[list[Project], int]:
        count_stmt = select(func.count()).select_from(Project)
        total = (await self.session.execute(count_stmt)).scalar_one()

        stmt = select(Project).order_by(Project.id.asc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total
