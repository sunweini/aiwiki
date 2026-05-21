"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchKnowledgeBases, listAllBuildJobs, listProjects } from "@/lib/api";
import type { BuildJob, KnowledgeBaseSummary, Project } from "@/lib/types";

interface DashboardData {
  projects: Project[];
  knowledgeBases: KnowledgeBaseSummary[];
  recentBuilds: BuildJob[];
  error: string | null;
  loading: boolean;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseSummary[]>([]);
  const [recentBuilds, setRecentBuilds] = useState<BuildJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const page = await listProjects();
        if (!active) return;
        const items = page.items ?? [];
        setProjects(items);
        if (items.length === 1) {
          setSelectedProjectId(items[0].id);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "无法连接 API");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  // Fetch KBs and builds when selected project changes
  useEffect(() => {
    if (!selectedProjectId) return;
    let active = true;
    async function load() {
      try {
        const kbs = await fetchKnowledgeBases(selectedProjectId);
        if (!active) return;
        setKnowledgeBases(kbs);
      } catch {
        if (active) setKnowledgeBases([]);
      }
      try {
        const all = await listAllBuildJobs();
        if (!active) return;
        // Filter builds to KBs belonging to selected project
        const kbIds = new Set(await fetchKnowledgeBases(selectedProjectId).then(arr => arr.map(k => k.kb_id ?? k.id)).catch(() => [] as string[]));
        if (!active) return;
        const filtered = all.filter(b => kbIds.has(b.knowledge_base_id)).slice(0, 8);
        setRecentBuilds(filtered);
      } catch {
        if (active) setRecentBuilds([]);
      }
    }
    load();
    return () => { active = false; };
  }, [selectedProjectId]);

  const activeBuildCount = recentBuilds.filter((b) => b.status === "running" || b.status === "pending").length;
  const stats: Array<[string, string]> = [
    ["项目", selectedProjectId || "—"],
    ["知识库", String(knowledgeBases.length)],
    ["最近构建", String(recentBuilds.length)],
    ["活跃构建", String(activeBuildCount)],
  ];

  return (
    <main style={{ padding: "3rem 4rem", maxWidth: 1280, margin: "0 auto" }}>
      <header style={{ borderBottom: "2px solid var(--line)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.78rem" }}>
          文库 / 档案 控制台
        </p>
        <h1 style={{ margin: "0.5rem 0 0", fontSize: "3rem", lineHeight: 1.05 }}>知识档案</h1>
        <p style={{ margin: "0.9rem 0 0", maxWidth: "52rem", color: "var(--muted)" }}>
          浏览已管理的数据源、活跃知识库、发布产物与最近的图谱构建记录。
        </p>
        {error ? (
          <p style={{ margin: "0.9rem 0 0", color: "var(--danger)", fontSize: "0.9rem" }}>
            后端不可达：{error}。
          </p>
        ) : null}
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {/* Project selector */}
        <article style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)" }}>
          <div style={{ color: "var(--muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>项目</div>
          {loading ? (
            <div style={{ fontSize: "1.1rem", marginTop: "0.35rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>加载中…</div>
          ) : projects.length <= 1 ? (
            <div style={{ fontSize: "1.1rem", marginTop: "0.35rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              {projects.length === 1 ? projects[0].name : "—"}
            </div>
          ) : (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{
                width: "100%",
                marginTop: "0.35rem",
                padding: "0.5rem",
                border: "1px solid var(--line)",
                background: "rgba(255,255,255,0.8)",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "0.85rem",
                color: "var(--ink)",
              }}
            >
              <option value="">— 选择项目 —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </article>

        {stats.slice(1).map(([label, value]) => (
          <article
            key={label}
            style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)" }}
          >
            <div style={{ color: "var(--muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
            <div style={{ fontSize: "2rem", marginTop: "0.35rem" }}>
              {value}
            </div>
          </article>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "1.5rem" }}>
        <article style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)" }}>
          <h2 style={{ marginTop: 0 }}>知识库目录</h2>
          {!selectedProjectId ? (
            <p style={{ color: "var(--muted)", margin: 0 }}>请先选择一个项目。</p>
          ) : knowledgeBases.length === 0 ? (
            <p style={{ color: "var(--muted)", margin: 0 }}>此项目暂无知识库。</p>
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
                  <Link href={`/artifacts/${kb.kb_id}`} style={{ color: "var(--accent)", fontSize: "0.82rem", display: "inline-block", marginTop: "0.25rem" }}>
                    查看图谱 →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)" }}>
          <h2 style={{ marginTop: 0 }}>最近构建</h2>
          {!selectedProjectId ? (
            <p style={{ color: "var(--muted)", margin: 0 }}>请先选择一个项目。</p>
          ) : recentBuilds.length === 0 ? (
            <p style={{ color: "var(--muted)", margin: 0 }}>暂无构建记录。</p>
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
