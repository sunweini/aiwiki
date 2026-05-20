# AIWiki 目录结构改造与异步执行 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 data 目录从平铺 `workspaces/{job_id}/` 改造为层级化 `projects/{project_id}/`，支持 git source 变更检测、异步 build 执行、查询验证硬门禁。

**Architecture:** 分层改造 — 底层 config/models → 中层 runner/services → 上层 API → 前端轮询。每层独立可测。

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy, networkx, graphify, Next.js, React, TypeScript

**Spec:** `docs/superpowers/specs/2026-05-20-aiwiki-directory-restructure.md`

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `app/config.py` | 新 `data_root`、`projects_dir` 配置 |
| `app/db/models/source.py` | +3 git 字段 |
| `app/db/models/build_job.py` | +current_stage 字段 |
| `app/schemas/source.py` | SourceCreate/Read 加 git 字段 |
| `app/schemas/build_job.py` | 不变（已有 stages） |
| `app/runner/workspace.py` | 重写: 产出 `kb/{kb_id}/builds/{job_id}/` 结构 |
| `app/runner/source_materializer.py` | 重写: git clone/pull, Stage 0 校验, sources/ 隔离 |
| `app/runner/graphify_runner.py` | +Stage0, +progress_callback, 路径适配 |
| `app/services/build_service.py` | async enqueue, release manifest 写入 |
| `app/services/source_service.py` | 注册时 clone/copy source, git poll task |
| `app/services/knowledge_base_service.py` | KB 创建时 init obsidian/wiki git repo |
| `app/services/graphify_query_adapter.py` | +verify_queries 三问门禁 |
| `app/main.py` | StaticFiles 路径, startup git poll |
| `app/api/routes/build_jobs.py` | 202 响应, 去阻塞 |
| `frontend/src/lib/types.ts` | Source 加 git 字段, BuildJob 加 current_stage |
| `frontend/src/app/build-jobs/[jobId]/page.tsx` | 轮询 2s |
| `frontend/src/components/build-timeline.tsx` | 去掉 mock, 接 stage data |

---

### Task 1: 配置变更

**Files:**
- Modify: `backend/app/config.py`

- [ ] **Step 1: 改 config**

```python
# backend/app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class Settings(BaseSettings):
    app_name: str = "ai-code-kb-platform"
    environment: str = "dev"
    database_url: str = "sqlite+pysqlite:///:memory:"
    redis_url: str = "redis://localhost:6379/0"
    data_root: str = str(Path(__file__).resolve().parent.parent.parent / "data")
    # data_root 默认指向 aiwiki/data/（项目根，与 backend/ frontend/ 平级）

    model_config = SettingsConfigDict(env_prefix="AIKB_", extra="ignore")


settings = Settings()
```

删除 `artifact_root` 和 `workspace_root`。`data_root` 通过 `AIKB_DATA_ROOT` 环境变量可覆盖。

- [ ] **Step 2: 验证**

```
cd backend && python3 -c "from app.config import settings; print(settings.data_root)"
```
输出应以 `/aiwiki/data` 结尾。

- [ ] **Step 3: 提交**

```bash
git add backend/app/config.py
git commit -m "refactor: replace workspace_root/artifact_root with data_root at project level"
```

---

### Task 2: Source model + migration

**Files:**
- Modify: `backend/app/db/models/source.py`
- Create: `backend/alembic/versions/20260520_0004_add_git_fields_to_sources.py`

- [ ] **Step 1: 加 model 字段**

```python
# backend/app/db/models/source.py —— 在 normalization_options 后加三行:
    git_tracking_branch: Mapped[str] = mapped_column(String, nullable=False, default="main")
    git_poll_interval_minutes: Mapped[int] = mapped_column(default=0)
    git_last_commit: Mapped[str | None] = mapped_column(String, nullable=True)
```

- [ ] **Step 2: 生成 migration**

```bash
cd backend && python3 -m alembic revision --autogenerate -m "add git fields to sources"
# 手动改 migration: 改名 20260520_0004_add_git_fields_to_sources.py
```

- [ ] **Step 3: 验证 migration**

```bash
cd backend && python3 -m alembic upgrade head
cd backend && python3 -c "
from app.db.base import engine, Base
from sqlalchemy import inspect
inspector = inspect(engine)
cols = [c['name'] for c in inspector.get_columns('sources')]
print([c for c in cols if c.startswith('git_')])
"
```
Expected: `['git_tracking_branch', 'git_poll_interval_minutes', 'git_last_commit']`

- [ ] **Step 4: 提交**

