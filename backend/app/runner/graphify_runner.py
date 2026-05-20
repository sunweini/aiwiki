import json
import logging
import os
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Callable
from uuid import uuid4

from app.runner.obsidian_enhancer import ObsidianEnhancer
from app.runner.source_materializer import SourceMaterializer
from app.runner.workspace import WorkspaceManager

logger = logging.getLogger(__name__)

STAGES = [
    "validate_boundary",
    "resolve_job_context",
    "materialize_sources",
    "normalize_inputs",
    "extract",
    "build",
    "validate",
    "cluster",
    "analyze",
    "report",
    "export_obsidian",
    "export_wiki",
    "export_visual",
    "enhance_obsidian",
    "verify_query",
    "register_release",
    "activate_or_roll_back",
]


class GraphifyRunner:
    # Mirrors graphify.detect._SKIP_DIRS — directories never descended into
    _SKIP_DIRS = {
        "venv", ".venv", "env", ".env",
        "node_modules", "__pycache__", ".git",
        "dist", "build", "target", "out",
        "site-packages", "lib64",
        ".pytest_cache", ".mypy_cache", ".ruff_cache",
        ".tox", ".eggs", "*.egg-info",
        "graphify-out",  # never treat own output as source input (graphify #524)
    }

    # Mirrors graphify.detect._SKIP_FILES — generated/lock files never useful
    _SKIP_FILES = {
        "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
        "Cargo.lock", "poetry.lock", "Gemfile.lock",
        "composer.lock", "go.sum", "go.work.sum",
    }

    def __init__(self, workspace_manager: WorkspaceManager) -> None:
        self.workspace_manager = workspace_manager
        self.materializer = SourceMaterializer(workspace_manager.root)
        self.enhancer = ObsidianEnhancer()
        self._graphify_available: bool | None = None

    # ------------------------------------------------------------------
    # public entry point
    # ------------------------------------------------------------------

    def run(
        self,
        job_id: str,
        kb_id: str,
        sources: list[dict],
        *,
        llm_config: dict | None = None,
        progress_callback: Callable[[str, str], None] | None = None,
        project_id: str = "proj_default",
    ) -> dict:
        llm_config = llm_config or {}
        start_time = time.monotonic()
        stages_result: list[dict] = []
        artifact_entries: list[dict] = []
        stats: dict = {}
        graph_ready = False
        release: dict | None = None

        ws = self.workspace_manager.create_build_workspace(project_id, kb_id, job_id)
        log_dir = ws / "logs"

        def _stage(name: str, status: str, **kw) -> dict:
            return {"name": name, "status": status, **kw}

        # --- validate_boundary ---
        if progress_callback:
            progress_callback("validate_boundary", "running")
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
            return self._finalize(job_id, kb_id, stages_result, artifact_entries, stats,
                                  graph_ready=False, release=None, start_time=start_time)
        stages_result.append(_stage("validate_boundary", "completed"))
        if progress_callback:
            progress_callback("validate_boundary", "completed")

        # --- resolve_job_context ---
        stages_result.append(_stage("resolve_job_context", "completed"))
        if progress_callback:
            progress_callback("resolve_job_context", "completed")

        # --- materialize_sources ---
        if progress_callback:
            progress_callback("materialize_sources", "running")
        try:
            materialized = self.materializer.materialize(job_id, sources)
            stages_result.append(_stage("materialize_sources", "completed", materialized_count=len(materialized)))
            if progress_callback:
                progress_callback("materialize_sources", "completed", materialized_count=len(materialized))
        except Exception as exc:
            logger.exception("materialize_sources failed")
            stages_result.append(_stage("materialize_sources", "failed", error=str(exc)))
            if progress_callback:
                progress_callback("materialize_sources", "failed", error=str(exc))
            return self._finalize(job_id, kb_id, stages_result, artifact_entries, stats, graph_ready=False, release=None, start_time=start_time)

        # --- normalize_inputs ---
        if progress_callback:
            progress_callback("normalize_inputs", "running")
        input_root = ws / "graphify-input"
        input_files: list[Path] = []
        skipped_noise: int = 0
        skipped_sensitive: int = 0
        try:
            for p in materialized:
                if p.is_dir():
                    for f in p.rglob("*"):
                        if f.is_file():
                            # Skip noise dirs (graphify._is_noise_dir equivalent)
                            if any(part in self._SKIP_DIRS or part.endswith(".egg-info")
                                   for part in f.parts):
                                skipped_noise += 1
                                continue
                            # Skip noise files (lock files, etc.)
                            if f.name in self._SKIP_FILES:
                                skipped_noise += 1
                                continue
                            # Skip sensitive files (secrets, keys, credentials)
                            if self._is_sensitive(f.name):
                                skipped_sensitive += 1
                                continue
                            rel = f.relative_to(p)
                            dest = input_root / rel
                            dest.parent.mkdir(parents=True, exist_ok=True)
                            if not dest.exists():
                                dest.symlink_to(f.resolve())
                            input_files.append(dest)
                elif p.is_file():
                    if p.name in self._SKIP_FILES or self._is_sensitive(p.name):
                        skipped_noise += 1
                        continue
                    dest = input_root / p.name
                    if not dest.exists():
                        dest.symlink_to(p.resolve())
                    input_files.append(dest)
            stages_result.append(_stage(
                "normalize_inputs", "completed",
                file_count=len(input_files),
                skipped_noise=skipped_noise,
                skipped_sensitive=skipped_sensitive,
            ))
            if progress_callback:
                progress_callback("normalize_inputs", "completed",
                    file_count=len(input_files),
                    skipped_noise=skipped_noise,
                    skipped_sensitive=skipped_sensitive)
        except Exception as exc:
            logger.exception("normalize_inputs failed")
            stages_result.append(_stage("normalize_inputs", "failed", error=str(exc)))
            if progress_callback:
                progress_callback("normalize_inputs", "failed", error=str(exc))
            return self._finalize(job_id, kb_id, stages_result, artifact_entries, stats, graph_ready=False, release=None, start_time=start_time)

        # --- extract ---
        extraction: dict = {}
        semantic_ok = True
        if progress_callback:
            progress_callback("extract", "running")
        if not input_files:
            stages_result.append(_stage("extract", "failed", error="No input files after normalization"))
            if progress_callback:
                progress_callback("extract", "failed", error="No input files after normalization")
            return self._finalize(job_id, kb_id, stages_result, artifact_entries, stats, graph_ready=False, release=None, start_time=start_time)
        if not self._check_graphify():
            stages_result.append(_stage("extract", "failed", error="graphify module not available"))
            if progress_callback:
                progress_callback("extract", "failed", error="graphify module not available")
            return self._finalize(job_id, kb_id, stages_result, artifact_entries, stats, graph_ready=False, release=None, start_time=start_time)
        try:
            extraction = self._run_extract(input_files, ws, llm_config, project_id=project_id, kb_id=kb_id)
            stages_result.append(_stage("extract", "completed", node_count=len(extraction.get("nodes", []))))
            if progress_callback:
                progress_callback("extract", "completed", node_count=len(extraction.get("nodes", [])))
        except Exception as exc:
            logger.exception("extract failed")
            stages_result.append(_stage("extract", "failed", error=str(exc)))
            if progress_callback:
                progress_callback("extract", "failed", error=str(exc))
            return self._finalize(job_id, kb_id, stages_result, artifact_entries, stats, graph_ready=False, release=None, start_time=start_time)

        if not llm_config.get("llm_backend"):
            semantic_ok = False
            logger.warning("No LLM backend configured; graph will be AST-only (degraded)")
        elif not (llm_config.get("api_key") or llm_config.get("api_key_ref") or llm_config.get("llm_api_key_ref")):
            semantic_ok = False
            logger.warning("No LLM key configured; graph will be AST-only (degraded)")

        # --- sanitize ---
        extraction = self._sanitize_extraction(extraction)

        # --- build ---
        if progress_callback:
            progress_callback("build", "running")
        G = None
        try:
            import graphify.build
            G = graphify.build.build([extraction], directed=False, dedup=True)
            stats["node_count"] = G.number_of_nodes()
            stats["edge_count"] = G.number_of_edges()
            stages_result.append(_stage("build", "completed", node_count=stats["node_count"], edge_count=stats["edge_count"]))
            if progress_callback:
                progress_callback("build", "completed", node_count=stats["node_count"], edge_count=stats["edge_count"])
        except Exception as exc:
            logger.exception("build failed")
            stages_result.append(_stage("build", "failed", error=str(exc)))
            if progress_callback:
                progress_callback("build", "failed", error=str(exc))
            return self._finalize(job_id, kb_id, stages_result, artifact_entries, stats, graph_ready=False, release=None, start_time=start_time)

        # --- validate ---
        if progress_callback:
            progress_callback("validate", "running")
        try:
            import graphify.validate
            graphify.validate.assert_valid(extraction)
            stages_result.append(_stage("validate", "completed"))
            if progress_callback:
                progress_callback("validate", "completed")
        except Exception as exc:
            logger.warning("validate failed (non-blocking): %s", exc)
            stages_result.append(_stage("validate", "degraded", error=str(exc)))
            if progress_callback:
                progress_callback("validate", "degraded", error=str(exc))

        # --- cluster ---
        if progress_callback:
            progress_callback("cluster", "running")
        communities: dict[int, list[str]] = {}
        cohesion: dict[int, float] = {}
        try:
            import graphify.cluster
            communities = graphify.cluster.cluster(G)
            cohesion = graphify.cluster.score_all(G, communities)
            stats["cluster_count"] = len(communities)
            stages_result.append(_stage("cluster", "completed", cluster_count=len(communities)))
            if progress_callback:
                progress_callback("cluster", "completed", cluster_count=len(communities))
        except Exception as exc:
            logger.warning("cluster failed (non-blocking): %s", exc)
            stages_result.append(_stage("cluster", "degraded", error=str(exc)))
            if progress_callback:
                progress_callback("cluster", "degraded", error=str(exc))

        # --- analyze ---
        if progress_callback:
            progress_callback("analyze", "running")
        god_nodes_list: list[dict] = []
        surprise_list: list[dict] = []
        suggested_qs: list[dict] = []
        community_labels: dict[int, str] = {}
        try:
            import graphify.analyze
            god_nodes_list = graphify.analyze.god_nodes(G, top_n=10) if communities else []
            surprise_list = graphify.analyze.surprising_connections(G, communities, top_n=5) if communities else []
            community_labels = {cid: max(nodes, key=len) if nodes else f"community_{cid}" for cid, nodes in communities.items()} if communities else {}
            suggested_qs = graphify.analyze.suggest_questions(G, communities, community_labels, top_n=7) if communities else []
            stages_result.append(_stage("analyze", "completed", god_node_count=len(god_nodes_list)))
            if progress_callback:
                progress_callback("analyze", "completed", god_node_count=len(god_nodes_list))
        except Exception as exc:
            logger.warning("analyze failed (non-blocking): %s", exc)
            stages_result.append(_stage("analyze", "degraded", error=str(exc)))
            if progress_callback:
                progress_callback("analyze", "degraded", error=str(exc))

        # --- report ---
        if progress_callback:
            progress_callback("report", "running")
        out_dir = ws / "graphify-out"
        report_md = ""
        report_ok = True
        if communities:
            try:
                import graphify.report
                import graphify.export as gexport
                report_md = graphify.report.generate(
                    G, communities, cohesion, community_labels,
                    god_nodes_list, surprise_list,
                    {"total_files": len(input_files), "total_words": 0, "warning": ""}, {},
                    out_dir,
                    suggested_qs, min_community_size=3,
                )
                (out_dir / "GRAPH_REPORT.md").write_text(report_md, encoding="utf-8")
                gexport.to_html(G, communities, str(out_dir / "graph.html"), community_labels, None)
                stages_result.append(_stage("report", "completed"))
                if progress_callback:
                    progress_callback("report", "completed")
            except Exception as exc:
                logger.warning("report generation failed (non-blocking): %s", exc)
                report_ok = False
                stages_result.append(_stage("report", "degraded", error=str(exc)))
                if progress_callback:
                    progress_callback("report", "degraded", error=str(exc))
        else:
            stages_result.append(_stage("report", "degraded", error="no communities to report"))
            if progress_callback:
                progress_callback("report", "degraded", error="no communities to report")

        # Always persist the core graph artifact regardless of report success.
        try:
            import graphify.export as gexport
            gexport.to_json(G, communities, str(out_dir / "graph.json"))
        except Exception as exc:
            logger.warning("graph.json export failed: %s", exc)

        # --- export_obsidian ---
        if progress_callback:
            progress_callback("export_obsidian", "running")
        vault_ok = True
        try:
            import graphify.export as gexport
            vault_count = gexport.to_obsidian(G, communities, str(out_dir / "obsidian"), community_labels, cohesion)
            stages_result.append(_stage("export_obsidian", "completed", note_count=vault_count))
            if progress_callback:
                progress_callback("export_obsidian", "completed", note_count=vault_count)
        except Exception as exc:
            logger.warning("obsidian export failed (non-blocking): %s", exc)
            vault_ok = False
            stages_result.append(_stage("export_obsidian", "degraded", error=str(exc)))
            if progress_callback:
                progress_callback("export_obsidian", "degraded", error=str(exc))

        # --- export_wiki ---
        if progress_callback:
            progress_callback("export_wiki", "running")
        wiki_ok = True
        try:
            import graphify.wiki
            wiki_count = graphify.wiki.to_wiki(G, communities, str(out_dir / "wiki"), community_labels, cohesion, god_nodes_list)
            stages_result.append(_stage("export_wiki", "completed", page_count=wiki_count))
            if progress_callback:
                progress_callback("export_wiki", "completed", page_count=wiki_count)
        except Exception as exc:
            logger.warning("wiki export failed (non-blocking): %s", exc)
            wiki_ok = False
            stages_result.append(_stage("export_wiki", "degraded", error=str(exc)))
            if progress_callback:
                progress_callback("export_wiki", "degraded", error=str(exc))

        # --- export_visual ---
        if progress_callback:
            progress_callback("export_visual", "running")
        visual_ok = True
        try:
            import graphify.export as gexport
            import graphify.tree_html
            gexport.to_svg(G, communities, str(out_dir / "graph.svg"))
            gexport.to_graphml(G, communities, str(out_dir / "graph.graphml"))
            gexport.to_canvas(G, communities, str(out_dir / "graph.canvas"), community_labels)
            cypher_dir = out_dir / "neo4j"
            cypher_dir.mkdir(parents=True, exist_ok=True)
            gexport.to_cypher(G, str(cypher_dir / "cypher_dump.cypher"))
            graphify.tree_html.write_tree_html(
                Path(out_dir / "graph.json"), Path(out_dir / "GRAPH_TREE.html"),
                project_label=kb_id,
            )
            stages_result.append(_stage("export_visual", "completed"))
            if progress_callback:
                progress_callback("export_visual", "completed")
        except Exception as exc:
            logger.warning("visual export failed (non-blocking): %s", exc)
            visual_ok = False
            stages_result.append(_stage("export_visual", "degraded", error=str(exc)))
            if progress_callback:
                progress_callback("export_visual", "degraded", error=str(exc))

        # --- enhance_obsidian ---
        if progress_callback:
            progress_callback("enhance_obsidian", "running")
        try:
            self.enhancer.apply(out_dir / "obsidian", kb_id, None)
            stages_result.append(_stage("enhance_obsidian", "completed"))
            if progress_callback:
                progress_callback("enhance_obsidian", "completed")
        except Exception as exc:
            logger.warning("enhance_obsidian failed (non-blocking): %s", exc)
            stages_result.append(_stage("enhance_obsidian", "degraded", error=str(exc)))
            if progress_callback:
                progress_callback("enhance_obsidian", "degraded", error=str(exc))

        # --- verify_query (hard gate) ---
        if progress_callback:
            progress_callback("verify_query", "running")
        query_ok = True
        try:
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
                if progress_callback:
                    progress_callback("verify_query", "failed", error="; ".join(verify_errors))
                return self._finalize(job_id, kb_id, stages_result, artifact_entries, stats,
                                      graph_ready=False, release=None, start_time=start_time)
            else:
                query_ok = True
                stages_result.append(_stage("verify_query", "completed"))
                if progress_callback:
                    progress_callback("verify_query", "completed")
        except Exception as exc:
            logger.warning("verify_query failed (non-blocking): %s", exc)
            query_ok = False
            stages_result.append(_stage("verify_query", "degraded", error=str(exc)))
            if progress_callback:
                progress_callback("verify_query", "degraded", error=str(exc))

        # --- register_release ---
        if progress_callback:
            progress_callback("register_release", "running")
        release_id = f"rel_{uuid4().hex[:12]}"
        graph_json_path = out_dir / "graph.json"
        graph_ready = graph_json_path.exists() and graph_json_path.stat().st_size > 0

        if graph_ready:
            artifact_entries = self._collect_artifacts(release_id, kb_id, out_dir, report_ok, vault_ok, wiki_ok, visual_ok)
            release = {
                "id": release_id,
                "knowledge_base_id": kb_id,
                "build_job_id": job_id,
                "version": datetime.now(UTC).strftime("%Y%m%d_%H%M%S"),
                "status": "draft",
                "artifact_status": self._build_artifact_status(artifact_entries, semantic_ok, query_ok),
                "created_at": datetime.now(UTC),
            }
            stages_result.append(_stage("register_release", "completed", release_id=release_id))
            if progress_callback:
                progress_callback("register_release", "completed", release_id=release_id)

            # Write release manifest
            import json
            release_dir = self.workspace_manager.releases_dir(project_id, kb_id)
            release_json = release_dir / f"{release_id}.json"
            release_json.write_text(json.dumps({
                "release_id": release_id,
                "kb_id": kb_id,
                "build_job_id": job_id,
                "status": "draft",
                "artifact_paths": {
                    "graph": f"kb/{kb_id}/builds/{job_id}/out/graph.json",
                    "obsidian": f"kb/{kb_id}/obsidian/",
                    "wiki": f"kb/{kb_id}/wiki/",
                }
            }, indent=2))

            # rsync obsidian + wiki to persistent git repos
            import subprocess
            obsidian_out = out_dir / "obsidian"
            if obsidian_out.exists():
                obsidian_repo = self.workspace_manager.obsidian_dir(project_id, kb_id)
                subprocess.run(["rsync", "-a", "--delete",
                    str(obsidian_out) + "/", str(obsidian_repo) + "/"],
                    timeout=60, check=False)
                subprocess.run(["git", "-C", str(obsidian_repo), "add", "-A"],
                    capture_output=True, timeout=10, check=False)
                subprocess.run(["git", "-C", str(obsidian_repo), "commit", "-m", f"release {release_id}"],
                    capture_output=True, timeout=10, check=False)
                subprocess.run(["git", "-C", str(obsidian_repo), "tag", release_id],
                    capture_output=True, timeout=10, check=False)

            wiki_out = out_dir / "wiki"
            if wiki_out.exists():
                wiki_repo = self.workspace_manager.wiki_dir(project_id, kb_id)
                subprocess.run(["rsync", "-a", "--delete",
                    str(wiki_out) + "/", str(wiki_repo) + "/"],
                    timeout=60, check=False)
                subprocess.run(["git", "-C", str(wiki_repo), "add", "-A"],
                    capture_output=True, timeout=10, check=False)
                subprocess.run(["git", "-C", str(wiki_repo), "commit", "-m", f"release {release_id}"],
                    capture_output=True, timeout=10, check=False)
                subprocess.run(["git", "-C", str(wiki_repo), "tag", release_id],
                    capture_output=True, timeout=10, check=False)
        else:
            stages_result.append(_stage("register_release", "failed", error="graph.json missing or empty"))
            if progress_callback:
                progress_callback("register_release", "failed", error="graph.json missing or empty")

        # --- activate_or_roll_back ---
        if progress_callback:
            progress_callback("activate_or_roll_back", "running")
        if graph_ready and release:
            stages_result.append(_stage("activate_or_roll_back", "completed", activated_release=release_id))
            if progress_callback:
                progress_callback("activate_or_roll_back", "completed", activated_release=release_id)
        else:
            stages_result.append(_stage("activate_or_roll_back", "skipped", reason="no releasable graph"))
            if progress_callback:
                progress_callback("activate_or_roll_back", "skipped", reason="no releasable graph")

        return self._finalize(job_id, kb_id, stages_result, artifact_entries, stats, graph_ready=graph_ready, release=release, start_time=start_time)

    # ------------------------------------------------------------------
    # internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _sanitize_extraction(extraction: dict) -> dict:
        nodes = extraction.get("nodes", [])
        edges = extraction.get("edges", [])
        if not nodes or not edges:
            return extraction
        node_ids = {n["id"] for n in nodes}
        orphan_count = sum(1 for e in edges if e.get("target") not in node_ids)
        if orphan_count:
            logger.info("Removing %d orphan edge(s) with missing targets", orphan_count)
            extraction["edges"] = [e for e in edges if e.get("target") in node_ids]
            extraction["edge_count"] = len(extraction["edges"])
        return extraction

    def _check_graphify(self) -> bool:
        if self._graphify_available is not None:
            return self._graphify_available
        try:
            import graphify  # noqa: F401
            self._graphify_available = True
        except ImportError:
            self._graphify_available = False
        return self._graphify_available

    def _run_extract(self, files: list[Path], ws: Path, llm_config: dict, *, project_id: str = "proj_default", kb_id: str = "") -> dict:
        import graphify.extract
        import graphify.llm

        # File type classification — mirrors graphify.detect.classify_file()
        # Unknown / unsupported extensions are skipped (graphify returns None for them)
        CODE_EXT = {
            ".py", ".ts", ".js", ".jsx", ".tsx", ".mjs", ".ejs", ".go", ".rs",
            ".java", ".groovy", ".gradle", ".cpp", ".cc", ".cxx", ".c", ".h",
            ".hpp", ".rb", ".swift", ".kt", ".kts", ".cs", ".scala", ".php",
            ".lua", ".luau", ".toc", ".zig", ".ps1", ".ex", ".exs", ".m",
            ".mm", ".jl", ".vue", ".svelte", ".dart", ".v", ".sv", ".sql",
            ".r", ".f", ".F", ".f90", ".F90", ".f95", ".F95", ".f03", ".F03",
            ".f08", ".F08", ".pas", ".pp", ".dpr", ".dpk", ".lpr", ".inc",
            ".dfm", ".lfm", ".lpk",
        }
        DOC_EXT = {
            ".md", ".mdx", ".qmd", ".txt", ".rst", ".html", ".yaml", ".yml",
        }
        PAPER_EXT = {".pdf"}
        OFFICE_EXT = {".docx", ".xlsx"}
        IMAGE_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}
        # .pptx treated as document (office) — not in graphify's native set but
        # we accept it because python-pptx can extract text for LLM processing
        _EXTRA_DOC = {".pptx"}

        code_files: list[Path] = []
        semantic_files: list[Path] = []
        skipped: list[str] = []

        for f in files:
            suf = f.suffix.lower()
            if suf in CODE_EXT:
                code_files.append(f)
            elif suf in DOC_EXT or suf in OFFICE_EXT or suf in IMAGE_EXT or suf in PAPER_EXT or suf in _EXTRA_DOC:
                semantic_files.append(f)
            else:
                skipped.append(f.name)

        if skipped:
            logger.debug("Skipped %d file(s) with unsupported extensions: %s", len(skipped), skipped[:10])

        # Phase 1: AST extraction on code files (local, no API calls)
        ast_result: dict = {"nodes": [], "edges": []}
        if code_files:
            ast_result = graphify.extract.extract(
                code_files,
                cache_root=self.workspace_manager.cache_dir(project_id, kb_id),
                parallel=True,
                max_workers=llm_config.get("max_workers"),
            )

        # Phase 2: Semantic LLM extraction on docs/papers/images
        api_key_value = (
            llm_config.get("api_key")
            or self._resolve_key_from_env(llm_config.get("api_key_ref"))
            or self._resolve_key_from_env(llm_config.get("llm_api_key_ref"))
        )
        backend = llm_config.get("llm_backend")
        if semantic_files and api_key_value and backend:
            if backend not in _KNOWN_BACKENDS:
                self._inject_custom_backend(llm_config)
            try:
                semantic = graphify.llm.extract_corpus_parallel(
                    semantic_files,
                    backend=backend,
                    api_key=api_key_value,
                    model=llm_config.get("llm_model_override"),
                    token_budget=llm_config.get("llm_extraction_budget") or 60000,
                    max_concurrency=4,
                )
                logger.info(
                    "Semantic extraction: %d nodes, %d edges (%d files)",
                    len(semantic.get("nodes", [])),
                    len(semantic.get("edges", [])),
                    len(semantic_files),
                )
                ast_result.setdefault("nodes", []).extend(semantic.get("nodes", []))
                ast_result.setdefault("edges", []).extend(semantic.get("edges", []))
            except Exception:
                logger.exception("Semantic extraction failed, using AST-only result")

        return ast_result

    @staticmethod
    def _is_sensitive(name: str) -> bool:
        """Mirrors graphify.detect._is_sensitive — skip secret/key files."""
        import re
        _SENSITIVE_PATTERNS = [
            re.compile(r'(^|[\\/])\.(env|envrc)(\.|$)', re.IGNORECASE),
            re.compile(r'\.(pem|key|p12|pfx|cert|crt|der|p8)$', re.IGNORECASE),
            re.compile(r'\b(credential|secret|passwd|password|token|private_key)s?\b', re.IGNORECASE),
            re.compile(r'(id_rsa|id_dsa|id_ecdsa|id_ed25519)(\.pub)?$'),
            re.compile(r'(\.netrc|\.pgpass|\.htpasswd)$', re.IGNORECASE),
        ]
        return any(p.search(name) for p in _SENSITIVE_PATTERNS)

    @staticmethod
    def _resolve_key_from_env(ref: str | None) -> str | None:
        if not ref or not ref.startswith("env:"):
            return None
        return os.environ.get(ref.removeprefix("env:"))

    @staticmethod
    def _inject_custom_backend(llm_config: dict) -> None:
        import graphify.llm
        name = llm_config["llm_backend"]
        if name in graphify.llm.BACKENDS:
            return
        graphify.llm.BACKENDS[name] = {
            "base_url": llm_config.get("llm_base_url_override", "https://api.openai.com/v1"),
            "default_model": llm_config.get("llm_model_override", "gpt-4.1-mini"),
            "env_key": f"{name.upper()}_API_KEY",
            "pricing": {"input": 0, "output": 0},
            "temperature": 0,
            "max_tokens": llm_config.get("llm_extraction_budget") or 16384,
        }

    def _collect_artifacts(self, release_id: str, kb_id: str, out_dir: Path, report_ok: bool, vault_ok: bool, wiki_ok: bool, visual_ok: bool) -> list[dict]:
        artifacts: list[dict] = []
        def _add(atype: str, path: str, status: str, meta: dict | None = None):
            artifacts.append({
                "id": f"art_{release_id}_{atype}",
                "release_id": release_id,
                "artifact_type": atype,
                "artifact_status": status,
                "artifact_path": path,
                "artifact_meta": meta or {},
            })

        _add("graph", str(out_dir / "graph.json"), "ready")
        _add("report", str(out_dir / "GRAPH_REPORT.md"), "ready" if report_ok else "degraded")
        _add("html", str(out_dir / "graph.html"), "ready" if report_ok else "degraded")
        _add("obsidian_vault", str(out_dir / "obsidian"), "ready" if vault_ok else "degraded")
        _add("wiki", str(out_dir / "wiki"), "ready" if wiki_ok else "degraded")
        _add("svg", str(out_dir / "graph.svg"), "ready" if visual_ok else "degraded")
        _add("graphml", str(out_dir / "graph.graphml"), "ready" if visual_ok else "degraded")
        _add("logs", str(out_dir.parent / "logs"), "ready")
        return artifacts

    @staticmethod
    def _build_artifact_status(artifacts: list[dict], semantic_ok: bool, query_ok: bool) -> dict[str, str]:
        status: dict[str, str] = {}
        for a in artifacts:
            status[a["artifact_type"]] = a["artifact_status"]
        if not semantic_ok:
            status["graph"] = "degraded"
        if not query_ok:
            status["query"] = "degraded"
        return status

    def _finalize(self, job_id: str, kb_id: str, stages: list[dict], artifacts: list[dict], stats: dict, *, graph_ready: bool, release: dict | None, start_time: float) -> dict:
        extraction_duration_ms = int((time.monotonic() - start_time) * 1000)
        return {
            "job_id": job_id,
            "kb_id": kb_id,
            "stages": stages,
            "graph_ready": graph_ready,
            "release": release,
            "artifacts": artifacts,
            "stats": {**stats, "extraction_duration_ms": extraction_duration_ms},
        }


_KNOWN_BACKENDS = {"claude", "openai", "ollama", "gemini", "kimi", "bedrock"}
