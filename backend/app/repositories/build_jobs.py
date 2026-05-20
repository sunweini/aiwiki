from sqlalchemy import func, select, text

from app.db.models.build_job import BuildJob
from app.db.repository import BaseRepository


class BuildJobRepository(BaseRepository[BuildJob]):
    model = BuildJob

    async def list_by_kb(self, kb_id: str) -> list[BuildJob]:
        stmt = (
            select(BuildJob)
            .where(BuildJob.knowledge_base_id == kb_id)
            .order_by(BuildJob.created_at.desc(), BuildJob.id.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def list_by_kb_paginated(self, kb_id: str, page: int, page_size: int) -> tuple[list[BuildJob], int]:
        count_stmt = select(func.count()).select_from(BuildJob).where(BuildJob.knowledge_base_id == kb_id)
        total = (await self.session.execute(count_stmt)).scalar_one()

        stmt = (
            select(BuildJob)
            .where(BuildJob.knowledge_base_id == kb_id)
            .order_by(BuildJob.created_at.desc(), BuildJob.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total

    async def list_sources(self, kb_id: str) -> list[dict[str, str]]:
        rows = await self.session.execute(
            text(
                """
                SELECT s.id, s.name, s.type, s.source_ref
                FROM knowledge_base_source_bindings AS b
                JOIN sources AS s ON s.id = b.source_id
                WHERE b.knowledge_base_id = :kb_id AND b.binding_status = 'active'
                ORDER BY b.priority ASC, b.id ASC
                """
            ),
            {"kb_id": kb_id},
        )
        return [
            {"id": row.id, "name": row.name, "type": row.type, "source_ref": row.source_ref}
            for row in rows
        ]
