import Link from "next/link";
import { getBuildJob } from "@/lib/api";
import type { BuildJob } from "@/lib/types";

const STAGE_ORDER = [
  "resolve_job_context",
  "materialize_sources",
  "normalize_inputs",
  "run_graphify",
  "enhance_obsidian",
  "register_release",
  "activate_or_roll_back",
];

const STAGE_LABELS: Record<string, string> = {
  resolve_job_context: "Resolve Job Context",
  materialize_sources: "Materialize Sources",
  normalize_inputs: "Normalize Inputs",
  run_graphify: "Run Graphify",
  enhance_obsidian: "Enhance Obsidian",
  register_release: "Register Release",
  activate_or_roll_back: "Activate / Roll Back",
};

export const dynamic = "force-dynamic";

export default async function BuildJobDetailPage({ params }: { params: { jobId: string } }) {
  let job: BuildJob | null = null;
  let error: string | null = null;

  try {
    job = await getBuildJob(params.jobId);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error || !job) {
    return (
      <main style={{ maxWidth: 800, margin: "3rem auto", padding: "0 2rem" }}>
        <p style={{ color: "var(--danger)" }}>{error ?? "Build job not found."}</p>
        <Link href="/build-jobs">← Back to build archive</Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2.5rem 3rem" }}>
      <header style={{ borderBottom: "1px solid var(--line)", paddingBottom: "1.25rem", marginBottom: "2rem" }}>
        <p style={{ margin: 0, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.78rem" }}>
          Build Job Dossier
        </p>
        <h1 style={{ margin: "0.45rem 0 0", fontSize: "2.2rem" }}>
          <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{job.job_id}</code>
        </h1>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "2rem" }}>
        {[
          ["Knowledge Base", job.knowledge_base_id],
          ["Build Type", job.build_type],
          ["Status", job.status],
          ["Release", job.release_id ?? "—"],
          ["Started", job.started_at ?? "—"],
          ["Finished", job.finished_at ?? "—"],
        ].map(([label, value]) => (
          <div key={label} style={{ border: "1px solid var(--line)", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.28)" }}>
            <div style={{ color: "var(--muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
            <div style={{ marginTop: "0.25rem", fontFamily: label === "Knowledge Base" || label === "Release" ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "inherit" }}>{value}</div>
          </div>
        ))}
      </section>

      {job.error_summary ? (
        <section style={{ border: "1px solid var(--danger)", padding: "1rem 1.25rem", marginBottom: "2rem", background: "rgba(255,255,255,0.28)" }}>
          <h3 style={{ margin: "0 0 0.5rem", color: "var(--danger)" }}>Error Summary</h3>
          <p style={{ margin: 0, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.88rem" }}>{job.error_summary}</p>
        </section>
      ) : null}

      <section>
        <h2 style={{ margin: "0 0 1rem" }}>Stage Timeline</h2>
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
                    background: status === "completed" ? "var(--success)" : status === "running" ? "var(--warning)" : status === "failed" ? "var(--danger)" : "var(--line)",
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
