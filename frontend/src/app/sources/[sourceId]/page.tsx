import { notFound } from "next/navigation";

import { listSources } from "@/lib/api";
import type { Source } from "@/lib/types";

const DEFAULT_PROJECT_ID = process.env.NEXT_PUBLIC_DEFAULT_PROJECT_ID ?? "proj_myfirstpro";

async function loadSource(sourceId: string): Promise<Source | null> {
  try {
    const page = await listSources(DEFAULT_PROJECT_ID);
    return page.items.find((item) => item.id === sourceId) ?? null;
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export default async function SourceDetailPage({ params }: { params: { sourceId: string } }) {
  const source = await loadSource(params.sourceId);

  if (!source) {
    notFound();
  }

  return (
    <main style={{ padding: "3rem 4rem", maxWidth: 1120, margin: "0 auto" }}>
      <header style={{ borderBottom: "1px solid var(--line)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.78rem" }}>
          数据源档案
        </p>
        <h1 style={{ margin: "0.45rem 0 0", fontSize: "2.2rem" }}>{source.name}</h1>
        <p style={{ margin: "0.8rem 0 0", color: "var(--muted)" }}>{source.description}</p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <article style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)" }}>
          <h2 style={{ marginTop: 0 }}>注册信息</h2>
          <dl style={{ margin: 0, display: "grid", gap: "0.85rem" }}>
            <div><dt style={{ color: "var(--muted)" }}>数据源 ID</dt><dd style={{ margin: "0.2rem 0 0" }}>{source.id}</dd></div>
            <div><dt style={{ color: "var(--muted)" }}>项目</dt><dd style={{ margin: "0.2rem 0 0" }}>{source.project_id}</dd></div>
            <div><dt style={{ color: "var(--muted)" }}>类型</dt><dd style={{ margin: "0.2rem 0 0" }}>{source.type}</dd></div>
            <div><dt style={{ color: "var(--muted)" }}>状态</dt><dd style={{ margin: "0.2rem 0 0" }}>{source.status}</dd></div>
            <div><dt style={{ color: "var(--muted)" }}>引用地址</dt><dd style={{ margin: "0.2rem 0 0", wordBreak: "break-all" }}>{source.source_ref}</dd></div>
          </dl>
        </article>

        <article style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)" }}>
          <h2 style={{ marginTop: 0 }}>采集规则</h2>
          <div style={{ marginBottom: "1rem" }}>
            <strong>包含</strong>
            <ul style={{ margin: "0.45rem 0 0", paddingLeft: "1.15rem" }}>
              {source.include_rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </div>
          <div>
            <strong>排除</strong>
            <ul style={{ margin: "0.45rem 0 0", paddingLeft: "1.15rem" }}>
              {source.exclude_rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </div>
        </article>
      </section>
    </main>
  );
}
