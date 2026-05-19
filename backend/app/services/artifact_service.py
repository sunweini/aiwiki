from sqlalchemy.orm import Session

from app.db.models.artifact_version import ArtifactVersion
from app.repositories.releases import ReleaseRepository


class ArtifactService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.release_repository = ReleaseRepository(session)

    def list_releases(self, kb_id: str, page: int, page_size: int) -> tuple[list, int]:
        return self.release_repository.list_by_kb(kb_id=kb_id, page=page, page_size=page_size)

    def get_artifacts_for_kb(self, kb_id: str) -> dict:
        release_id = self.release_repository.get_active_release_id(kb_id)
        artifacts = (
            self.session.query(ArtifactVersion)
            .filter(ArtifactVersion.release_id == release_id)
            .order_by(ArtifactVersion.id.asc())
            .all()
            if release_id
            else []
        )
        return {
            "kb_id": kb_id,
            "release_id": release_id,
            "artifacts": artifacts,
        }
