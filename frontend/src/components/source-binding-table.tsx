import type { KnowledgeBaseSourceBinding, Source } from "@/lib/types";

interface SourceBindingTableProps {
  bindings: KnowledgeBaseSourceBinding[];
  sources: Source[];
}

export function SourceBindingTable({ bindings, sources }: SourceBindingTableProps) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--line)", background: "rgba(255,255,255,0.28)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
            <th style={{ padding: "0.9rem" }}>Source</th>
            <th style={{ padding: "0.9rem" }}>Status</th>
            <th style={{ padding: "0.9rem" }}>Priority</th>
            <th style={{ padding: "0.9rem" }}>Include</th>
            <th style={{ padding: "0.9rem" }}>Exclude</th>
          </tr>
        </thead>
        <tbody>
          {bindings.map((binding) => {
            const source = sources.find((item) => item.id === binding.source_id);
            return (
              <tr key={binding.id} style={{ borderBottom: "1px solid rgba(215, 204, 187, 0.55)" }}>
                <td style={{ padding: "0.9rem", verticalAlign: "top" }}>
                  <div style={{ fontWeight: 600 }}>{source?.name ?? binding.source_id}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.88rem" }}>{source?.source_ref}</div>
                </td>
                <td style={{ padding: "0.9rem", verticalAlign: "top", textTransform: "capitalize" }}>{binding.binding_status}</td>
                <td style={{ padding: "0.9rem", verticalAlign: "top" }}>{binding.priority}</td>
                <td style={{ padding: "0.9rem", verticalAlign: "top" }}>{binding.include_rules_override.join(", ") || "—"}</td>
                <td style={{ padding: "0.9rem", verticalAlign: "top" }}>{binding.exclude_rules_override.join(", ") || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
