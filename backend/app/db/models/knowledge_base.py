from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class KnowledgeBase(Base):
    __tablename__ = "knowledge_bases"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False)
    visibility: Mapped[str] = mapped_column(String, nullable=False)
    active_release_id: Mapped[str | None] = mapped_column(ForeignKey("releases.id"), nullable=True)
    release_policy: Mapped[dict] = mapped_column(JSON, default=dict)
    llm_backend: Mapped[str | None] = mapped_column(String, nullable=True)
    llm_api_key_ref: Mapped[str | None] = mapped_column(String, nullable=True)
    llm_model_override: Mapped[str | None] = mapped_column(String, nullable=True)
    llm_extraction_budget: Mapped[int | None] = mapped_column(nullable=True)
    llm_base_url_override: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
