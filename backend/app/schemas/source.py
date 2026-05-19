from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class SourceCreate(BaseModel):
    name: str
    type: str
    source_ref: str
    description: str | None = None
    auth_config: dict[str, Any] = Field(default_factory=dict)
    sync_strategy: str
    include_rules: list[str] = Field(default_factory=list)
    exclude_rules: list[str] = Field(default_factory=list)
    normalization_options: dict[str, Any] = Field(default_factory=dict)


class SourceRead(SourceCreate):
    id: str
    project_id: str
    status: str
    last_synced_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
