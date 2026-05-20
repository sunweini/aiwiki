"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BuildJob } from "@/lib/types";
import { getBuildJob } from "@/lib/api";

const STAGE_ORDER = [
  "validate_boundary",
  "resolve_job_context",
  "materialize_sources",
  "normalize_inputs",
  "extract",
  "build",
  "validate",
  "cluster",
  "analyze",
  "report",
  "export_obsidian",
  "export_wiki",
  "export_visual",
  "enhance_obsidian",
  "verify_query",
  "register_release",
  "activate_or_roll_back",
];

const STAGE_LABELS: Record<string, string> = {
  validate_boundary: "边界校验",
  resolve_job_context: "解析任务上下文",
  materialize_sources: "物化数据源",
  normalize_inputs: "标准化输入",
  extract: "提取图谱",
  build: "构建图谱",
  validate: "验证图谱",
  cluster: "社区发现",
  analyze: "图谱分析",
  report: "生成报告",
  export_obsidian: "导出 Obsidian",
  export_wiki: "导出 Wiki",
  export_visual: "导出可视化",
  enhance_obsidian: "增强 Obsidian",
  verify_query: "验证查询",
  register_release: "注册发布",
  activate_or_roll_back: "激活 / 回滚",
};

export default function BuildJobDetailPage({ params }: { params: { jobId: string } }) {
  const [job, setJob] = useState<BuildJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    async function fetchJob() {
      try {
        const data = await getBuildJob(params.jobId);
        if (!active) return;
        setJob(data);
        if (data.status === "completed" || data.status === "failed") {
          if (interval != null) clearInterval(interval);
        }
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : String(e));
      }
    }

    fetchJob();
    interval = setInterval(fetchJob, 2000);

    return () => {
      active = false;
      if (interval != null) clearInterval(interval);
    };
  }, [params.jobId]);

  if (error && !job) {
    return (
      <main style={{ maxWidth: 800, margin: "3rem auto", padding: "0 2rem" }}>
        <p style={{ color: "var(--danger)" }}>{error}</p>
        <Link href="/build-jobs">← 返回构建归档</Link>
      </main>
    );
  }

  if (!job) {
    return (
      <main style={{ maxWidth: 800, margin: "3rem auto", padding: "0 2rem" }}>
        <p>加载中...</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2.5rem 3rem" }}>
      <header style={{ borderBottom: "1px solid var(--line)", paddingBottom: "1.25rem", marginBottom: "2rem" }}>
        <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.78rem" }}>
          构建任务档案
        </p>
        <h1 style={{ margin: "0.45rem 0 0", fontSize: "2.2rem" }}>
          <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{job.job_id}</code>
        </h1>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "2rem" }}>
        {[
          ["知识库", job.knowledge_base_id],
          ["构建类型", job.build_type],
          ["状态", job.status],
          ["当前阶段", job.current_stage ?? "—"],
          ["发布", job.release_id ?? "—"],
          ["开始时间", job.started_at ?? "—"],
          ["结束时间", job.finished_at ?? "—"],
        ].map(([label, value]) => (
          <div key={label} style={{ border: "1px solid var(--line)", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.28)" }}>
            <div style={{ color: "var(--muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
            <div style={{ marginTop: "0.25rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{value}</div>
          </div>
        ))}
      </section>

      {job.error_summary ? (
        <section style={{ border: "1px solid var(--danger)", padding: "1rem 1.25rem", marginBottom: "2rem", background: "rgba(255,255,255,0.28)" }}>
          <h3 style={{ margin: "0 0 0.5rem", color: "var(--danger)" }}>错误摘要</h3>
          <p style={{ margin: 0, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.88rem" }}>{job.error_summary}</p>
        </section>
      ) : null}

      <section>
        <h2 style={{ margin: "0 0 1rem" }}>阶段时间线</h2>
        <div style={{ border: "1px solid var(--line)", background: "rgba(255,255,255,0.28)" }}>
          {STAGE_ORDER.map((stage, i) => {
            const isLast = i === STAGE_ORDER.length - 1;
            const stageData = job.stages?.find((s) => s.name === stage);
            const status = stageData?.status ?? "pending";
            return (
              <div
                key={stage}
                style={{
                  padding: "0.75rem 1.25rem",
                  display: "grid",
                  gridTemplateColumns: "1.5rem 1fr auto",
                  gap: "1rem",
                  alignItems: "center",
                  borderBottom: isLast ? "none" : "1px solid var(--line)",
                }}
              >
                <span
                  style={{
                    width: "0.7rem",
                    height: "0.7rem",
                    borderRadius: "50%",
                    display: "inline-block",
                    background: status === "completed" ? "var(--success)" :
                      status === "running" ? "var(--warning)" :
                      status === "failed" ? "var(--danger)" : "var(--line)",
                  }}
                />
                <span>{STAGE_LABELS[stage] ?? stage}</span>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{status}</span>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
