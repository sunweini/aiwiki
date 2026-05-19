import type { ArtifactVersion } from "@/lib/types";

interface ArtifactPreviewPanelProps {
  artifacts: ArtifactVersion[];
}

export function ArtifactPreviewPanel({ artifacts }: ArtifactPreviewPanelProps) {
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {artifacts.map((artifact) => (
        <article key={artifact.id} style={{ border: "1px solid var(--line)", padding: "1rem", background: "rgba(255,255,255,0.28)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "baseline" }}>
            <h3 style={{ margin: 0, fontSize: "1rem" }}>{artifact.artifact_type}</h3>
            <span style={{ color: "var(--muted)", textTransform: "capitalize", fontSize: "0.82rem" }}>{artifact.artifact_status}</span>
          </div>
          <p style={{ margin: "0.5rem 0 0", color: "var(--muted)", wordBreak: "break-all" }}>{artifact.artifact_path}</p>
          <dl style={{ margin: "0.9rem 0 0", display: "grid", gap: "0.35rem" }}>
            {Object.entries(artifact.artifact_meta).map(([key, value]) => (
              <div key={key} style={{ display: "grid", gridTemplateColumns: "8rem 1fr", gap: "0.75rem" }}>
                <dt style={{ color: "var(--muted)" }}>{key}</dt>
                <dd style={{ margin: 0 }}>{String(value)}</dd>
              </div>
            ))}
          </dl>
        </article>
      ))}
    </div>
  );
}
