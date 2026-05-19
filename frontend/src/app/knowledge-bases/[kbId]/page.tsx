import Link from "next/link";

import { fetchArtifacts, fetchKBStatus, fetchKnowledgeBase, fetchReleases } from "@/lib/api";
import type { ArtifactVersion, KnowledgeBaseSummary, MCPKBStatus, Release } from "@/lib/types";

interface DetailPageProps {
  params: { kbId: string };
}

interface DetailData {
  kb: KnowledgeBaseSummary | null;
  status: MCPKBStatus | null;
  releases: Release[];
  artifacts: ArtifactVersion[];
  activeReleaseId: string | null;
  errors: string[];
}

async function loadDetail(kbId: string): Promise<DetailData> {
  const errors: string[] = [];
  const [kbResult, statusResult, releasesResult, artifactsResult] = await Promise.allSettled([
    fetchKnowledgeBase(kbId),
    fetchKBStatus(kbId),
    fetchReleases(kbId),
    fetchArtifacts(kbId),
  ]);

  const kb = kbResult.status === "fulfilled" ? kbResult.value : null;
  if (kbResult.status === "rejected") errors.push(`KB lookup: ${formatError(kbResult.reason)}`);

  const status = statusResult.status === "fulfilled" ? statusResult.value : null;
  if (statusResult.status === "rejected") errors.push(`KB status: ${formatError(statusResult.reason)}`);

  const releases = releasesResult.status === "fulfilled" ? releasesResult.value : [];
  if (releasesResult.status === "rejected") errors.push(`Releases: ${formatError(releasesResult.reason)}`);

  const artifactsBundle = artifactsResult.status === "fulfilled" ? artifactsResult.value : null;
  if (artifactsResult.status === "rejected") errors.push(`Artifacts: ${formatError(artifactsResult.reason)}`);

  const artifacts = artifactsBundle?.artifacts ?? [];
  const activeReleaseId = artifactsBundle?.release_id != null ? artifactsBundle.release_id : (status?.active_release_id != null ? status.active_release_id : (kb?.active_release_id != null ? kb.active_release_id : null));

  return { kb, status, releases, artifacts, activeReleaseId, errors };
}

function formatError(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  return String(reason);
}

export const dynamic = "force-dynamic";

