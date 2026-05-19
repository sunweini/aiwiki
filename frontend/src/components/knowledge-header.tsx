import type { KnowledgeBase, Release } from "@/lib/types";
import { ReleaseStatusChips } from "./release-status-chips";

interface KnowledgeHeaderProps {
  knowledgeBase: KnowledgeBase;
  activeRelease?: Release | null;
}

export function KnowledgeHeader({ knowledgeBase, activeRelease }: KnowledgeHeaderProps) {
  return (
    <header style={{ borderBottom: "1px solid var(--line)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
      <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.78rem" }}>
        Knowledge Base Dossier
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap", marginTop: "0.5rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "2.1rem", lineHeight: 1.15 }}>{knowledgeBase.name}</h1>
          <p style={{ margin: "0.75rem 0 0", maxWidth: "46rem", color: "var(--muted)" }}>
            {knowledgeBase.description ?? "No description recorded."}
          </p>
        </div>
        <div style={{ minWidth: "16rem", textAlign: "right" }}>
          <ReleaseStatusChips
            items={[
              { label: `KB ${knowledgeBase.status}`, tone: knowledgeBase.status === "ready" ? "success" : knowledgeBase.status === "building" ? "warning" : knowledgeBase.status === "error" ? "danger" : "muted" },
              { label: knowledgeBase.visibility, tone: "accent" },
              { label: activeRelease ? `Active ${activeRelease.version}` : "No active release", tone: activeRelease ? "success" : "muted" },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
