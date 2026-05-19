import Link from "next/link";

import { fetchKnowledgeBases, listAllBuildJobs } from "@/lib/api";
import type { BuildJob, KnowledgeBaseSummary } from "@/lib/types";

const DEFAULT_PROJECT_ID = process.env.NEXT_PUBLIC_DEFAULT_PROJECT_ID ?? "proj_delivery_alpha";

interface DashboardData {
  knowledgeBases: KnowledgeBaseSummary[];
  recentBuilds: BuildJob[];
  error: string | null;
}

async function loadDashboard(): Promise<DashboardData> {
  try {
    const knowledgeBases = await fetchKnowledgeBases(DEFAULT_PROJECT_ID);
    let recentBuilds: BuildJob[] = [];
    try {
      const all = await listAllBuildJobs();
      recentBuilds = all.slice(0, 8);
    } catch {
      recentBuilds = [];
    }
    return { knowledgeBases, recentBuilds, error: null };
  } catch (err) {
    return {
      knowledgeBases: [],
      recentBuilds: [],
      error: err instanceof Error ? err.message : "Unable to reach API",
    };
  }
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { knowledgeBases, recentBuilds, error } = await loadDashboard();

  const activeBuildCount = recentBuilds.filter((b) => b.status === "running" || b.status === "pending").length;
  const stats: Array<[string, string]> = [
    ["Project", DEFAULT_PROJECT_ID],
    ["Knowledge Bases", String(knowledgeBases.length)],
    ["Recent Builds", String(recentBuilds.length)],
    ["Active Builds", String(activeBuildCount)],
  ];

  return (
    <main style={{ padding: "3rem 4rem", maxWidth: 1280, margin: "0 auto" }}>
      <header style={{ borderBottom: "2px solid var(--line)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.78rem" }}>
          Library / Archive Modernist Console
        </p>
        <h1 style={{ margin: "0.5rem 0 0", fontSize: "3rem", lineHeight: 1.05 }}>Knowledge Archive</h1>
        <p style={{ margin: "0.9rem 0 0", maxWidth: "52rem", color: "var(--muted)" }}>
          A reading room for managed sources, active knowledge bases, release artifacts, and recent graph builds.
        </p>
        {error ? (
          <p style={{ margin: "0.9rem 0 0", color: "var(--danger)", fontSize: "0.9rem" }}>
            Backend unreachable: {error}. Showing empty catalog.
          </p>
        ) : null}
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {stats.map(([label, value]) => (
          <article
            key={label}
            style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)" }}
          >
            <div style={{ color: "var(--muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
            <div style={{ fontSize: label === "Project" ? "1.1rem" : "2rem", marginTop: "0.35rem", fontFamily: label === "Project" ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined }}>
              {value}
            </div>
          </article>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "1.5rem" }}>
        <article style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)" }}>
          <h2 style={{ marginTop: 0 }}>Catalog of Knowledge Bases</h2>
          {knowledgeBases.length === 0 ? (
            <p style={{ color: "var(--muted)", margin: 0 }}>No knowledge bases yet for this project.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {knowledgeBases.map((kb) => (
                <li key={kb.kb_id} style={{ padding: "0.9rem 0", borderTop: "1px solid rgba(215, 204, 187, 0.55)" }}>
                  <Link href={`/knowledge-bases/${kb.kb_id}`} style={{ fontWeight: 600 }}>
                    {kb.name}
                  </Link>
                  <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                    {kb.status}
                    {" · "}
                    <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.85rem" }}>{kb.kb_id}</code>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)" }}>
          <h2 style={{ marginTop: 0 }}>Recent Builds</h2>
          {recentBuilds.length === 0 ? (
            <p style={{ color: "var(--muted)", margin: 0 }}>No build jobs recorded.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {recentBuilds.map((build) => (
                <li key={build.job_id} style={{ padding: "0.9rem 0", borderTop: "1px solid rgba(215, 204, 187, 0.55)" }}>
                  <Link
                    href={`/build-jobs/${build.job_id}`}
                    style={{ fontWeight: 600, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.92rem" }}
                  >
                    {build.job_id}
                  </Link>
                  <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                    {build.knowledge_base_id} · {build.status}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  );
}
