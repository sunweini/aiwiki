from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.source import Source


class SourceRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(self, source: Source) -> Source:
        self.session.add(source)
        self.session.commit()
        self.session.refresh(source)
        return source

    def list_by_project(self, project_id: str, page: int, page_size: int) -> tuple[Sequence[Source], int]:
        items = self.session.execute(
            select(Source)
            .where(Source.project_id == project_id)
            .offset((page - 1) * page_size)
            .limit(page_size)
        ).scalars().all()
        total = self.session.query(Source).filter(Source.project_id == project_id).count()
        return items, total
