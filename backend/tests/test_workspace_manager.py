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
