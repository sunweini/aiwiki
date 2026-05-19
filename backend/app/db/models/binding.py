from sqlalchemy import ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class KnowledgeBaseSourceBinding(Base):
    __tablename__ = "knowledge_base_source_bindings"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    knowledge_base_id: Mapped[str] = mapped_column(ForeignKey("knowledge_bases.id"), nullable=False)
    source_id: Mapped[str] = mapped_column(ForeignKey("sources.id"), nullable=False)
    binding_status: Mapped[str] = mapped_column(String, nullable=False)
    scope_override: Mapped[dict] = mapped_column(JSON, default=dict)
    include_rules_override: Mapped[list] = mapped_column(JSON, default=list)
    exclude_rules_override: Mapped[list] = mapped_column(JSON, default=list)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
