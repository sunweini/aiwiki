from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class KnowledgeBaseCreate(BaseModel):
    name: str
    visibility: str
    description: str | None = None
    release_policy: dict[str, Any] = Field(default_factory=dict)
    llm_backend: str | None = None
    llm_api_key_ref: str | None = None
    llm_model_override: str | None = None
    llm_extraction_budget: int | None = None
    llm_base_url_override: str | None = None


class KnowledgeBaseRead(KnowledgeBaseCreate):
    id: str
    project_id: str
    status: str
    active_release_id: str | None = None
    created_at: datetime
    updated_at: datetime
