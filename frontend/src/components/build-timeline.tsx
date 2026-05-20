import type { BuildStage } from "@/lib/types";

interface BuildTimelineProps {
  stages: BuildStage[];
}

function statusColor(status: BuildStage["status"]) {
  if (status === "completed") return "var(--success)";
  if (status === "running") return "var(--accent)";
  if (status === "failed") return "var(--danger)";
  if (status === "cancelled") return "var(--muted)";
  return "var(--line)";
}

export function BuildTimeline({ stages }: BuildTimelineProps) {
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "1rem" }}>
      {stages.map((stage) => (
        <li key={stage.name} style={{ display: "grid", gridTemplateColumns: "1.25rem 1fr", gap: "0.85rem" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span
              style={{
                width: "0.8rem",
                height: "0.8rem",
                borderRadius: 999,
                background: statusColor(stage.status),
                marginTop: "0.45rem",
              }}
            />
          </div>
          <div style={{ paddingBottom: "1rem", borderBottom: "1px solid rgba(215, 204, 187, 0.55)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <strong>{stage.name}</strong>
              <span style={{ color: "var(--muted)", textTransform: "capitalize" }}>{stage.status}</span>
            </div>
            <p style={{ margin: "0.35rem 0 0", color: "var(--muted)" }}>{stage.log || "暂无日志。"}</p>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", color: "var(--muted)" }}>
              {stage.started_at ?? "未开始"} {stage.finished_at ? `→ ${stage.finished_at}` : ""}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
