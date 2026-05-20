from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class SourceCreate(BaseModel):
    name: str
    type: str
    source_ref: str
    description: str | None = None
    auth_config: dict[str, Any] = Field(default_factory=dict)
    sync_strategy: str = "manual"
    include_rules: list[str] = Field(default_factory=list)
    exclude_rules: list[str] = Field(default_factory=list)
    normalization_options: dict[str, Any] = Field(default_factory=dict)
    git_tracking_branch: str = "main"
    git_poll_interval_minutes: int = 0


class SourceRead(SourceCreate):
    id: str
    project_id: str
    status: str
    last_synced_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    git_last_commit: str | None = None
