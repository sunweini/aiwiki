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
        from graphify.serve import _query_graph_text

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