```bash
git add backend/app/db/models/source.py backend/alembic/versions/20260520_0004_add_git_fields_to_sources.py
git commit -m "feat: add git tracking fields to sources model"
```

---

### Task 3: BuildJob model + current_stage

**Files:**
- Modify: `backend/app/db/models/build_job.py`
- Create: `backend/alembic/versions/20260520_0005_add_current_stage_to_build_jobs.py`

- [ ] **Step 1: 加字段**

```python
# backend/app/db/models/build_job.py —— 在 error_summary 后加:
    current_stage: Mapped[str | None] = mapped_column(String, nullable=True)
```

- [ ] **Step 2: 生成 migration**

```bash
cd backend && python3 -m alembic revision --autogenerate -m "add current_stage to build_jobs"
```

- [ ] **Step 3: 验证**

```bash
cd backend && python3 -m alembic upgrade head
cd backend && python3 -c "
from app.db.base import engine, Base
from sqlalchemy import inspect
cols = [c['name'] for c in inspect(engine).get_columns('build_jobs')]
assert 'current_stage' in cols; print('OK')
"
```

- [ ] **Step 4: 提交**

```bash
git add backend/app/db/models/build_job.py backend/alembic/versions/20260520_0005_add_current_stage_to_build_jobs.py
git commit -m "feat: add current_stage field to build_jobs model"
```

---

### Task 4: Source schema 扩展

**Files:**
- Modify: `backend/app/schemas/source.py`

- [ ] **Step 1: 加 schema 字段**

```python
# backend/app/schemas/source.py

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
    # 新增:
    git_tracking_branch: str = "main"
    git_poll_interval_minutes: int = 0


class SourceRead(SourceCreate):
    id: str
    project_id: str
    status: str
    last_synced_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    # 新增:
    git_last_commit: str | None = None
```

- [ ] **Step 2: 验证无 import 错误**

```bash
cd backend && python3 -c "from app.schemas.source import SourceCreate, SourceRead; print('OK')"
```

- [ ] **Step 3: 提交**

```bash
git add backend/app/schemas/source.py
git commit -m "feat: add git tracking fields to source schema"
```

---

### Task 5: WorkspaceManager 重写

**Files:**
- Modify: `backend/app/runner/workspace.py`

- [ ] **Step 1: 重写 WorkspaceManager**

```python
# backend/app/runner/workspace.py
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
        # project.json
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
        # kb.json
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
```

- [ ] **Step 2: 写测试**

创建 `backend/tests/test_workspace_manager.py`:

```python
from pathlib import Path
from app.runner.workspace import WorkspaceManager


def test_creates_project_directory_structure(tmp_path: Path):
    wm = WorkspaceManager(tmp_path)
    wm.ensure_project_dir("proj_test")

    proj = tmp_path / "projects" / "proj_test"
    assert proj.is_dir()
    assert (proj / "sources").is_dir()
    assert (proj / "kb").is_dir()
    assert (proj / "project.json").exists()


def test_creates_kb_directory_structure(tmp_path: Path):
    wm = WorkspaceManager(tmp_path)
    wm.ensure_project_dir("proj_test")
    wm.ensure_kb_dir("proj_test", "kb_abc")

    kb = tmp_path / "projects" / "proj_test" / "kb" / "kb_abc"
    assert (kb / "cache").is_dir()
    assert (kb / "builds").is_dir()
    assert (kb / "obsidian").is_dir()
    assert (kb / "wiki").is_dir()
    assert (kb / "releases").is_dir()
    assert (kb / "kb.json").exists()


def test_create_build_workspace(tmp_path: Path):
    wm = WorkspaceManager(tmp_path)
    wm.ensure_kb_dir("proj_test", "kb_abc")
    ws = wm.create_build_workspace("proj_test", "kb_abc", "job_xyz")

    assert (ws / "input").is_dir()
    assert (ws / "out").is_dir()
    assert (ws / "logs").is_dir()
    assert (ws / "metadata").is_dir()


def test_source_dir_path(tmp_path: Path):
    wm = WorkspaceManager(tmp_path)
    d = wm.source_dir("proj_test", "src_123")
    assert d == tmp_path / "projects" / "proj_test" / "sources" / "src_123"
```

- [ ] **Step 3: 运行测试**

```bash
cd backend && python3 -m pytest tests/test_workspace_manager.py -v
```

- [ ] **Step 4: 提交**

```bash
git add backend/app/runner/workspace.py backend/tests/test_workspace_manager.py
git commit -m "refactor: rewrite WorkspaceManager for project-level directory structure"
```

---

### Task 6: SourceMaterializer 重写

