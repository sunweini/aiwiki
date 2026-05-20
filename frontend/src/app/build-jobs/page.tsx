import Link from "next/link";
import { listAllBuildJobs } from "@/lib/api";
import type { BuildJob } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  pending: "等待中",
  preparing_sources: "准备数据源",
  running_graphify: "运行 Graphify",
  generating_obsidian: "生成 Obsidian",
  registering_artifacts: "注册产物",
  completed: "已完成",
  partial_success: "部分成功",
  failed: "失败",
  cancelled: "已取消",
};

export const dynamic = "force-dynamic";

export default async function BuildJobsPage() {
  let jobs: BuildJob[] = [];
  let error: string | null = null;

  try {
    jobs = await listAllBuildJobs();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "2.5rem 3rem" }}>
      <header style={{ borderBottom: "1px solid var(--line)", paddingBottom: "1.25rem", marginBottom: "2rem" }}>
        <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.78rem" }}>
          构建归档
        </p>
        <h1 style={{ margin: "0.45rem 0 0", fontSize: "2.2rem" }}>构建任务</h1>
      </header>

      {error ? (
        <p style={{ color: "var(--danger)" }}>{error}</p>
      ) : jobs.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>暂无构建任务记录。</p>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {jobs.map((job) => (
            <article
              key={job.job_id}
              style={{ border: "1px solid var(--line)", padding: "1rem 1.25rem", background: "rgba(255,255,255,0.28)", display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "center" }}
            >
              <div>
                <Link href={`/build-jobs/${job.job_id}`} style={{ fontWeight: 600 }}>
                  <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{job.job_id}</code>
                </Link>
                <div style={{ color: "var(--muted)", fontSize: "0.88rem", marginTop: "0.25rem" }}>
                  <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{job.knowledge_base_id}</span>
                  {" · "}{job.build_type}{" · "}{job.started_at ?? "—"}
                </div>
              </div>
              <span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: job.status === "failed" ? "var(--danger)" : job.status === "completed" ? "var(--success)" : "var(--muted)" }}>
                {STATUS_LABELS[job.status] ?? job.status}
              </span>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
