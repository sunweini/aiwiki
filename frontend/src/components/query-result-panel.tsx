import type { MCPQueryResult } from "@/lib/types";

interface QueryResultPanelProps {
  result: MCPQueryResult;
  question?: string;
  submittedAt?: string | null;
}

const MONO = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";

function formatTimestamp(value: string | null | undefined): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().replace("T", " ").replace(/\.\d+Z$/, "Z");
}

export function QueryResultPanel({ result, question, submittedAt }: QueryResultPanelProps) {
  const updatedAt = result.updated_at ?? submittedAt ?? null;
  const refs = Object.entries(result.artifact_refs ?? {});
  const sources = result.source_locations ?? [];

  return (
    <section style={{ border: "1px solid var(--line)", background: "rgba(255,255,255,0.32)", padding: "1.5rem" }}>
      <header
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) auto",
          gap: "1rem",
          alignItems: "baseline",
          paddingBottom: "0.85rem",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div>
          <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.74rem" }}>
            查询结果
          </p>
          <h2 style={{ margin: "0.3rem 0 0", fontSize: "1.25rem" }}>结构化响应</h2>
        </div>
        <dl style={{ margin: 0, display: "grid", gap: "0.2rem", justifyItems: "end", color: "var(--muted)", fontSize: "0.82rem" }}>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <dt>kb_id</dt>
            <dd style={{ margin: 0, fontFamily: MONO, color: "var(--ink)" }}>{result.kb_id}</dd>
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <dt>release_id</dt>
            <dd style={{ margin: 0, fontFamily: MONO, color: "var(--ink)" }}>{result.release_id ?? "—"}</dd>
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <dt>查询时间</dt>
            <dd style={{ margin: 0, fontFamily: MONO, color: "var(--ink)" }}>{formatTimestamp(updatedAt)}</dd>
          </div>
        </dl>
      </header>

      {question ? (
        <div style={{ marginTop: "1.1rem" }}>
          <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.72rem" }}>问题</p>
          <p style={{ margin: "0.4rem 0 0", whiteSpace: "pre-wrap" }}>{question}</p>
        </div>
      ) : null}

      <div style={{ marginTop: "1.25rem" }}>
        <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.72rem" }}>回答</p>
        <p style={{ margin: "0.5rem 0 0", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{result.answer || "（回答为空）"}</p>
      </div>

      <div style={{ marginTop: "1.5rem", display: "grid", gap: "1.25rem", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}>
        <div style={{ border: "1px solid var(--line)", padding: "0.9rem 1rem", background: "rgba(246, 241, 232, 0.6)" }}>
          <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.72rem" }}>
            源码位置
          </p>
          {sources.length > 0 ? (
            <ul style={{ margin: "0.6rem 0 0", paddingLeft: 0, listStyle: "none", display: "grid", gap: "0.3rem" }}>
              {sources.map((location) => (
                <li key={location} style={{ fontFamily: MONO, fontSize: "0.85rem", wordBreak: "break-all" }}>
                  {location}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: "0.6rem 0 0", color: "var(--muted)" }}>未引用源码位置。</p>
          )}
        </div>
        <div style={{ border: "1px solid var(--line)", padding: "0.9rem 1rem", background: "rgba(246, 241, 232, 0.6)" }}>
          <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.72rem" }}>
            产物引用
          </p>
          {refs.length > 0 ? (
            <dl style={{ margin: "0.6rem 0 0", display: "grid", gap: "0.45rem" }}>
              {refs.map(([key, value]) => (
                <div key={key} style={{ display: "grid", gridTemplateColumns: "8rem 1fr", gap: "0.6rem" }}>
                  <dt style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{key}</dt>
                  <dd style={{ margin: 0, fontFamily: MONO, fontSize: "0.85rem", wordBreak: "break-all" }}>{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p style={{ margin: "0.6rem 0 0", color: "var(--muted)" }}>未关联产物引用。</p>
          )}
        </div>
      </div>
    </section>
  );
}
