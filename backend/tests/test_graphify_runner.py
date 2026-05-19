from pathlib import Path

from app.runner.graphify_runner import GraphifyRunner
from app.runner.workspace import WorkspaceManager


def test_workspace_manager_creates_expected_layout(tmp_path: Path) -> None:
    manager = WorkspaceManager(root=tmp_path)

    workspace = manager.create("job_2026_05_19_0021")

    assert (workspace / "source-materials").exists()
    assert (workspace / "graphify-input").exists()
    assert (workspace / "graphify-out").exists()
    assert (workspace / "obsidian-enhanced").exists()
    assert (workspace / "logs").exists()
    assert (workspace / "metadata").exists()


def test_graphify_runner_returns_stage_log(tmp_path: Path) -> None:
    manager = WorkspaceManager(root=tmp_path)
    runner = GraphifyRunner(workspace_manager=manager)

    result = runner.run(
        job_id="job_2026_05_19_0021",
        kb_id="kb_checkout_core",
        sources=[{"id": "src_checkout_repo"}],
    )

    stage_names = [s["name"] for s in result["stages"]]
    # validate is now non-blocking — pipeline continues through all 16 stages.
    assert stage_names[:6] == [
        "resolve_job_context",
        "materialize_sources",
        "normalize_inputs",
        "extract",
        "build",
        "validate",
    ]
    # validate should be degraded (non-blocking), not failed
    validate_stage = result["stages"][5]
    assert validate_stage["name"] == "validate"
    assert validate_stage["status"] in ("completed", "degraded", "failed")
    assert "release" in result
    assert "stats" in result


def test_source_materializer_creates_source_dirs(tmp_path: Path) -> None:
    manager = WorkspaceManager(root=tmp_path)
    runner = GraphifyRunner(workspace_manager=manager)

    runner.run(
        job_id="job_2026_05_19_0021",
        kb_id="kb_checkout_core",
        sources=[
            {"id": "src_checkout_repo"},
            {"id": "src_orders_service"},
        ],
    )

    workspace = tmp_path / "job_2026_05_19_0021" / "source-materials"
    assert (workspace / "src_checkout_repo").exists()
    assert (workspace / "src_orders_service").exists()


def test_normalize_inputs_preserves_directory_structure(tmp_path: Path) -> None:
    src_dir = tmp_path / "test_src"
    (src_dir / "sub").mkdir(parents=True)
    (src_dir / "README.md").write_text("# Test\n", encoding="utf-8")
    (src_dir / "sub").joinpath("a.py").write_text("x=1\n", encoding="utf-8")

    manager = WorkspaceManager(root=tmp_path / "ws")
    runner = GraphifyRunner(workspace_manager=manager)

    runner.run(
        job_id="job_normalize_test",
        kb_id="kb_test",
        sources=[{"id": "src_test", "type": "markdown_dir", "source_ref": str(src_dir)}],
    )

    input_root = tmp_path / "ws" / "job_normalize_test" / "graphify-input"
    assert (input_root / "README.md").exists()
    assert (input_root / "sub" / "a.py").exists()


def test_normalize_inputs_handles_multiple_sources(tmp_path: Path) -> None:
    src_a = tmp_path / "src_a"
    src_a.mkdir()
    (src_a / "shared.py").write_text("# from A\n", encoding="utf-8")
    (src_a / "only_a.py").write_text("# A only\n", encoding="utf-8")

    src_b = tmp_path / "src_b"
    src_b.mkdir()
    (src_b / "shared.py").write_text("# from B\n", encoding="utf-8")
    (src_b / "only_b.py").write_text("# B only\n", encoding="utf-8")

    manager = WorkspaceManager(root=tmp_path / "ws")
    runner = GraphifyRunner(workspace_manager=manager)

    runner.run(
        job_id="job_multi_src",
        kb_id="kb_test",
        sources=[
            {"id": "src_a", "type": "markdown_dir", "source_ref": str(src_a)},
            {"id": "src_b", "type": "markdown_dir", "source_ref": str(src_b)},
        ],
    )

    # Both sources go into shared graphify-input; second source's shared.py wins (last write)
    input_root = tmp_path / "ws" / "job_multi_src" / "graphify-input"
    assert (input_root / "only_a.py").exists()
    assert (input_root / "only_b.py").exists()
    assert (input_root / "shared.py").exists()


def test_collect_artifacts_returns_eight_types(tmp_path: Path) -> None:
    out_dir = tmp_path / "graphify-out"
    out_dir.mkdir()
    runner = GraphifyRunner(workspace_manager=WorkspaceManager(root=tmp_path))

    artifacts = runner._collect_artifacts("rel_test", "kb_test", out_dir, True, True, True, True)

    types = {a["artifact_type"] for a in artifacts}
    assert types == {"graph", "report", "html", "obsidian_vault", "wiki", "svg", "graphml", "logs"}
    assert all(a["release_id"] == "rel_test" for a in artifacts)
    assert all(a["id"].startswith("art_rel_test_") for a in artifacts)


def test_build_artifact_status_maps_ready_and_degraded() -> None:
    artifacts = [
        {"artifact_type": "graph", "artifact_status": "ready"},
        {"artifact_type": "report", "artifact_status": "degraded"},
        {"artifact_type": "logs", "artifact_status": "ready"},
    ]

    status = GraphifyRunner._build_artifact_status(artifacts, semantic_ok=True, query_ok=True)

    assert status == {"graph": "ready", "report": "degraded", "logs": "ready"}


def test_build_artifact_status_flags_query_degraded() -> None:
    artifacts = [{"artifact_type": "graph", "artifact_status": "ready"}]

    status = GraphifyRunner._build_artifact_status(artifacts, semantic_ok=True, query_ok=False)

    assert status["query"] == "degraded"


def test_build_artifact_status_flags_graph_degraded_when_semantic_missing() -> None:
    artifacts = [{"artifact_type": "graph", "artifact_status": "ready"}]

    status = GraphifyRunner._build_artifact_status(artifacts, semantic_ok=False, query_ok=True)

    assert status["graph"] == "degraded"


def test_sanitize_extraction_removes_orphan_edges() -> None:
    extraction = {
        "nodes": [{"id": "a"}, {"id": "b"}],
        "edges": [
            {"source": "a", "target": "b", "type": "calls"},
            {"source": "b", "target": "typing", "type": "imports"},
        ],
    }

    cleaned = GraphifyRunner._sanitize_extraction(extraction)

    assert len(cleaned["edges"]) == 1
    assert cleaned["edges"][0]["target"] == "b"


def test_sanitize_extraction_handles_empty_edges() -> None:
    extraction = {"nodes": [{"id": "a"}], "edges": []}
    cleaned = GraphifyRunner._sanitize_extraction(extraction)
    assert cleaned["edges"] == []


def test_sanitize_extraction_handles_empty_nodes() -> None:
    extraction = {"nodes": [], "edges": [{"source": "a", "target": "b"}]}
    cleaned = GraphifyRunner._sanitize_extraction(extraction)
    assert len(cleaned["edges"]) == 1  # No nodes to validate against, pass through
