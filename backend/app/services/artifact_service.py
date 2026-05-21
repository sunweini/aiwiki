from pathlib import Path

from fastapi import HTTPException
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

    async def get_artifact_by_type(self, kb_id: str, artifact_type: str) -> ArtifactVersion:
        """Get an active-release artifact by type. Raises 404 if not found."""
        release_id = await self.release_repository.get_active_release_id(kb_id)
        if not release_id:
            raise HTTPException(status_code=404, detail="No active release for this knowledge base")
        stmt = (
            select(ArtifactVersion)
            .where(ArtifactVersion.release_id == release_id)
            .where(ArtifactVersion.artifact_type == artifact_type)
            .limit(1)
        )
        result = await self.session.execute(stmt)
        artifact = result.scalar_one_or_none()
        if artifact is None:
            raise HTTPException(status_code=404, detail=f"Artifact type '{artifact_type}' not found")
        return artifact

    @staticmethod
    def resolve_artifact_path(artifact: ArtifactVersion) -> Path:
        """Return the filesystem path for an artifact, verifying it exists."""
        from app.config import settings

        path = Path(artifact.artifact_path)
        if not path.is_absolute():
            path = Path(settings.data_root) / path
        if not path.exists():
            raise HTTPException(status_code=404, detail="Artifact file not found on disk")
        return path