**Files:**
- Modify: `backend/app/runner/source_materializer.py`

- [ ] **Step 1: 重写 materializer**

```python
# backend/app/runner/source_materializer.py
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

        # Stage 0: validate_boundary — refuse external paths
        if source_ref:
            resolved = Path(source_ref).resolve()
            try:
                resolved.relative_to(self.sources_root.resolve())
            except ValueError:
                # source_ref 不在 sources/ 内 → 硬拒绝
                source_dir.mkdir(parents=True, exist_ok=True)
                (source_dir / ".materialize-error").write_text(
                    f"source_ref '{source_ref}' is outside project sources/ boundary"
                )
                return source_dir

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

        # Write meta
        (source_dir / ".source-meta").write_text(str(source), encoding="utf-8")

        return source_dir

    def check_for_updates(self, source: dict) -> bool:
        """Check if source has remote changes. Returns True if rebuild needed."""
        source_id = source["id"]
        source_dir = self.sources_root / source_id
        git_dir = source_dir / ".git"
        if not git_dir.exists():
            return False  # non-git source, no auto-detect

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

    # --- internals ---

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
```

- [ ] **Step 2: 更新已有测试**

更新 `backend/tests/test_source_materializer.py`，适配新签名 `materialize(source)`（单 source dict 参数，返回 Path）：

```python
from pathlib import Path
from app.runner.source_materializer import SourceMaterializer


def test_copies_markdown_dir(tmp_path: Path):
    from pathlib import Path
    import tempfile

    # Create temp source directory
    src_dir = Path(tempfile.mkdtemp())
    (src_dir / "README.md").write_text("# Hello")
    (src_dir / "sub").mkdir()
    (src_dir / "sub" / "note.txt").write_text("world")

    project_root = tmp_path / "projects" / "proj_test"
    project_root.mkdir(parents=True)
    (project_root / "sources").mkdir()

    mat = SourceMaterializer("proj_test", project_root)
    result = mat.materialize({
        "id": "src_1",
        "type": "markdown_dir",
        "source_ref": str(src_dir),
    })

    assert result.is_dir()
    assert (result / "README.md").exists()
    assert (result / "sub" / "note.txt").exists()
    assert (result / ".source-meta").exists()


def test_handles_nonexistent_source_directory(tmp_path: Path):
    project_root = tmp_path / "projects" / "proj_test"
    project_root.mkdir(parents=True)
    (project_root / "sources").mkdir()

    mat = SourceMaterializer("proj_test", project_root)
    result = mat.materialize({
        "id": "src_1",
        "type": "markdown_dir",
        "source_ref": "/nonexistent/path",
    })
    assert result.exists()
    assert (result / ".materialize-error").exists()


def test_validate_boundary_refuses_external_path(tmp_path: Path):
    project_root = tmp_path / "projects" / "proj_test"
    project_root.mkdir(parents=True)
    (project_root / "sources").mkdir()

    mat = SourceMaterializer("proj_test", project_root)
    result = mat.materialize({
        "id": "src_1",
        "type": "markdown_dir",
        "source_ref": "/tmp",  # outside project
    })
    error_file = result / ".materialize-error"
    assert error_file.exists()
    assert "outside project sources" in error_file.read_text()
```

- [ ] **Step 3: 运行测试**

```bash
cd backend && python3 -m pytest tests/test_source_materializer.py -v
```

- [ ] **Step 4: 提交**

```bash
git add backend/app/runner/source_materializer.py backend/tests/test_source_materializer.py
git commit -m "refactor: rewrite SourceMaterializer with git support and boundary validation"
```

---

### Task 7: SourceService 加 git 操作

**Files:**
- Modify: `backend/app/services/source_service.py`

- [ ] **Step 1: create_source 中执行 materialize**

```python
# backend/app/services/source_service.py
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

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

        # Ensure project dir
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
            # Record commit if git source
            source_dir = self.wm.source_dir(project_id, source_id)
            if (source_dir / ".git").exists():
                import subprocess
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
```

- [ ] **Step 2: 验证**

```bash
cd backend && python3 -c "from app.services.source_service import SourceService; print('OK')"
```

- [ ] **Step 3: 提交**

```bash
git add backend/app/services/source_service.py
git commit -m "feat: materialize sources on registration with git support"
```

---

### Task 8: KnowledgeBaseService 加 obsidian/wiki git repo 初始化

**Files:**
- Modify: `backend/app/services/knowledge_base_service.py`

- [ ] **Step 1: create_knowledge_base 中 init git repos**

