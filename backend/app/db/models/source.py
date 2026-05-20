from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Source(Base):
    __tablename__ = "sources"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    source_ref: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    auth_config: Mapped[dict] = mapped_column(JSON, default=dict)
    sync_strategy: Mapped[str] = mapped_column(String, nullable=False)
    include_rules: Mapped[list] = mapped_column(JSON, default=list)
    exclude_rules: Mapped[list] = mapped_column(JSON, default=list)
    normalization_options: Mapped[dict] = mapped_column(JSON, default=dict)
    git_tracking_branch: Mapped[str] = mapped_column(String, nullable=False, default="main")
    git_poll_interval_minutes: Mapped[int] = mapped_column(default=0)
    git_last_commit: Mapped[str | None] = mapped_column(String, nullable=True)
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
