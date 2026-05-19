from datetime import datetime

from pydantic import BaseModel


class ArtifactRead(BaseModel):
    id: str
    artifact_type: str
    artifact_status: str
    artifact_path: str
    artifact_meta: dict


class ReleaseRead(BaseModel):
    id: str
    knowledge_base_id: str
    build_job_id: str
    version: str
    status: str
    artifact_status: dict
    created_at: datetime


class ArtifactsResponse(BaseModel):
    kb_id: str
    release_id: str | None = None
    artifacts: list[ArtifactRead]
