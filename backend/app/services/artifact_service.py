from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.artifact_version import ArtifactVersion
from app.repositories.releases import ReleaseRepository


class ArtifactService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.release_repository = ReleaseRepository(session)

    async def list_releases(self, kb_id: str, page: int, page_size: int) -> tuple[list, int]:
        return await self.release_repository.list_by_kb(kb_id=kb_id, page=page, page_size=page_size)

    async def get_artifacts_for_kb(self, kb_id: str) -> dict:
        release_id = await self.release_repository.get_active_release_id(kb_id)
        if release_id:
            stmt = (
                select(ArtifactVersion)
                .where(ArtifactVersion.release_id == release_id)
                .order_by(ArtifactVersion.id.asc())
            )
            result = await self.session.execute(stmt)
            artifacts = list(result.scalars().all())
        else:
            artifacts = []
        return {
            "kb_id": kb_id,
            "release_id": release_id,
            "artifacts": artifacts,
        }
