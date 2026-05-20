interface GraphArtifactViewerProps {
  src: string;
  artifactPath?: string;
  releaseId?: string | null;
  kbId?: string;
}

const MONO = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";

export function GraphArtifactViewer({ src, artifactPath, releaseId, kbId }: GraphArtifactViewerProps) {
  return (
    <article style={{ border: "1px solid var(--line)", background: "rgba(255,255,255,0.35)" }}>
      <header
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "baseline",
          justifyContent: "space-between",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid var(--line)",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.72rem" }}>
            graph.html · 实时预览
          </p>
          <p style={{ margin: "0.3rem 0 0", fontFamily: MONO, fontSize: "0.85rem", wordBreak: "break-all" }}>
            {artifactPath ?? src}
          </p>
        </div>
        <div style={{ display: "grid", gap: "0.15rem", justifyItems: "end", color: "var(--muted)", fontSize: "0.78rem" }}>
          {kbId ? (
            <span>
              kb_id <span style={{ fontFamily: MONO, color: "var(--ink)" }}>{kbId}</span>
            </span>
          ) : null}
          {releaseId ? (
            <span>
              release_id <span style={{ fontFamily: MONO, color: "var(--ink)" }}>{releaseId}</span>
            </span>
          ) : null}
          <a href={src} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
            在新标签页打开 ↗
          </a>
        </div>
      </header>
      <iframe
        src={src}
        title="graph artifact viewer"
        style={{ width: "100%", height: "78vh", border: 0, background: "white", display: "block" }}
      />
    </article>
  );
}
