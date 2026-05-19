import Link from "next/link";
import { getArtifacts } from "@/lib/api";
import { resolveArtifactUrl } from "@/lib/api";
import type { ArtifactVersion } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ArtifactViewerPage({ params }: { params: { kbId: string } }) {
  let kbId = params.kbId;
  let releaseId: string | null = null;
  let artifacts: ArtifactVersion[] = [];
  let error: string | null = null;

  try {
    const bundle = await getArtifacts(kbId);
    releaseId = bundle.release_id;
    artifacts = bundle.artifacts ?? [];
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const graphArtifact = artifacts.find((a) => a.artifact_type === "graph" || a.artifact_type === "html");
  const vaultArtifacts = artifacts.filter((a) => a.artifact_type === "vault" || a.artifact_type === "obsidian_vault");

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "2.5rem 3rem" }}>
      <header style={{ borderBottom: "1px solid var(--line)", paddingBottom: "1.25rem", marginBottom: "2rem" }}>
        <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.78rem" }}>
          Artifact Viewer
        </p>
        <h1 style={{ margin: "0.45rem 0 0", fontSize: "2.2rem" }}>
          <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{kbId}</code>
        </h1>
        <p style={{ margin: "0.6rem 0 0", color: "var(--muted)" }}>
          Release{" "}
          <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{releaseId ?? "none"}</code>
        </p>
        {error ? <p style={{ color: "var(--danger)", marginTop: "0.6rem" }}>{error}</p> : null}
      </header>

      {graphArtifact ? (
        <section style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ margin: "0 0 0.75rem" }}>Knowledge Graph</h2>
          <div style={{ border: "1px solid var(--line)", background: "rgba(255,255,255,0.35)" }}>
            <div style={{ padding: "0.5rem 1rem", borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: "0.78rem" }}>
              {graphArtifact.artifact_type} · {graphArtifact.artifact_path}
            </div>
            <iframe
              src={resolveArtifactUrl(graphArtifact.artifact_path)}
              title="graph artifact viewer"
              style={{ width: "100%", height: "75vh", border: 0, background: "white" }}
            />
          </div>
        </section>
      ) : (
        <section style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)", marginBottom: "2.5rem" }}>
          <p style={{ color: "var(--muted)" }}>No graph artifact found for this knowledge base.</p>
        </section>
      )}

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ margin: "0 0 0.75rem" }}>Artifact Inventory</h2>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {artifacts.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No artifacts registered.</p>
          ) : (
            artifacts.map((a) => (
              <article
                key={a.id}
                style={{ border: "1px solid var(--line)", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.28)", display: "grid", gridTemplateColumns: "1fr auto auto", gap: "1rem", alignItems: "center" }}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>{a.artifact_type}</span>
                  <span style={{ marginLeft: "0.75rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.82rem", color: "var(--muted)" }}>
                    {a.artifact_path}
                  </span>
                </div>
                <span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: a.artifact_status === "ready" ? "var(--success)" : a.artifact_status === "error" ? "var(--danger)" : "var(--muted)" }}>
                  {a.artifact_status}
                </span>
                <Link href={`/knowledge-bases/${kbId}`} style={{ fontSize: "0.85rem" }}>KB dossier →</Link>
              </article>
            ))
          )}
        </div>
      </section>

      {vaultArtifacts.length > 0 ? (
        <section>
          <h2 style={{ margin: "0 0 0.75rem" }}>Vault Index</h2>
          <div style={{ border: "1px solid var(--line)", padding: "1rem 1.25rem", background: "rgba(255,255,255,0.28)" }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.4rem" }}>
              {vaultArtifacts.map((a) => (
                <li key={a.id} style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.85rem" }}>
                  {a.artifact_path}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}
