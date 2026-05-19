from pathlib import Path


class WorkspaceManager:
    def __init__(self, root: Path):
        self.root = root

    def create(self, job_id: str) -> Path:
        workspace = self.root / job_id
        for name in [
            "source-materials",
            "graphify-input",
            "graphify-out",
            "obsidian-enhanced",
            "logs",
            "metadata",
        ]:
            (workspace / name).mkdir(parents=True, exist_ok=True)
        return workspace

    def resolve_path(self, job_id: str, *segments: str) -> Path:
        return self.root.joinpath(job_id, *segments)
