from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.models.build_job import BuildJob


class BuildJobRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(self, build_job: BuildJob) -> BuildJob:
        self.session.add(build_job)
        self.session.commit()
        self.session.refresh(build_job)
        return build_job

    def list_by_kb(self, kb_id: str) -> list[BuildJob]:
        return (
            self.session.query(BuildJob)
            .filter(BuildJob.knowledge_base_id == kb_id)
            .order_by(BuildJob.created_at.desc(), BuildJob.id.desc())
            .all()
        )

    def list_by_kb_paginated(self, kb_id: str, page: int, page_size: int) -> tuple[list[BuildJob], int]:
        query = self.session.query(BuildJob).filter(BuildJob.knowledge_base_id == kb_id)
        total = query.count()
        items = (
            query.order_by(BuildJob.created_at.desc(), BuildJob.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        return items, total

    def get(self, job_id: str) -> BuildJob | None:
        return self.session.get(BuildJob, job_id)

    def update(self, build_job: BuildJob) -> BuildJob:
        self.session.add(build_job)
        self.session.commit()
        self.session.refresh(build_job)
        return build_job

    def list_sources(self, kb_id: str) -> list[dict[str, str]]:
        rows = self.session.execute(
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
            {
                "id": row.id,
                "name": row.name,
                "type": row.type,
                "source_ref": row.source_ref,
            }
            for row in rows
        ]