```python
# 在 create_knowledge_base 方法末尾，return 之前添加:
        from pathlib import Path
        from app.config import settings
        from app.runner.workspace import WorkspaceManager

        wm = WorkspaceManager(Path(settings.data_root))
        wm.ensure_project_dir(project_id)
        kb_root = wm.ensure_kb_dir(project_id, knowledge_base.id)

        # Init git repos for obsidian and wiki
        for name in ["obsidian", "wiki"]:
            repo_dir = kb_root / name
            if not (repo_dir / ".git").exists():
                import subprocess
                subprocess.run(
                    ["git", "init", str(repo_dir)],
                    capture_output=True, timeout=10,
                )
                (repo_dir / ".gitkeep").touch()
                subprocess.run(
                    ["git", "-C", str(repo_dir), "add", "-A"],
                    capture_output=True, timeout=10,
                )
                subprocess.run(
                    ["git", "-C", str(repo_dir), "commit", "-m", "initial"],
                    capture_output=True, timeout=10,
                )
```

- [ ] **Step 2: 验证**

```bash
cd backend && python3 -c "from app.services.knowledge_base_service import KnowledgeBaseService; print('OK')"
```

- [ ] **Step 3: 提交**

```bash
git add backend/app/services/knowledge_base_service.py
git commit -m "feat: init obsidian/wiki git repos on KB creation"
```

---

### Task 9: GraphifyRunner 加 Stage 0 + progress_callback + 路径适配

**Files:**
- Modify: `backend/app/runner/graphify_runner.py`

- [ ] **Step 1: 改 run() 签名加 progress_callback**

在 `run()` 方法签名中：
```python
    def run(
        self,
        job_id: str,
        kb_id: str,
        sources: list[dict],
        *,
        llm_config: dict | None = None,
        progress_callback: Callable[[str, str, ...], None] | None = None,
        project_id: str = "proj_default",
    ) -> dict:
```

在方法开头加入 Stage 0：

```python
        if progress_callback:
            progress_callback("validate_boundary", "running")

        # --- validate_boundary ---
        boundary_ok = True
        for source in sources:
            source_ref = source.get("source_ref", "")
            if source_ref:
                resolved = Path(source_ref).resolve()
                expected = self.workspace_manager.source_dir(project_id, source.get("id", "")).resolve()
                try:
                    resolved.relative_to(expected)
                except ValueError:
                    boundary_ok = False
                    stages_result.append(_stage("validate_boundary", "failed",
                        error=f"source_ref '{source_ref}' outside project boundary"))
                    break
        if not boundary_ok:
            return self._finalize(...)

        stages_result.append(_stage("validate_boundary", "completed"))
        if progress_callback:
            progress_callback("validate_boundary", "completed")
```

在每个 stage 完成后添加：
```python
        if progress_callback:
            progress_callback("materialize_sources", "completed", materialized_count=len(materialized))
```

**STAGES 列表更新**（加 `validate_boundary`）：
```python
STAGES = [
    "validate_boundary",
    "resolve_job_context",
    "materialize_sources",
    ...
]
```

**workspace 路径适配**：将 `self.workspace_manager.create(job_id)` 改为 `self.workspace_manager.create_build_workspace(project_id, kb_id, job_id)`。`input_root` / `out_dir` 改用 build workspace 内路径。`cache_root` 改为 `self.workspace_manager.cache_dir(project_id, kb_id)`。

- [ ] **Step 2: 更新 verify_query 为硬门禁**

在 graphify_runner.py 中替换原有 verify_query（原 L307-L317），改为三问硬门禁：

```python
        # --- verify_query (hard gate) ---
        from app.services.graphify_query_adapter import GraphifyQueryAdapter
        graph_json = out_dir / "graph.json"
        G_verify = GraphifyQueryAdapter.load_graph(str(graph_json))
        node_count = G_verify.number_of_nodes()
        edge_count = G_verify.number_of_edges()

        MIN_NODES = 10
        MIN_EDGES = 5
        VERIFY_QUESTIONS = [
            "列出这个知识库的主要模块",
            "总结核心架构",
            "关键组件之间的依赖关系",
        ]

        verify_errors = []
        if node_count < MIN_NODES:
            verify_errors.append(f"node_count {node_count} < {MIN_NODES}")
        if edge_count < MIN_EDGES:
            verify_errors.append(f"edge_count {edge_count} < {MIN_EDGES}")

        if not verify_errors:
            for q in VERIFY_QUESTIONS:
                try:
                    ans = GraphifyQueryAdapter.query(G_verify, q, mode="bfs", budget=1000)
                    if not ans or not ans.strip():
                        verify_errors.append(f"query '{q}' returned empty")
                    elif any(kw in ans.lower() for kw in ("error", "exception", "failed")):
                        verify_errors.append(f"query '{q}' returned error")
                except Exception as exc:
                    verify_errors.append(f"query '{q}' raised: {exc}")

        if verify_errors:
            query_ok = False
            stages_result.append(_stage("verify_query", "failed",
                error="; ".join(verify_errors)))
            return self._finalize(...)  # 硬阻断
        else:
            query_ok = True
            stages_result.append(_stage("verify_query", "completed"))
```

