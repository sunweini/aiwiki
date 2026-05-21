"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  createKnowledgeBase,
  createProject,
  deleteKnowledgeBase,
  deleteProject,
  fetchKnowledgeBases,
  listAllBuildJobs,
  listProjects,
  updateKnowledgeBase,
  updateProject,
} from "@/lib/api";
import type { BuildJob, KnowledgeBaseSummary, Project } from "@/lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { KBFormModal } from "@/components/kb-form-modal";
import { ProjectFormModal } from "@/components/project-form-modal";

type ModalState =
  | { type: "none" }
  | { type: "create-project" | "edit-project"; project?: Project | null }
  | { type: "create-kb" | "edit-kb"; kb?: KnowledgeBaseSummary | null }
  | { type: "delete-project"; project: Project }
  | { type: "delete-kb"; kb: KnowledgeBaseSummary };

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseSummary[]>([]);
  const [selectedKbId, setSelectedKbId] = useState("");
  const [recentBuilds, setRecentBuilds] = useState<BuildJob[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingKbs, setLoadingKbs] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ type: "none" });

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
        if (active) setLoadingProjects(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  // Fetch KBs when project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setKnowledgeBases([]);
      setSelectedKbId("");
      setRecentBuilds([]);
      return;
    }
    let active = true;
    setLoadingKbs(true);
    async function load() {
      try {
        const kbs = await fetchKnowledgeBases(selectedProjectId);
        if (!active) return;
        setKnowledgeBases(kbs);
        // Auto-select first KB if only one
        if (kbs.length === 1) {
          setSelectedKbId(kbs[0].kb_id ?? kbs[0].id ?? "");
        } else {
          setSelectedKbId("");
        }
      } catch {
        if (active) setKnowledgeBases([]);
      } finally {
        if (active) setLoadingKbs(false);
      }
      // Fetch builds for this project's KBs
      try {
        const all = await listAllBuildJobs();
        if (!active) return;
        const currentKbs = await fetchKnowledgeBases(selectedProjectId).catch(() => [] as KnowledgeBaseSummary[]);
        if (!active) return;
        const kbIds = new Set(currentKbs.map(k => k.kb_id ?? k.id));
        setRecentBuilds(all.filter(b => kbIds.has(b.knowledge_base_id)).slice(0, 8));
      } catch {
        if (active) setRecentBuilds([]);
      }
    }
    load();
    return () => { active = false; };
  }, [selectedProjectId]);

  const refreshProjects = useCallback(async () => {
    try {
      const page = await listProjects();
      setProjects(page.items ?? []);
    } catch { /* ignore */ }
  }, []);

  const refreshKBs = useCallback(async () => {
    if (!selectedProjectId) return;
    try {
      const kbs = await fetchKnowledgeBases(selectedProjectId);
      setKnowledgeBases(kbs);
    } catch { /* ignore */ }
  }, [selectedProjectId]);

  // Project CRUD handlers
  async function handleCreateProject(data: { name: string; description: string | null }) {
    setLoadingAction(true);
    try {
      const created = await createProject(data);
      await refreshProjects();
      setSelectedProjectId(created.id);
      setModal({ type: "none" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "创建失败");
    } finally {
      setLoadingAction(false);
    }
  }

  async function handleUpdateProject(data: { name: string; description: string | null }) {
    if (modal.type !== "edit-project" || !modal.project) return;
    setLoadingAction(true);
    try {
      await updateProject(modal.project.id, data);
      await refreshProjects();
      setModal({ type: "none" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "更新失败");
    } finally {
      setLoadingAction(false);
    }
  }

  async function handleDeleteProject() {
    if (modal.type !== "delete-project") return;
    setLoadingAction(true);
    try {
      await deleteProject(modal.project.id);
      if (selectedProjectId === modal.project.id) {
        setSelectedProjectId("");
        setKnowledgeBases([]);
        setSelectedKbId("");
      }
      await refreshProjects();
      setModal({ type: "none" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    } finally {
      setLoadingAction(false);
    }
  }

  // KB CRUD handlers
  async function handleCreateKB(data: Record<string, unknown>) {
    setLoadingAction(true);
    try {
      await createKnowledgeBase(selectedProjectId, data as any);
      await refreshKBs();
      setModal({ type: "none" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "创建失败");
    } finally {
      setLoadingAction(false);
    }
  }

  async function handleUpdateKB(data: Record<string, unknown>) {
    if (modal.type !== "edit-kb" || !modal.kb) return;
    const kbId = modal.kb.kb_id ?? modal.kb.id;
    if (!kbId) return;
    setLoadingAction(true);
    try {
      await updateKnowledgeBase(kbId, data as any);
      await refreshKBs();
      setModal({ type: "none" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "更新失败");
    } finally {
      setLoadingAction(false);
    }
  }

  async function handleDeleteKB() {
    if (modal.type !== "delete-kb") return;
    const kbId = modal.kb.kb_id ?? modal.kb.id;
    if (!kbId) return;
    setLoadingAction(true);
    try {
      await deleteKnowledgeBase(kbId);
      if (selectedKbId === kbId) setSelectedKbId("");
      await refreshKBs();
      setModal({ type: "none" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    } finally {
      setLoadingAction(false);
    }
  }

  const activeBuildCount = recentBuilds.filter((b) => b.status === "running" || b.status === "pending").length;
  const selectedKb = knowledgeBases.find(k => (k.kb_id ?? k.id) === selectedKbId);

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

      {/* Stats row */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {/* Project selector + buttons */}
        <article style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)" }}>
          <div style={{ color: "var(--muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>项目</div>
          {loadingProjects ? (
            <div style={{ fontSize: "1.1rem", marginTop: "0.35rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>加载中…</div>
          ) : projects.length <= 1 && projects.length > 0 ? (
            <div style={{ fontSize: "1.1rem", marginTop: "0.35rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              {projects[0].name}
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
          <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.6rem" }}>
            <button
              onClick={() => setModal({ type: "create-project" })}
              title="创建项目"
              style={btnStyle}
            >
              +
            </button>
            {selectedProjectId && projects.length > 1 ? (
              <>
                <button
                  onClick={() => {
                    const p = projects.find(x => x.id === selectedProjectId);
                    if (p) setModal({ type: "edit-project", project: p });
                  }}
                  title="编辑项目"
                  style={btnStyle}
                >
                  ✎
                </button>
                <button
                  onClick={() => {
                    const p = projects.find(x => x.id === selectedProjectId);
                    if (p) setModal({ type: "delete-project", project: p });
                  }}
                  title="删除项目"
                  style={{ ...btnStyle, color: "var(--danger)", borderColor: "var(--danger)" }}
                >
                  ✕
                </button>
              </>
            ) : null}
          </div>
        </article>

        {/* KB selector + buttons */}
        <article style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)" }}>
          <div style={{ color: "var(--muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>知识库</div>
          {!selectedProjectId ? (
            <div style={{ fontSize: "1.1rem", marginTop: "0.35rem", color: "var(--muted)" }}>请先选项目</div>
          ) : loadingKbs ? (
            <div style={{ fontSize: "1.1rem", marginTop: "0.35rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>加载中…</div>
          ) : knowledgeBases.length === 0 ? (
            <div style={{ fontSize: "1.1rem", marginTop: "0.35rem", color: "var(--muted)" }}>暂无知识库</div>
          ) : knowledgeBases.length === 1 ? (
            <div style={{ fontSize: "1.1rem", marginTop: "0.35rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              {knowledgeBases[0].name}
            </div>
          ) : (
            <select
              value={selectedKbId}
              onChange={(e) => setSelectedKbId(e.target.value)}
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
              <option value="">— 选择知识库 —</option>
              {knowledgeBases.map((kb) => (
                <option key={kb.kb_id ?? kb.id} value={kb.kb_id ?? kb.id}>{kb.name}</option>
              ))}
            </select>
          )}
          <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.6rem" }}>
            {selectedProjectId ? (
              <>
                <button
                  onClick={() => setModal({ type: "create-kb" })}
                  title="创建知识库"
                  style={btnStyle}
                >
                  +
                </button>
                {selectedKbId ? (
                  <>
                    <button
                      onClick={() => {
                        const k = knowledgeBases.find(x => (x.kb_id ?? x.id) === selectedKbId);
                        if (k) setModal({ type: "edit-kb", kb: k });
                      }}
                      title="编辑知识库"
                      style={btnStyle}
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => {
                        const k = knowledgeBases.find(x => (x.kb_id ?? x.id) === selectedKbId);
                        if (k) setModal({ type: "delete-kb", kb: k });
                      }}
                      title="删除知识库"
                      style={{ ...btnStyle, color: "var(--danger)", borderColor: "var(--danger)" }}
                    >
                      ✕
                    </button>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </article>

        {/* Recent builds count */}
        <article style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)" }}>
          <div style={{ color: "var(--muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>最近构建</div>
          <div style={{ fontSize: "2rem", marginTop: "0.35rem" }}>{recentBuilds.length}</div>
        </article>

        {/* Active builds count */}
        <article style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)" }}>
          <div style={{ color: "var(--muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>活跃构建</div>
          <div style={{ fontSize: "2rem", marginTop: "0.35rem" }}>{activeBuildCount}</div>
        </article>
      </section>

      {/* KB detail and Builds */}
      <section style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "1.5rem" }}>
        {/* Selected KB detail */}
        <article style={{ border: "1px solid var(--line)", padding: "1.25rem", background: "rgba(255,255,255,0.28)" }}>
          <h2 style={{ marginTop: 0 }}>知识库详情</h2>
          {!selectedKbId ? (
            <p style={{ color: "var(--muted)", margin: 0 }}>请选择一个知识库。</p>
          ) : selectedKb ? (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <div>
                <span style={{ color: "var(--muted)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>名称</span>
                <div style={{ fontWeight: 600 }}>{selectedKb.name}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <span style={{ color: "var(--muted)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>状态</span>
                  <div>{selectedKb.status}</div>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>可见性</span>
                  <div>{selectedKb.visibility ?? "—"}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <span style={{ color: "var(--muted)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>LLM 后端</span>
                  <div>{selectedKb.llm_backend ?? "—"}</div>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>LLM 模型</span>
                  <div>{selectedKb.llm_model_override ?? "—"}</div>
                </div>
              </div>
              <div>
                <span style={{ color: "var(--muted)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>活跃发布</span>
                <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.9rem" }}>
                  {selectedKb.active_release_id ?? "—"}
                </div>
              </div>
              <div>
                <span style={{ color: "var(--muted)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>KB ID</span>
                <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.85rem" }}>
                  {selectedKb.kb_id ?? selectedKb.id}
                </div>
              </div>
              <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.75rem" }}>
                <Link href={`/knowledge-bases/${selectedKb.kb_id ?? selectedKb.id}`} style={{ color: "var(--accent)", fontSize: "0.85rem" }}>
                  查看档案 →
                </Link>
                <Link href={`/artifacts/${selectedKb.kb_id ?? selectedKb.id}`} style={{ color: "var(--accent)", fontSize: "0.85rem" }}>
                  查看图谱 →
                </Link>
              </div>
            </div>
          ) : null}
        </article>

        {/* Recent builds */}
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

      {/* Modals */}
      {modal.type === "create-project" || modal.type === "edit-project" ? (
        <ProjectFormModal
          project={modal.type === "edit-project" ? modal.project : null}
          onSave={modal.type === "create-project" ? handleCreateProject : handleUpdateProject}
          onCancel={() => setModal({ type: "none" })}
          loading={loadingAction}
        />
      ) : null}

      {modal.type === "create-kb" || modal.type === "edit-kb" ? (
        <KBFormModal
          kb={modal.type === "edit-kb" ? modal.kb : null}
          projectId={selectedProjectId}
          onSave={modal.type === "create-kb" ? handleCreateKB : handleUpdateKB}
          onCancel={() => setModal({ type: "none" })}
          loading={loadingAction}
        />
      ) : null}

      {modal.type === "delete-project" ? (
        <ConfirmDialog
          title="删除项目"
          message={`确定要删除项目「${modal.project.name}」吗？此操作不可撤销，关联的知识库和数据源也会受影响。`}
          confirmLabel="删除"
          onConfirm={handleDeleteProject}
          onCancel={() => setModal({ type: "none" })}
          loading={loadingAction}
        />
      ) : null}

      {modal.type === "delete-kb" ? (
        <ConfirmDialog
          title="删除知识库"
          message={`确定要删除知识库「${modal.kb.name}」吗？此操作不可撤销，关联的发布和产物也会被删除。`}
          confirmLabel="删除"
          onConfirm={handleDeleteKB}
          onCancel={() => setModal({ type: "none" })}
          loading={loadingAction}
        />
      ) : null}
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.6rem",
  height: "1.6rem",
  padding: 0,
  border: "1px solid var(--line)",
  background: "transparent",
  color: "var(--ink)",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.85rem",
  lineHeight: 1,
};
