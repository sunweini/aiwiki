from app.db.models.artifact_version import ArtifactVersion
from app.db.repository import BaseRepository


class ArtifactVersionRepository(BaseRepository[ArtifactVersion]):
    model = ArtifactVersion

    async def batch_create(self, artifacts: list[ArtifactVersion]) -> list[ArtifactVersion]:
        self.session.add_all(artifacts)
        await self.session.commit()
        for a in artifacts:
            await self.session.refresh(a)
        return artifacts