在 register_release 中，release manifest 写入 `releases/` 目录：
```python
        release_dir = self.workspace_manager.releases_dir(project_id, kb_id)
        release_json = release_dir / f"{release_id}.json"
        release_json.write_text(json.dumps({
            "release_id": release_id,
            "kb_id": kb_id,
            "build_job_id": job_id,
            "status": "completed",
            "artifact_paths": {
                "graph": f"kb/{kb_id}/builds/{job_id}/out/graph.json",
                "obsidian": f"kb/{kb_id}/obsidian/",
                "wiki": f"kb/{kb_id}/wiki/",
            }
        }, indent=2))
```

**rsync obsidian/wiki** 到持久 git repo（register_release 阶段）：
```python
        import subprocess
        obsidian_repo = self.workspace_manager.obsidian_dir(project_id, kb_id)
        subprocess.run(["rsync", "-a", "--delete",
            str(out_dir / "obsidian") + "/", str(obsidian_repo) + "/"],
            timeout=60)
        subprocess.run(["git", "-C", str(obsidian_repo), "add", "-A"], timeout=10)
        subprocess.run(["git", "-C", str(obsidian_repo), "commit", "-m", f"release {release_id}"],
            timeout=10)
        subprocess.run(["git", "-C", str(obsidian_repo), "tag", release_id], timeout=10)

        # wiki 同理
```

- [ ] **Step 3: 运行已有测试确保不破坏**

```bash
cd backend && python3 -m pytest tests/test_graphify_runner.py -v
```

- [ ] **Step 4: 提交**

```bash
git add backend/app/runner/graphify_runner.py
git commit -m "feat: add Stage 0 boundary validation, hard verify_query gate, progress_callback, release manifest"
```

---

### Task 10: GraphifyQueryAdapter 验证方法

**Files:**
- Modify: `backend/app/services/graphify_query_adapter.py`

- [ ] **Step 1: 加 verify 静态方法**

```python
    @staticmethod
    def verify_queries(G: "nx.Graph", questions: list[str] | None = None) -> tuple[bool, list[str]]:
        """Run verification queries. Returns (all_passed, errors)."""
        if questions is None:
            questions = [
                "列出这个知识库的主要模块",
                "总结核心架构",
                "关键组件之间的依赖关系",
            ]
        errors = []
        for q in questions:
            try:
                ans = GraphifyQueryAdapter.query(G, q, mode="bfs", budget=1000)
                if not ans or not ans.strip():
                    errors.append(f"query '{q}' returned empty")
                elif any(kw in ans.lower() for kw in ("error", "exception", "failed")):
                    errors.append(f"query '{q}' returned error")
            except Exception as exc:
                errors.append(f"query '{q}' raised: {exc}")
        return len(errors) == 0, errors
```

- [ ] **Step 2: 验证**

```bash
cd backend && python3 -c "from app.services.graphify_query_adapter import GraphifyQueryAdapter; print('OK')"
```

- [ ] **Step 3: 提交**

```bash
git add backend/app/services/graphify_query_adapter.py
git commit -m "feat: add verify_queries gate method to GraphifyQueryAdapter"
```

---

### Task 11: BuildService 异步执行

**Files:**
- Modify: `backend/app/services/build_service.py`

- [ ] **Step 1: 重写为 async + release manifest**

