from sqlalchemy import ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ArtifactVersion(Base):
    __tablename__ = "artifact_versions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    release_id: Mapped[str] = mapped_column(ForeignKey("releases.id"), nullable=False)
    artifact_type: Mapped[str] = mapped_column(String, nullable=False)
    artifact_status: Mapped[str] = mapped_column(String, nullable=False)
    artifact_path: Mapped[str] = mapped_column(String, nullable=False)
    artifact_meta: Mapped[dict] = mapped_column(JSON, default=dict)
