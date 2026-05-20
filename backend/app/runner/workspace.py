from pathlib import Path
import json
from datetime import UTC, datetime


class WorkspaceManager:
    """Manage data directory structure: data/projects/{project_id}/kb/{kb_id}/..."""

    def __init__(self, data_root: Path) -> None:
        self.data_root = data_root

    def project_root(self, project_id: str) -> Path:
        return self.data_root / "projects" / project_id

    def ensure_project_dir(self, project_id: str) -> Path:
        root = self.project_root(project_id)
        root.mkdir(parents=True, exist_ok=True)
        (root / "sources").mkdir(exist_ok=True)
        (root / "kb").mkdir(exist_ok=True)
        meta = root / "project.json"
        if not meta.exists():
            meta.write_text(json.dumps({
                "project_id": project_id,
                "created_at": datetime.now(UTC).isoformat(),
            }))
        return root

    def source_dir(self, project_id: str, source_id: str) -> Path:
        return self.project_root(project_id) / "sources" / source_id

    def kb_root(self, project_id: str, kb_id: str) -> Path:
        return self.project_root(project_id) / "kb" / kb_id

    def ensure_kb_dir(self, project_id: str, kb_id: str) -> Path:
        root = self.kb_root(project_id, kb_id)
        for name in ["cache", "builds", "obsidian", "wiki", "releases"]:
            (root / name).mkdir(parents=True, exist_ok=True)
        meta = root / "kb.json"
        if not meta.exists():
            meta.write_text(json.dumps({"kb_id": kb_id, "project_id": project_id}))
        return root

    def create_build_workspace(self, project_id: str, kb_id: str, job_id: str) -> Path:
        """Create build workspace: kb/{kb_id}/builds/{job_id}/"""
        ws = self.kb_root(project_id, kb_id) / "builds" / job_id
        for name in ["input", "out", "logs", "metadata"]:
            (ws / name).mkdir(parents=True, exist_ok=True)
        return ws

    def cache_dir(self, project_id: str, kb_id: str) -> Path:
        return self.kb_root(project_id, kb_id) / "cache"

    def obsidian_dir(self, project_id: str, kb_id: str) -> Path:
        return self.kb_root(project_id, kb_id) / "obsidian"

    def wiki_dir(self, project_id: str, kb_id: str) -> Path:
        return self.kb_root(project_id, kb_id) / "wiki"

    def releases_dir(self, project_id: str, kb_id: str) -> Path:
        return self.kb_root(project_id, kb_id) / "releases"
