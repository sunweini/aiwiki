import json
from pathlib import Path
from unittest.mock import patch

import networkx as nx
from networkx.readwrite import json_graph

from app.services.graphify_query_adapter import GraphifyQueryAdapter


def test_load_graph_remaps_edges_to_links(tmp_path: Path) -> None:
    data = {
        "nodes": [
            {"id": "checkout_service", "type": "class"},
            {"id": "validate_order", "type": "method"},
        ],
        "edges": [
            {"source": "checkout_service", "target": "validate_order", "confidence": "EXTRACTED"},
        ],
    }
    graph_file = tmp_path / "graph.json"
    graph_file.write_text(json.dumps(data), encoding="utf-8")

    G = GraphifyQueryAdapter.load_graph(str(graph_file))

    assert G.number_of_nodes() == 2
    assert G.number_of_edges() == 1
    assert G.has_edge("checkout_service", "validate_order")


def test_load_graph_handles_typeerror_fallback() -> None:
    data = {
        "nodes": [{"id": "a"}, {"id": "b"}],
        "links": [{"source": "a", "target": "b"}],
    }
    graph_file = Path("/tmp/test_fallback.json")
    graph_file.write_text(json.dumps(data), encoding="utf-8")

    with patch.object(json_graph, "node_link_graph") as mock_load:
        mock_load.side_effect = [TypeError("bad arg"), nx.Graph()]
        G = GraphifyQueryAdapter.load_graph(str(graph_file))

    assert mock_load.call_count == 2
    # First call with link="links"
    assert mock_load.call_args_list[0].kwargs.get("link") == "links"
    # Second call without link kwarg (fallback)
    assert "link" not in mock_load.call_args_list[1].kwargs