```python
import asyncio
import json
import logging
from datetime import UTC, datetime
from pathlib import Path
from typing import Callable
from uuid import uuid4

from sqlalchemy.orm import Session

from app.config import settings
from app.db.models.artifact_version import ArtifactVersion
from app.db.models.build_job import BuildJob
from app.db.models.release import Release
from app.repositories.build_jobs import BuildJobRepository
from app.repositories.knowledge_bases import KnowledgeBaseRepository
from app.repositories.releases import ReleaseRepository
from app.repositories.artifact_versions import ArtifactVersionRepository
from app.runner.graphify_runner import GraphifyRunner
from app.runner.workspace import WorkspaceManager
from app.schemas.build_job import BuildJobCreate

logger = logging.getLogger(__name__)


class BuildService:
    def __init__(self, session_factory=None, runner: GraphifyRunner | None = None):
        self._session_factory = session_factory
        self.runner = runner
        self.wm = WorkspaceManager(Path(settings.data_root))

    def create_build_job(self, kb_id: str, payload: BuildJobCreate, project_id: str = "proj_default") -> BuildJob:
        session = self._session_factory()
        repo = BuildJobRepository(session)
        kb_repo = KnowledgeBaseRepository(session)

        kb = kb_repo.get(kb_id)
        project_id = kb.project_id if kb else project_id

        now = datetime.now(UTC)
        build_job = BuildJob(
            id=f"job_{uuid4().hex[:12]}",
            knowledge_base_id=kb_id,
            build_type=payload.build_type,
            status="pending",
            current_stage=None,
            release_id=None,
            error_summary=None,
            created_at=now,
            started_at=now,
        )
        build_job = repo.create(build_job)
        sources = repo.list_sources(kb_id)
        session.close()
        return build_job, sources, project_id

    async def enqueue_build(self, job_id: str, kb_id: str, sources: list[dict],
                            llm_config: dict | None = None, project_id: str = "proj_default") -> None:
        """Fire-and-forget async build. Updates job status via progress callback."""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            self._sync_run_and_persist,
            job_id, kb_id, sources, llm_config, project_id,
        )

    def _sync_run_and_persist(self, job_id, kb_id, sources, llm_config, project_id):
        def on_progress(stage_name: str, status: str, **meta):
            self._update_job_stage(job_id, stage_name, status, meta)

        if self.runner is None:
            return

        result = self.runner.run(
            job_id=job_id,
            kb_id=kb_id,
            sources=sources,
            llm_config=llm_config,
            progress_callback=on_progress,
            project_id=project_id,
        )

        try:
            self._persist_result(job_id, kb_id, result, project_id)
        except Exception:
            logger.exception("Failed to persist build result for job %s", job_id)
            self._mark_job_failed(job_id, "Persistence error after runner completion")

    def _update_job_stage(self, job_id: str, stage_name: str, status: str, meta: dict):
        session = self._session_factory()
        try:
            repo = BuildJobRepository(session)
            job = repo.get(job_id)
            if job is None:
                return
            job.current_stage = stage_name
            if job.stages is None:
                job.stages = []
            # Update or append stage entry
            existing = next((s for s in job.stages if s.get("name") == stage_name), None)
            stage_entry = {"name": stage_name, "status": status, **meta}
            if existing:
                existing.update(stage_entry)
            else:
                job.stages.append(stage_entry)
            if status == "running" and job.status == "pending":
                job.status = "running"
            repo.update(job)
            session.commit()
        finally:
            session.close()

    def _persist_result(self, job_id: str, kb_id: str, result: dict, project_id: str):
        session = self._session_factory()
        try:
            repo = BuildJobRepository(session)
            job = repo.get(job_id)
            if job is None:
                return

            stages = result.get("stages", [])
            has_failure = any(s.get("status") == "failed" for s in stages)
            job.status = "failed" if has_failure else "completed"
            job.finished_at = datetime.now(UTC)
            job.stages = stages

            release_dict = result.get("release")
            if release_dict is not None:
                created_at = release_dict.get("created_at", datetime.now(UTC))
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at)
                release = Release(
                    id=release_dict["id"],
                    knowledge_base_id=release_dict.get("knowledge_base_id", kb_id),
                    build_job_id=release_dict.get("build_job_id", job_id),
                    version=release_dict.get("version", "unknown"),
                    status=release_dict.get("status", "draft"),
                    artifact_status=release_dict.get("artifact_status", {}),
                    created_at=created_at,
                )
                session.add(release)
                job.release_id = release.id

                for a in result.get("artifacts", []):
                    session.add(ArtifactVersion(
                        id=a["id"],
                        release_id=a.get("release_id", release.id),
                        artifact_type=a["artifact_type"],
                        artifact_status=a.get("artifact_status", "ready"),
                        artifact_path=a.get("artifact_path", ""),
                        artifact_meta=a.get("artifact_meta", {}),
                    ))

                if result.get("graph_ready"):
                    kb_repo = KnowledgeBaseRepository(session)
                    kb = kb_repo.get(kb_id)
                    if kb is not None:
                        kb.active_release_id = release.id
                        kb.updated_at = datetime.now(UTC)

            session.commit()
        finally:
            session.close()

    def _mark_job_failed(self, job_id: str, error: str):
        session = self._session_factory()
        try:
            repo = BuildJobRepository(session)
            job = repo.get(job_id)
            if job:
                job.status = "failed"
                job.error_summary = error
                job.finished_at = datetime.now(UTC)
                repo.update(job)
                session.commit()
        finally:
            session.close()

    def _read_llm_config(self, kb_id: str) -> dict:
        session = self._session_factory()
        try:
            kb_repo = KnowledgeBaseRepository(session)
            kb = kb_repo.get(kb_id)
            if kb is None:
                return {}
            return {
                "llm_backend": kb.llm_backend,
                "llm_api_key_ref": kb.llm_api_key_ref,
                "llm_model_override": kb.llm_model_override,
                "llm_extraction_budget": kb.llm_extraction_budget,
                "llm_base_url_override": kb.llm_base_url_override,
            }
        finally:
            session.close()

    def can_activate_release(self, release: dict) -> bool:
        return release.get("artifact_status", {}).get("graph") in ("ready", "degraded")
```

