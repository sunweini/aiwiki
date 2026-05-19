from pydantic import BaseModel


class BuildJobCreate(BaseModel):
    build_type: str
    triggered_by: str
    reason: str | None = None


class BuildJobRead(BuildJobCreate):
    job_id: str
    knowledge_base_id: str
    status: str
    release_id: str | None = None
    started_at: str
    finished_at: str | None = None
    error_summary: str | None = None
