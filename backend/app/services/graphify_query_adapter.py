"""Adapter wrapping graphify private query APIs. Single coupling point for version isolation."""

import json
from pathlib import Path

import networkx as nx
from networkx.readwrite import json_graph


class GraphifyQueryAdapter:
    """Encapsulate graphify private query APIs.

    If graphify upgrades and changes private function signatures, only this
    adapter needs updating.  If graphify exposes stable public query APIs in
    the future, switch the implementation here.
    """

    @staticmethod
    def load_graph(path: str | Path) -> nx.Graph:
        with open(path) as f:
            raw = json.load(f)
        if "links" not in raw and "edges" in raw:
            raw = dict(raw, links=raw["edges"])
        try:
            return json_graph.node_link_graph(raw, link="links")
        except TypeError:
            return json_graph.node_link_graph(raw)

    @staticmethod
    def query(G: nx.Graph, question: str, mode: str = "bfs", budget: int = 2000) -> str:
        from graphify.serve import (
            _bfs, _dfs, _query_graph_text, _resolve_context_filters,
            _score_nodes, _subgraph_to_text, _filter_graph_by_context,
        )

        # Chinese text: _query_graph_text splits on whitespace and filters
        # len(t) > 2, so 2-char words like "项目"/"模块" never match.
        # Bypass and call the underlying primitives directly.
        if question.strip() and all(ord(c) > 127 or c.isspace() for c in question.strip()):
            tokens = [question.strip()]
            scored = _score_nodes(G, tokens)
            start_nodes = [nid for _, nid in scored[:3]]
            if not start_nodes:
                # Fallback: try all 2-char bigrams
                bigrams = []
                for i in range(len(question.strip()) - 1):
                    bigrams.append(question.strip()[i : i + 2])
                scored = _score_nodes(G, bigrams)
                start_nodes = [nid for _, nid in scored[:3]]
                if not start_nodes:
                    return "No matching nodes found."

            resolved_filters, _ = _resolve_context_filters(question, None)
            traversal_graph = _filter_graph_by_context(G, resolved_filters)
            traverse = _dfs if mode == "dfs" else _bfs
            nodes, edges = traverse(traversal_graph, start_nodes, 2)

            header_parts = [
                f"Traversal: {mode.upper()} depth=2",
                f"Start: {[G.nodes[n].get('label', n) for n in start_nodes]}",
                f"{len(nodes)} nodes found",
            ]
            header = " | ".join(header_parts) + "\n\n"
            return header + _subgraph_to_text(traversal_graph, nodes, edges, budget)

        return _query_graph_text(G, question, mode=mode, depth=2, token_budget=budget)

    @staticmethod
    def path(G: nx.Graph, source_label: str, target_label: str) -> dict:
        from graphify.serve import _score_nodes

        src = _score_nodes(G, [t.lower() for t in source_label.split()])
        tgt = _score_nodes(G, [t.lower() for t in target_label.split()])
        if not src or not tgt:
            raise ValueError("Source or target node not found")
        path_nodes = nx.shortest_path(G, src[0][1], tgt[0][1])
        return {"path": path_nodes, "hop_count": len(path_nodes) - 1}

    @staticmethod
    def explain(G: nx.Graph, node_label: str, budget: int = 2000) -> dict:
        from graphify.serve import _find_node, _subgraph_to_text

        nodes = _find_node(G, node_label)
        if not nodes:
            raise ValueError(f"Node '{node_label}' not found")
        neighbors: set[str] = set()
        for n in nodes[:5]:
            neighbors.update(G.neighbors(n))
        edges = [(u, v) for u, v in G.edges() if u in nodes or v in nodes]
        text = _subgraph_to_text(G, set(nodes) | neighbors, edges, token_budget=budget, seeds=nodes)
        return {"explanation": text, "related_nodes": sorted(neighbors)}

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
