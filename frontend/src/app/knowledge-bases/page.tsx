import Link from "next/link";

import { fetchKnowledgeBases } from "@/lib/api";
import type { KnowledgeBaseSummary } from "@/lib/types";

const DEFAULT_PROJECT_ID = process.env.NEXT_PUBLIC_DEFAULT_PROJECT_ID ?? "proj_delivery_alpha";

interface PageData {
  knowledgeBases: KnowledgeBaseSummary[];
  error: string | null;
}

async function loadPage(): Promise<PageData> {
  try {
    const knowledgeBases = await fetchKnowledgeBases(DEFAULT_PROJECT_ID);
    return { knowledgeBases, error: null };
  } catch (err) {
    return {
      knowledgeBases: [],
      error: err instanceof Error ? err.message : "Unable to reach API",
    };
  }
}

export const dynamic = "force-dynamic";

export default async function KnowledgeBasesPage() {
  const { knowledgeBases, error } = await loadPage();

  return (
    <main style={{ padding: "3rem 4rem", maxWidth: 1280, margin: "0 auto" }}>
      <header style={{ borderBottom: "1px solid var(--line)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.78rem" }}>
          Catalog
        </p>
        <h1 style={{ margin: "0.5rem 0 0", fontSize: "2.2rem", lineHeight: 1.1 }}>Knowledge Bases</h1>
        <p style={{ margin: "0.6rem 0 0", color: "var(--muted)" }}>
          Project{" "}
          <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{DEFAULT_PROJECT_ID}</code>
        </p>
        {error ? (
          <p style={{ margin: "0.9rem 0 0", color: "var(--danger)", fontSize: "0.9rem" }}>
            Backend unreachable: {error}.
          </p>
        ) : null}
      </header>

      {knowledgeBases.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No knowledge bases registered yet for this project.</p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "1rem" }}>
          {knowledgeBases.map((kb) => (
            <li
              key={kb.kb_id}
              style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <Link href={`/knowledge-bases/${kb.kb_id}`} style={{ fontWeight: 600, fontSize: "1.15rem" }}>
                    {kb.name}
                  </Link>
                  <div style={{ marginTop: "0.4rem", color: "var(--muted)", fontSize: "0.9rem" }}>
                    <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{kb.kb_id}</code>
                    {" · "}
                    {kb.status}
                  </div>
                </div>
                <div style={{ textAlign: "right", color: "var(--muted)", fontSize: "0.85rem" }}>
                  {kb.active_release_id ? (
                    <>
                      Active release{" "}
                      <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{kb.active_release_id}</code>
                    </>
                  ) : (
                    "No active release"
                  )}
                  <div>Updated {kb.updated_at ?? "—"}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
