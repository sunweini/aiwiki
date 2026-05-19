from sqlalchemy.orm import Session

from app.db.models.artifact_version import ArtifactVersion


class ArtifactVersionRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(self, artifact: ArtifactVersion) -> ArtifactVersion:
        self.session.add(artifact)
        self.session.commit()
        self.session.refresh(artifact)
        return artifact

    def batch_create(self, artifacts: list[ArtifactVersion]) -> list[ArtifactVersion]:
        self.session.add_all(artifacts)
        self.session.commit()
        for a in artifacts:
            self.session.refresh(a)
        return artifacts
