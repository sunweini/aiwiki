import Link from "next/link";

import { listSources } from "@/lib/api";
import type { Source } from "@/lib/types";

const DEFAULT_PROJECT_ID = process.env.NEXT_PUBLIC_DEFAULT_PROJECT_ID ?? "proj_myfirstpro";

interface PageData {
  sources: Source[];
  error: string | null;
}

async function loadPage(): Promise<PageData> {
  try {
    const page = await listSources(DEFAULT_PROJECT_ID);
    return { sources: page.items, error: null };
  } catch (err) {
    return {
      sources: [],
      error: err instanceof Error ? err.message : "Unable to reach API",
    };
  }
}

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const { sources, error } = await loadPage();

  return (
    <main style={{ padding: "3rem 4rem", maxWidth: 1280, margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.78rem" }}>
          数据源注册
        </p>
        <h1 style={{ margin: "0.4rem 0 0", fontSize: "2.4rem" }}>已管理数据源</h1>
      </header>

      {error ? (
        <p style={{ color: "var(--danger)", marginBottom: "1rem" }}>
          后端不可达：{error}。显示空白目录。
        </p>
      ) : null}

      {sources.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>此项目无已注册数据源。</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {sources.map((source) => (
            <article key={source.id} style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "baseline", flexWrap: "wrap" }}>
                <div>
                  <Link href={`/sources/${source.id}`} style={{ fontWeight: 700, fontSize: "1.08rem" }}>
                    {source.name}
                  </Link>
                  <p style={{ margin: "0.35rem 0 0", color: "var(--muted)" }}>{source.description}</p>
                </div>
                <div style={{ color: "var(--muted)", textTransform: "capitalize" }}>{source.status}</div>
              </div>
              <dl style={{ margin: "1rem 0 0", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.9rem" }}>
                <div><dt style={{ color: "var(--muted)" }}>类型</dt><dd style={{ margin: "0.2rem 0 0" }}>{source.type}</dd></div>
                <div><dt style={{ color: "var(--muted)" }}>同步方式</dt><dd style={{ margin: "0.2rem 0 0" }}>{source.sync_strategy}</dd></div>
                <div><dt style={{ color: "var(--muted)" }}>引用地址</dt><dd style={{ margin: "0.2rem 0 0", wordBreak: "break-all" }}>{source.source_ref}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
