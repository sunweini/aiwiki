from pathlib import Path

from app.runner.source_materializer import SourceMaterializer


def test_copies_markdown_dir_preserving_structure(tmp_path: Path) -> None:
    src_dir = tmp_path / "my_docs"
    (src_dir / "sub").mkdir(parents=True)
    (src_dir / "README.md").write_text("# Docs\n", encoding="utf-8")
    (src_dir / "sub").joinpath("api.py").write_text("def foo(): pass\n", encoding="utf-8")

    materializer = SourceMaterializer(workspace_root=tmp_path / "ws")

    materialized = materializer.materialize(
        job_id="job_1",
        sources=[{"id": "src_docs", "type": "markdown_dir", "source_ref": str(src_dir)}],
    )

    dest = materialized[0]
    assert dest.is_dir()
    assert (dest / "README.md").exists()
    assert (dest / "sub" / "api.py").exists()


def test_handles_nonexistent_source_gracefully(tmp_path: Path) -> None:
    materializer = SourceMaterializer(workspace_root=tmp_path / "ws")

    materialized = materializer.materialize(
        job_id="job_1",
        sources=[{"id": "src_ghost", "type": "markdown_dir", "source_ref": "/tmp/definitely_does_not_exist_42"}],
    )

    dest = materialized[0]
    assert dest.is_dir()
    # Non-existent paths: is_dir() returns False, writes .source-meta in else branch
    assert (dest / ".source-meta").exists()
