from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4
import subprocess

from sqlalchemy.orm import Session

from app.config import settings
from app.db.models import Source
from app.repositories.sources import SourceRepository
from app.runner.source_materializer import SourceMaterializer
from app.runner.workspace import WorkspaceManager
from app.schemas.source import SourceCreate


class SourceService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.repository = SourceRepository(session)
        self.wm = WorkspaceManager(Path(settings.data_root))

    def create_source(self, project_id: str, payload: SourceCreate) -> Source:
        now = datetime.now(UTC)
        source_id = f"src_{uuid4().hex[:12]}"

        self.wm.ensure_project_dir(project_id)

        source = Source(
            id=source_id,
            project_id=project_id,
            name=payload.name,
            type=payload.type,
            status="active",
            source_ref=payload.source_ref,
            description=payload.description,
            auth_config=payload.auth_config,
            sync_strategy=payload.sync_strategy,
            include_rules=payload.include_rules,
            exclude_rules=payload.exclude_rules,
            normalization_options=payload.normalization_options,
            git_tracking_branch=payload.git_tracking_branch,
            git_poll_interval_minutes=payload.git_poll_interval_minutes,
        )
        source.created_at = now
        source.updated_at = now
        source.last_synced_at = None

        source = self.repository.create(source)

        # Materialize source files into sources/{source_id}/
        mat = SourceMaterializer(project_id, self.wm.project_root(project_id))
        try:
            mat.materialize({
                "id": source_id,
                "type": payload.type,
                "source_ref": payload.source_ref,
                "git_tracking_branch": payload.git_tracking_branch,
            })
            source_dir = self.wm.source_dir(project_id, source_id)
            if (source_dir / ".git").exists():
                try:
                    head = subprocess.run(
                        ["git", "-C", str(source_dir), "rev-parse", "HEAD"],
                        capture_output=True, text=True, timeout=10
                    ).stdout.strip()
                    source.git_last_commit = head
                except subprocess.CalledProcessError:
                    pass
            source.last_synced_at = now
            self.repository.update(source)
        except Exception:
            source.status = "error"
            self.repository.update(source)

        return source

    def list_sources(self, project_id: str, page: int = 1, page_size: int = 20) -> tuple[list[Source], int]:
        items, total = self.repository.list_by_project(project_id=project_id, page=page, page_size=page_size)
        return list(items), total