- [ ] **Step 2: 验证**

```bash
cd backend && python3 -c "from app.services.build_service import BuildService; print('OK')"
```

- [ ] **Step 3: 提交**

```bash
git add backend/app/services/build_service.py
git commit -m "refactor: async enqueue_build with progress callback and release manifest persistence"
```

---

### Task 12: Build jobs route 异步化

**Files:**
- Modify: `backend/app/api/routes/build_jobs.py`

- [ ] **Step 1: enqueue 改为异步，返回 202**

```python
@router.post("/knowledge-bases/{kb_id}/builds", response_model=BuildJobRead, status_code=status.HTTP_202_ACCEPTED)
async def create_build_job(  # async
    kb_id: str,
    payload: BuildJobCreate,
    session: Session = Depends(get_session),
) -> BuildJobRead:
    runner = _make_runner()
    service = BuildService(session_factory=SessionLocal, runner=runner)

    job, sources, project_id = service.create_build_job(kb_id, payload)
    llm_config = service._read_llm_config(kb_id)

    # Fire background task - don't await
    import asyncio
    asyncio.create_task(service.enqueue_build(
        job.id, kb_id, sources, llm_config=llm_config, project_id=project_id
    ))

    return BuildJobRead(
        job_id=job.id,
        knowledge_base_id=job.knowledge_base_id,
        build_type=job.build_type,
        triggered_by=payload.triggered_by,
        reason=payload.reason,
        status=job.status,
        release_id=None,
        started_at=job.started_at.isoformat(),
        finished_at=None,
        error_summary=None,
        stages=job.stages,
    )
```

`_make_runner()` 中适配新 WorkspaceManager：
```python
def _make_runner() -> GraphifyRunner:
    from app.config import settings
    data_root = Path(settings.data_root)
    data_root.mkdir(parents=True, exist_ok=True)
    return GraphifyRunner(WorkspaceManager(data_root))
```

- [ ] **Step 2: 验证**

```bash
cd backend && python3 -c "from app.api.routes.build_jobs import router; print('OK')"
```

- [ ] **Step 3: 提交**

```bash
git add backend/app/api/routes/build_jobs.py
git commit -m "feat: async build enqueue with 202 Accepted and background execution"
```

---

### Task 13: main.py 适配

**Files:**
- Modify: `backend/app/main.py`

- [ ] **Step 1: StaticFiles 路径 + startup git poll**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.api.routes import router
from app.config import settings
from app.db.base import Base, engine
from app.mcp.routes import router as mcp_router

app = FastAPI(title=settings.app_name)
app.include_router(router)
app.include_router(mcp_router)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Serve data/ at project root
data_path = Path(settings.data_root)
app.mount("/data", StaticFiles(directory=str(data_path)), name="artifacts")


@app.on_event("startup")
def startup_create_tables():
    Base.metadata.create_all(bind=engine)


@app.on_event("startup")
async def startup_git_poll():
    """Start background git polling for sources with git_poll_interval_minutes > 0."""
    import asyncio
    asyncio.create_task(_git_poll_loop())


