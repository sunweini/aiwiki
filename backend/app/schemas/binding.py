from typing import Any

from pydantic import BaseModel, Field


class BindingCreate(BaseModel):
    source_id: str
    binding_status: str
    scope_override: dict[str, Any] = Field(default_factory=dict)
    include_rules_override: list[str] = Field(default_factory=list)
    exclude_rules_override: list[str] = Field(default_factory=list)
    priority: int = 100


class BindingRead(BindingCreate):
    id: str
    knowledge_base_id: str
