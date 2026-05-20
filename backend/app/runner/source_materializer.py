import shutil
import subprocess
from pathlib import Path

_SKIP_DIRS = {
    "venv", ".venv", "env", ".env",
    "node_modules", "__pycache__", ".git",
    "dist", "build", "target", "out",
    "site-packages", "lib64",
    ".pytest_cache", ".mypy_cache", ".ruff_cache",
    ".tox", ".eggs", "*.egg-info",
    "graphify-out",
}


def _copytree_ignore(src: str, names: list[str]) -> set[str]:
    ignored: set[str] = set()
    for name in names:
        if name in _SKIP_DIRS or name.endswith(".egg-info"):
            ignored.add(name)
        elif name.startswith("."):
            ignored.add(name)
    return ignored


class SourceMaterializer:
    """Materialize sources into data/projects/{project_id}/sources/{source_id}/"""

    def __init__(self, project_id: str, project_root: Path) -> None:
        self.project_id = project_id
        self.project_root = project_root
        self.sources_root = project_root / "sources"

    def materialize(self, source: dict) -> Path:
        """Clone/copy source_ref into sources/{source_id}/. Returns source dir Path."""
        source_id = source["id"]
        source_dir = self.sources_root / source_id
        source_ref = source.get("source_ref", "")

        # Determine strategy
        is_remote_git = source_ref.startswith(("http://", "https://", "git@"))
        git_branch = source.get("git_tracking_branch", "main")

        if is_remote_git:
            self._clone(source_ref, source_dir, git_branch)
        elif source_ref:
            src_path = Path(source_ref).resolve()
            if src_path.is_dir():
                self._copy_dir(src_path, source_dir)
            else:
                source_dir.mkdir(parents=True, exist_ok=True)
                (source_dir / ".source-meta").write_text(str(source), encoding="utf-8")
        else:
            source_dir.mkdir(parents=True, exist_ok=True)
            (source_dir / ".source-meta").write_text(str(source), encoding="utf-8")

        (source_dir / ".source-meta").write_text(str(source), encoding="utf-8")
        return source_dir

    def check_for_updates(self, source: dict) -> bool:
        """Check if source has remote changes. Returns True if rebuild needed."""
        source_id = source["id"]
        source_dir = self.sources_root / source_id
        git_dir = source_dir / ".git"
        if not git_dir.exists():
            return False

        branch = source.get("git_tracking_branch", "main")
        try:
            subprocess.run(["git", "-C", str(source_dir), "fetch", "origin", branch],
                           capture_output=True, timeout=60, check=True)
            local = subprocess.run(["git", "-C", str(source_dir), "rev-parse", "HEAD"],
                                   capture_output=True, text=True, check=True).stdout.strip()
            remote = subprocess.run(["git", "-C", str(source_dir), "rev-parse", f"origin/{branch}"],
                                    capture_output=True, text=True, check=True).stdout.strip()
            return local != remote
        except subprocess.CalledProcessError:
            return False

    def pull_updates(self, source: dict) -> bool:
        """Pull latest for a git source. Returns True if pulled."""
        source_id = source["id"]
        source_dir = self.sources_root / source_id
        branch = source.get("git_tracking_branch", "main")
        if not (source_dir / ".git").exists():
            return False
        try:
            subprocess.run(["git", "-C", str(source_dir), "pull", "origin", branch],
                           capture_output=True, timeout=120, check=True)
            return True
        except subprocess.CalledProcessError:
            return False

    def _clone(self, url: str, dest: Path, branch: str) -> None:
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists():
            shutil.rmtree(dest)
        subprocess.run(
            ["git", "clone", "--depth", "1", "-b", branch, url, str(dest)],
            capture_output=True, timeout=300, check=True,
        )

    def _copy_dir(self, src: Path, dest: Path) -> None:
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists():
            shutil.rmtree(dest)
        shutil.copytree(src, dest, ignore=_copytree_ignore)
