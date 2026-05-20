"use client";

import { FormEvent, useState } from "react";
import { mcpKBQuery, mcpKBStatus } from "@/lib/api";
import type { MCPQueryResult, MCPKBStatus } from "@/lib/types";

export default function QueryPlaygroundPage() {
  const [kbId, setKbId] = useState("kb_checkout_core");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MCPQueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [kbStatus, setKbStatus] = useState<MCPKBStatus | null>(null);

  async function checkStatus(kb_id: string) {
    try {
      setKbStatus(await mcpKBStatus(kb_id));
    } catch {
      setKbStatus(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const r = await mcpKBQuery(kbId, question || "Describe the knowledge base structure.");
      setResult(r);
      await checkStatus(kbId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
      setKbStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "2.5rem 3rem" }}>
      <header style={{ borderBottom: "1px solid var(--line)", paddingBottom: "1.25rem", marginBottom: "2rem" }}>
        <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.78rem" }}>
          MCP 查询控制台
        </p>
        <h1 style={{ margin: "0.45rem 0 0", fontSize: "2.2rem" }}>查询演练场</h1>
        <p style={{ margin: "0.6rem 0 0", color: "var(--muted)", maxWidth: "42rem" }}>
          面向活跃知识图谱的结构化查询测试工具，非对话界面。
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "22rem minmax(0, 1fr)", gap: "2rem", alignItems: "start" }}>
        <form
          onSubmit={handleSubmit}
          style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)", display: "grid", gap: "1rem" }}
        >
          <div>
            <label htmlFor="kb_id" style={{ display: "block", marginBottom: "0.35rem", color: "var(--muted)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              知识库 ID
            </label>
            <input
              id="kb_id"
              name="kb_id"
              value={kbId}
              onChange={(e) => setKbId(e.target.value)}
              style={{ width: "100%", padding: "0.7rem", border: "1px solid var(--line)", background: "rgba(255,255,255,0.8)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
            />
          </div>
          <div>
            <label htmlFor="question" style={{ display: "block", marginBottom: "0.35rem", color: "var(--muted)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              问题
            </label>
            <textarea
              id="question"
              name="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={6}
              placeholder="描述 checkout 领域架构。"
              style={{ width: "100%", padding: "0.7rem", border: "1px solid var(--line)", background: "rgba(255,255,255,0.8)", resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "0.8rem 1rem", border: "1px solid var(--accent)", background: "var(--accent)", color: "white", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem", letterSpacing: "0.03em" }}
          >
            {loading ? "运行中…" : "执行查询"}
          </button>
          {kbStatus ? (
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: "0.75rem", fontSize: "0.82rem", color: "var(--muted)" }}>
              <div>状态：{kbStatus.status}</div>
              <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                活跃发布：{kbStatus.active_release_id ?? "无"}
              </div>
              <div>图谱：{kbStatus.graph_status}</div>
            </div>
          ) : null}
        </form>

        <section>
          {error ? (
            <div style={{ border: "1px solid var(--danger)", padding: "1rem 1.25rem", background: "rgba(255,255,255,0.28)" }}>
              <p style={{ color: "var(--danger)", margin: 0 }}>{error}</p>
            </div>
          ) : result ? (
            <article style={{ border: "1px solid var(--line)", background: "rgba(255,255,255,0.28)" }}>
              <div style={{ borderBottom: "1px solid var(--line)", padding: "0.75rem 1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.82rem", color: "var(--muted)" }}>
                <div>
                  知识库{" "}
                  <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: "var(--ink)" }}>{result.kb_id}</code>
                </div>
                <div>
                  发布{" "}
                  <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: "var(--ink)" }}>{result.release_id ?? "无"}</code>
                </div>
              </div>
              <div style={{ padding: "1.25rem" }}>
                <h3 style={{ margin: "0 0 0.75rem", fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>回答</h3>
                <p style={{ margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{result.answer}</p>
              </div>
              {result.source_locations?.length ? (
                <div style={{ borderTop: "1px solid var(--line)", padding: "1rem 1.25rem" }}>
                  <h3 style={{ margin: "0 0 0.5rem", fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>源码位置</h3>
                  <ul style={{ margin: 0, paddingLeft: "1.15rem", display: "grid", gap: "0.3rem" }}>
                    {result.source_locations.map((loc, i) => (
                      <li key={i} style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.85rem" }}>
                        {typeof loc === "string" ? loc : JSON.stringify(loc)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div style={{ borderTop: "1px solid var(--line)", padding: "0.75rem 1.25rem", background: "rgba(0,0,0,0.02)" }}>
                <details>
                  <summary style={{ cursor: "pointer", color: "var(--muted)", fontSize: "0.82rem" }}>原始响应</summary>
                  <pre style={{ marginTop: "0.5rem", fontSize: "0.8rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", whiteSpace: "pre-wrap", color: "var(--muted)" }}>
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            </article>
          ) : (
            <p style={{ color: "var(--muted)" }}>提交查询以查看结果。</p>
          )}
        </section>
      </div>
    </main>
  );
}