export default async function KnowledgeBaseDetailPage({ params }: DetailPageProps) {
  const { kbId } = params;
  const { kb, status, releases, artifacts, activeReleaseId, errors } = await loadDetail(kbId);

  const displayName = kb?.name ?? kbId;
  const description = "Read-only dossier of releases, artifacts, and graph status from the closure backend.";

  const sections = [
    { id: "header", label: "Overview" },
    { id: "releases", label: "Releases" },
    { id: "artifacts", label: "Artifacts" },
  ];

  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "2.5rem 3rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "12rem minmax(0, 1fr) 18rem",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        <aside style={{ position: "sticky", top: "2rem", borderRight: "1px solid var(--line)", paddingRight: "1rem" }}>
          <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.72rem" }}>
            Outline
          </p>
          <ul style={{ listStyle: "none", margin: "0.75rem 0 0", padding: 0, display: "grid", gap: "0.5rem" }}>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} style={{ color: "var(--ink)" }}>
                  {section.label}
                </a>
              </li>
            ))}
            <li style={{ marginTop: "1rem" }}>
              <Link href="/knowledge-bases" style={{ fontSize: "0.85rem" }}>
                ← Back to catalog
              </Link>
            </li>
          </ul>
        </aside>

        <section style={{ minWidth: 0 }}>
          <header
            id="header"
            style={{ borderBottom: "1px solid var(--line)", paddingBottom: "1.25rem", marginBottom: "1.75rem" }}
          >
            <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.78rem" }}>
              Knowledge Base Dossier
            </p>
            <h1 style={{ margin: "0.45rem 0 0", fontSize: "2.2rem", lineHeight: 1.1 }}>{displayName}</h1>
            <p style={{ margin: "0.6rem 0 0", color: "var(--muted)" }}>
              <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{kbId}</code>
            </p>
            <p style={{ margin: "0.6rem 0 0", maxWidth: "44rem" }}>{description}</p>
            {errors.length > 0 ? (
              <ul style={{ marginTop: "0.9rem", color: "var(--danger)", fontSize: "0.85rem" }}>
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            ) : null}
          </header>

          <section id="releases" style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ margin: "0 0 0.75rem" }}>Releases</h2>
            {releases.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>No releases recorded.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
                    <th style={{ padding: "0.65rem 0.5rem" }}>Release</th>
                    <th style={{ padding: "0.65rem 0.5rem" }}>Version</th>
                    <th style={{ padding: "0.65rem 0.5rem" }}>Status</th>
                    <th style={{ padding: "0.65rem 0.5rem" }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {releases.map((rel) => (
                    <tr key={rel.id} style={{ borderBottom: "1px solid rgba(215, 204, 187, 0.55)" }}>
                      <td style={{ padding: "0.65rem 0.5rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.88rem" }}>
                        {rel.id}
                      </td>
                      <td style={{ padding: "0.65rem 0.5rem" }}>{rel.version}</td>
                      <td style={{ padding: "0.65rem 0.5rem" }}>{rel.status}</td>
                      <td style={{ padding: "0.65rem 0.5rem", color: "var(--muted)", fontSize: "0.9rem" }}>{rel.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section id="artifacts">
            <h2 style={{ margin: "0 0 0.75rem" }}>Active Release Artifacts</h2>
            {activeReleaseId ? (
              <p style={{ margin: "0 0 0.75rem", color: "var(--muted)" }}>
                Release{" "}
                <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{activeReleaseId}</code>
              </p>
            ) : null}
            {artifacts.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>No artifacts published yet.</p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.75rem" }}>
                {artifacts.map((art) => (
                  <li key={art.id} style={{ border: "1px solid var(--line)", padding: "0.9rem", background: "rgba(255,255,255,0.28)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{art.artifact_type}</div>
                        <div
                          style={{
                            color: "var(--muted)",
                            fontSize: "0.85rem",
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                            wordBreak: "break-all",
                          }}
                        >
                          {art.artifact_path}
                        </div>
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{art.artifact_status}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>

        <aside
          style={{
            position: "sticky",
            top: "2rem",
            borderLeft: "1px solid var(--line)",
            paddingLeft: "1.25rem",
            display: "grid",
            gap: "1rem",
          }}
        >
          <div>
            <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.72rem" }}>
              Status
            </p>
            <p style={{ margin: "0.35rem 0 0", fontSize: "1.1rem" }}>{status?.status ?? kb?.status ?? "unknown"}</p>
          </div>
          <div>
            <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.72rem" }}>
              Active Release
            </p>
            <p
              style={{
                margin: "0.35rem 0 0",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "0.9rem",
                wordBreak: "break-all",
              }}
            >
              {activeReleaseId ?? "—"}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.72rem" }}>
              Graph
            </p>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.9rem" }}>{status?.graph_status ?? "missing"}</p>
          </div>
          <div>
            <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.72rem" }}>
              Project
            </p>
            <p
              style={{
                margin: "0.35rem 0 0",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "0.85rem",
              }}
            >
              {kb?.project_id ?? "—"}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.72rem" }}>
              Updated
            </p>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem" }}>{kb?.updated_at ?? "—"}</p>
          </div>
          <div>
            <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.72rem" }}>
              LLM Backend
            </p>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem" }}>{kb?.llm_backend ?? "—"}</p>
          </div>
          <div>
            <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.72rem" }}>
              LLM Model
            </p>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem" }}>{kb?.llm_model_override ?? "—"}</p>
          </div>
          <div>
            <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.72rem" }}>
              Extraction Budget
            </p>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem" }}>{kb?.llm_extraction_budget != null ? kb.llm_extraction_budget.toLocaleString() : "—"}</p>
          </div>
          <div>
            <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.72rem" }}>
              Base URL Override
            </p>
            <p style={{
              margin: "0.35rem 0 0",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "0.8rem",
              wordBreak: "break-all",
            }}>{kb?.llm_base_url_override ?? "—"}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