async def _git_poll_loop():
    """Background loop that polls git sources for changes."""
    import asyncio
    from app.config import settings
    from app.db.base import SessionLocal
    from app.repositories.sources import SourceRepository
    from app.runner.source_materializer import SourceMaterializer
    from app.runner.workspace import WorkspaceManager
    from pathlib import Path

    wm = WorkspaceManager(Path(settings.data_root))

    while True:
        await asyncio.sleep(60)  # Check every 60s
        session = SessionLocal()
        try:
            repo = SourceRepository(session)
            # Get all sources with polling enabled
            # For simplicity, iterate all projects/sources
            sources = repo.list_all_polling()  # need to add this method
            for src in sources:
                if src.git_poll_interval_minutes <= 0:
                    continue
                mat = SourceMaterializer(src.project_id, wm.project_root(src.project_id))
                if mat.check_for_updates({
                    "id": src.id, "type": src.type, "source_ref": src.source_ref,
                    "git_tracking_branch": src.git_tracking_branch,
                }):
                    mat.pull_updates({
                        "id": src.id, "type": src.type, "source_ref": src.source_ref,
                        "git_tracking_branch": src.git_tracking_branch,
                    })
        except Exception:
            pass
        finally:
            session.close()
```

- [ ] **Step 2: 给 SourceRepository 加 list_all_polling 方法**

```python
# backend/app/repositories/sources.py 中新增方法:
    def list_all_polling(self) -> list:
        from app.db.models.source import Source
        return self.session.query(Source).filter(
            Source.git_poll_interval_minutes > 0
        ).all()
```

- [ ] **Step 3: 验证**

```bash
cd backend && python3 -c "from app.main import app; print('OK')"
```

- [ ] **Step 4: 提交**

```bash
git add backend/app/main.py backend/app/repositories/sources.py
git commit -m "feat: serve data/ at project root, add git poll background task on startup"
```

---

### Task 14: 前端 types + polling

**Files:**
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/app/build-jobs/[jobId]/page.tsx`
- Modify: `frontend/src/components/build-timeline.tsx`

- [ ] **Step 1: 更新 types.ts**

```typescript
// frontend/src/lib/types.ts
// Source 加 git 字段:
export interface Source {
  // ...existing fields...
  git_tracking_branch: string;
  git_poll_interval_minutes: number;
  git_last_commit: string | null;
}

// BuildJob 加 current_stage:
export interface BuildJob {
  // ...existing fields...
  current_stage: string | null;
}
```

- [ ] **Step 2: build job 页面加轮询**

```tsx
// frontend/src/app/build-jobs/[jobId]/page.tsx
// 改为 client component:
"use client";

import { useEffect, useState } from "react";
// ... use useEffect with setInterval 2s polling GET /api/build-jobs/{jobId}
// 当 job.status === "completed" || "failed" → clearInterval

// 在 STAGE_ORDER 前加 validate_boundary:
const STAGE_ORDER = [
  "validate_boundary",     // 新
  "resolve_job_context",
  // ...
];
const STAGE_LABELS: Record<string, string> = {
  validate_boundary: "边界校验",    // 新
  // ...
};
```

- [ ] **Step 3: build-timeline 接真实数据**

```tsx
// frontend/src/components/build-timeline.tsx
// stage.log 替换为动态内容: 展示 file_count / error / node_count 等 meta 字段
```

- [ ] **Step 4: 验证 TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 5: 提交**

```bash
git add frontend/src/lib/types.ts frontend/src/app/build-jobs/\[jobId\]/page.tsx frontend/src/components/build-timeline.tsx
git commit -m "feat: add polling to build job detail page, real stage data on timeline"
```

---

### Task 15: 测试更新

**Files:**
- Modify: `backend/tests/conftest.py` (若有全局 fixture 需要适配)
- Modify: `backend/tests/test_build_api.py`
- Modify: `backend/tests/test_build_service_internals.py`

- [ ] **Step 1: 更新 conftest.py data_root fixture**

```python
# backend/tests/conftest.py
import pytest
from pathlib import Path

@pytest.fixture
def data_root(tmp_path: Path) -> Path:
    return tmp_path / "data"
```

- [ ] **Step 2: 更新相关测试适配新 API**

检查 `test_build_api.py`、`test_build_service_internals.py` 等引用了旧 WorkspaceManager / BuildService 签名的测试，更新。

- [ ] **Step 3: 运行全部测试**

```bash
cd backend && python3 -m pytest tests/ -v --ignore=tests/test_graphify_runner.py
# test_graphify_runner 需要 graphify 依赖 + LLM key，跳过集成部分
```

- [ ] **Step 4: 提交**

```bash
git add backend/tests/
git commit -m "test: update tests for new directory structure and async build flow"
```

---

## 验证

1. `cd backend && python3 -m pytest tests/ -v` — 全部测试通过
2. `cd frontend && npx tsc --noEmit` — 0 errors
3. 手动 E2E：创建 project → 注册 source → 创建 KB → POST /build-jobs → 轮询 GET /build-jobs/{id} → 确认 release 激活 → MCP query
