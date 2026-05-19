import json
import logging
import os
import time
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from app.runner.obsidian_enhancer import ObsidianEnhancer
from app.runner.source_materializer import SourceMaterializer
from app.runner.workspace import WorkspaceManager

logger = logging.getLogger(__name__)

STAGES = [
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
    ) -> dict:
        llm_config = llm_config or {}
        start_time = time.monotonic()
        stages_result: list[dict] = []
        artifact_entries: list[dict] = []
        stats: dict = {}
        graph_ready = False
        release: dict | None = None

        ws = self.workspace_manager.create(job_id)
        log_dir = ws / "logs"

        def _stage(name: str, status: str, **kw) -> dict:
            return {"name": name, "status": status, **kw}

        # --- resolve_job_context ---
        stages_result.append(_stage("resolve_job_context", "completed"))

        # --- materialize_sources ---
        try:
            materialized = self.materializer.materialize(job_id, sources)
            stages_result.append(_stage("materialize_sources", "completed", materialized_count=len(materialized)))
        except Exception as exc:
            logger.exception("materialize_sources failed")
            stages_result.append(_stage("materialize_sources", "failed", error=str(exc)))
            return self._finalize(job_id, kb_id, stages_result, artifact_entries, stats, graph_ready=False, release=None, start_time=start_time)

        # --- normalize_inputs ---
        input_root = ws / "graphify-input"
        input_files: list[Path] = []
        try:
            for p in materialized:
                if p.is_dir():
                    for f in p.rglob("*"):
                        if f.is_file():
                            rel = f.relative_to(p)
                            dest = input_root / rel
                            dest.parent.mkdir(parents=True, exist_ok=True)
                            if not dest.exists():
                                dest.symlink_to(f.resolve())
                            input_files.append(dest)
                elif p.is_file():
                    dest = input_root / p.name
                    if not dest.exists():
                        dest.symlink_to(p.resolve())
                    input_files.append(dest)
            stages_result.append(_stage("normalize_inputs", "completed", file_count=len(input_files)))
        except Exception as exc:
            logger.exception("normalize_inputs failed")
            stages_result.append(_stage("normalize_inputs", "failed", error=str(exc)))
            return self._finalize(job_id, kb_id, stages_result, artifact_entries, stats, graph_ready=False, release=None, start_time=start_time)

        # --- extract ---
        extraction: dict = {}
        semantic_ok = True
        if not input_files:
            stages_result.append(_stage("extract", "failed", error="No input files after normalization"))
            return self._finalize(job_id, kb_id, stages_result, artifact_entries, stats, graph_ready=False, release=None, start_time=start_time)
        if not self._check_graphify():
            stages_result.append(_stage("extract", "failed", error="graphify module not available"))
            return self._finalize(job_id, kb_id, stages_result, artifact_entries, stats, graph_ready=False, release=None, start_time=start_time)
        try:
            extraction = self._run_extract(input_files, ws, llm_config)
            stages_result.append(_stage("extract", "completed", node_count=len(extraction.get("nodes", []))))
        except Exception as exc:
            logger.exception("extract failed")
            stages_result.append(_stage("extract", "failed", error=str(exc)))
            return self._finalize(job_id, kb_id, stages_result, artifact_entries, stats, graph_ready=False, release=None, start_time=start_time)

        if not llm_config.get("api_key") and not llm_config.get("llm_backend"):
            semantic_ok = False
            logger.warning("No LLM key configured; graph will be AST-only (degraded)")

        # --- sanitize ---
        extraction = self._sanitize_extraction(extraction)

        # --- build ---
        G = None
        try:
            import graphify.build
            G = graphify.build.build([extraction], directed=False, dedup=True)
            stats["node_count"] = G.number_of_nodes()
            stats["edge_count"] = G.number_of_edges()
            stages_result.append(_stage("build", "completed", node_count=stats["node_count"], edge_count=stats["edge_count"]))
        except Exception as exc:
            logger.exception("build failed")
            stages_result.append(_stage("build", "failed", error=str(exc)))
            return self._finalize(job_id, kb_id, stages_result, artifact_entries, stats, graph_ready=False, release=None, start_time=start_time)

        # --- validate ---
        try:
            import graphify.validate
            graphify.validate.assert_valid(extraction)
            stages_result.append(_stage("validate", "completed"))
        except Exception as exc:
            logger.warning("validate failed (non-blocking): %s", exc)
            stages_result.append(_stage("validate", "degraded", error=str(exc)))

        # --- cluster ---
        communities: dict[int, list[str]] = {}
        cohesion: dict[int, float] = {}
        try:
            import graphify.cluster
            communities = graphify.cluster.cluster(G)
            cohesion = graphify.cluster.score_all(G, communities)
            stats["cluster_count"] = len(communities)
            stages_result.append(_stage("cluster", "completed", cluster_count=len(communities)))
        except Exception as exc:
            logger.warning("cluster failed (non-blocking): %s", exc)
            stages_result.append(_stage("cluster", "degraded", error=str(exc)))

        # --- analyze ---
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
        except Exception as exc:
            logger.warning("analyze failed (non-blocking): %s", exc)
            stages_result.append(_stage("analyze", "degraded", error=str(exc)))

        # --- report ---
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
            except Exception as exc:
                logger.warning("report generation failed (non-blocking): %s", exc)
                report_ok = False
                stages_result.append(_stage("report", "degraded", error=str(exc)))
        else:
            stages_result.append(_stage("report", "degraded", error="no communities to report"))

        # Always persist the core graph artifact regardless of report success.
        try:
            import graphify.export as gexport
            gexport.to_json(G, communities, str(out_dir / "graph.json"))
        except Exception as exc:
            logger.warning("graph.json export failed: %s", exc)

        # --- export_obsidian ---
        vault_ok = True
        try:
            import graphify.export as gexport
            vault_count = gexport.to_obsidian(G, communities, str(out_dir / "obsidian"), community_labels, cohesion)
            stages_result.append(_stage("export_obsidian", "completed", note_count=vault_count))
        except Exception as exc:
            logger.warning("obsidian export failed (non-blocking): %s", exc)
            vault_ok = False
            stages_result.append(_stage("export_obsidian", "degraded", error=str(exc)))

        # --- export_wiki ---
        wiki_ok = True
        try:
            import graphify.wiki
            wiki_count = graphify.wiki.to_wiki(G, communities, str(out_dir / "wiki"), community_labels, cohesion, god_nodes_list)
            stages_result.append(_stage("export_wiki", "completed", page_count=wiki_count))
        except Exception as exc:
            logger.warning("wiki export failed (non-blocking): %s", exc)
            wiki_ok = False
            stages_result.append(_stage("export_wiki", "degraded", error=str(exc)))

        # --- export_visual ---
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
        except Exception as exc:
            logger.warning("visual export failed (non-blocking): %s", exc)
            visual_ok = False
            stages_result.append(_stage("export_visual", "degraded", error=str(exc)))

        # --- enhance_obsidian ---
        try:
            self.enhancer.apply(out_dir / "obsidian", kb_id, None)
            stages_result.append(_stage("enhance_obsidian", "completed"))
        except Exception as exc:
            logger.warning("enhance_obsidian failed (non-blocking): %s", exc)
            stages_result.append(_stage("enhance_obsidian", "degraded", error=str(exc)))

        # --- verify_query ---
        query_ok = True
        try:
            from app.services.graphify_query_adapter import GraphifyQueryAdapter
            G_verify = GraphifyQueryAdapter.load_graph(str(out_dir / "graph.json"))
            GraphifyQueryAdapter.query(G_verify, "list all modules", mode="bfs", budget=500)
            stages_result.append(_stage("verify_query", "completed"))
        except Exception as exc:
            logger.warning("verify_query failed (non-blocking): %s", exc)
            query_ok = False
            stages_result.append(_stage("verify_query", "degraded", error=str(exc)))

        # --- register_release ---
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
        else:
            stages_result.append(_stage("register_release", "failed", error="graph.json missing or empty"))

        # --- activate_or_roll_back ---
        if graph_ready and release:
            stages_result.append(_stage("activate_or_roll_back", "completed", activated_release=release_id))
        else:
            stages_result.append(_stage("activate_or_roll_back", "skipped", reason="no releasable graph"))

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

    def _run_extract(self, files: list[Path], ws: Path, llm_config: dict) -> dict:
        import graphify.extract

        backend = llm_config.get("llm_backend")

        if backend and backend not in _KNOWN_BACKENDS:
            self._inject_custom_backend(llm_config)

        # Build env overrides and apply to os.environ so extract() child
        # processes (ProcessPoolExecutor) inherit the configured API keys.
        env_overrides: dict[str, str] = {}

        if llm_config.get("api_key_ref"):
            ref = llm_config["api_key_ref"]
            if ref.startswith("env:"):
                env_name = ref.removeprefix("env:")
                if env_name in os.environ:
                    env_overrides["GRAPHIFY_API_KEY"] = os.environ[env_name]

        api_key = llm_config.get("api_key") or env_overrides.get("GRAPHIFY_API_KEY")
        if api_key:
            env_overrides["ANTHROPIC_API_KEY"] = api_key
            env_overrides["OPENAI_API_KEY"] = api_key
            env_overrides["DEEPSEEK_API_KEY"] = api_key

        old_environ = os.environ.copy()
        os.environ.update(env_overrides)
        try:
            return graphify.extract.extract(
                files,
                cache_root=ws / ".graphify-cache",
                parallel=True,
                max_workers=llm_config.get("max_workers"),
            )
        finally:
            os.environ.clear()
            os.environ.update(old_environ)

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
