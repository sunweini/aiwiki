"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Project } from "@/lib/types";

interface ProjectFormModalProps {
  project?: Project | null;
  onSave: (data: { name: string; description: string | null }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ProjectFormModal({ project, onSave, onCancel, loading }: ProjectFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setName(project?.name ?? "");
    setDescription(project?.description ?? "");
  }, [project]);

  const isEdit = !!project;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await onSave({ name: name.trim(), description: description.trim() || null });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(31, 26, 23, 0.35)",
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          padding: "1.75rem",
          maxWidth: 480,
          width: "90%",
          display: "grid",
          gap: "1rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.3rem" }}>{isEdit ? "编辑项目" : "创建项目"}</h2>

        <div>
          <label style={{ display: "block", marginBottom: "0.3rem", color: "var(--muted)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            名称 *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.6rem",
              border: "1px solid var(--line)",
              background: "white",
              fontFamily: "inherit",
              fontSize: "0.95rem",
              color: "var(--ink)",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.3rem", color: "var(--muted)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            描述
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "0.6rem",
              border: "1px solid var(--line)",
              background: "white",
              fontFamily: "inherit",
              fontSize: "0.95rem",
              color: "var(--ink)",
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "0.55rem 1.25rem",
              border: "1px solid var(--line)",
              background: "transparent",
              color: "var(--ink)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "0.9rem",
            }}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            style={{
              padding: "0.55rem 1.25rem",
              border: "1px solid var(--accent)",
              background: "var(--accent)",
              color: "white",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "0.9rem",
            }}
          >
            {loading ? "保存中…" : isEdit ? "保存" : "创建"}
          </button>
        </div>
      </form>
    </div>
  );
}
