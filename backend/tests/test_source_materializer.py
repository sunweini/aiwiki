from pathlib import Path
from app.runner.source_materializer import SourceMaterializer


def test_copies_markdown_dir(tmp_path: Path):
    project_root = tmp_path / "projects" / "proj_test"
    project_root.mkdir(parents=True)
    (project_root / "sources").mkdir()

    # Create source inside the project boundary so boundary validation passes
    src_dir = project_root / "sources" / "test_input"
    src_dir.mkdir(parents=True)
    (src_dir / "README.md").write_text("# Hello")
    (src_dir / "sub").mkdir()
    (src_dir / "sub" / "note.txt").write_text("world")

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
    assert (result / ".materialize-error").exists() or (result / ".source-meta").exists()


def test_materialize_empty_source_ref_creates_meta(tmp_path: Path):
    project_root = tmp_path / "projects" / "proj_test"
    project_root.mkdir(parents=True)
    (project_root / "sources").mkdir()

    mat = SourceMaterializer("proj_test", project_root)
    result = mat.materialize({
        "id": "src_2",
        "type": "markdown_dir",
        "source_ref": "",
    })
    assert result.exists()
    assert (result / ".source-meta").exists()
