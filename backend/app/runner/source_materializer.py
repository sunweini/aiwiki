import shutil
from pathlib import Path


class SourceMaterializer:
    def __init__(self, workspace_root: Path) -> None:
        self.workspace_root = workspace_root

    def materialize(self, job_id: str, sources: list[dict]) -> list[Path]:
        dest = self.workspace_root / job_id / "source-materials"
        paths: list[Path] = []
        for source in sources:
            source_dir = dest / source.get("id", "unknown")
            source_dir.mkdir(parents=True, exist_ok=True)

            source_type = source.get("type", "")
            source_ref = source.get("source_ref", "")
            if source_type in ("markdown_dir", "doc_site") and source_ref:
                src_path = Path(source_ref).resolve()
                try:
                    if src_path.is_dir():
                        shutil.copytree(src_path, source_dir, dirs_exist_ok=True)
                    else:
                        (source_dir / ".source-meta").write_text(str(source), encoding="utf-8")
                except (OSError, PermissionError) as exc:
                    (source_dir / ".source-meta").write_text(str(source), encoding="utf-8")
                    (source_dir / ".materialize-error").write_text(str(exc), encoding="utf-8")
            else:
                (source_dir / ".source-meta").write_text(str(source), encoding="utf-8")

            paths.append(source_dir)
        return paths
