"use client";

import { FormEvent, useEffect, useState } from "react";
import type { KnowledgeBaseSummary } from "@/lib/types";

interface KBFormModalProps {
  kb?: KnowledgeBaseSummary | null;
  projectId: string;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function KBFormModal({ kb, projectId, onSave, onCancel, loading }: KBFormModalProps) {
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState("org_shared");
  const [description, setDescription] = useState("");
  const [llmBackend, setLlmBackend] = useState("deepseek");
  const [llmModel, setLlmModel] = useState("deepseek-v4-flash");

  useEffect(() => {
    if (kb) {
      setName(kb.name ?? "");
      setVisibility(kb.visibility ?? "org_shared");
      setDescription(kb.description ?? "");
      setLlmBackend(kb.llm_backend ?? "deepseek");
      setLlmModel(kb.llm_model_override ?? "deepseek-v4-flash");
    } else {
      setName("");
      setVisibility("org_shared");
      setDescription("");
      setLlmBackend("deepseek");
      setLlmModel("deepseek-v4-flash");
    }
  }, [kb]);

  const isEdit = !!kb;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await onSave({
      name: name.trim(),
      visibility,
      description: description.trim() || null,
      llm_backend: llmBackend,
      llm_model_override: llmModel,
    });
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
          maxWidth: 520,
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "grid",
          gap: "1rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.3rem" }}>{isEdit ? "编辑知识库" : "创建知识库"}</h2>

        {!isEdit ? (
          <div style={{ padding: "0.6rem 0.75rem", background: "rgba(39, 76, 91, 0.06)", border: "1px solid rgba(39, 76, 91, 0.15)", fontSize: "0.85rem", color: "var(--muted)" }}>
            关联项目{" "}
            <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: "var(--ink)" }}>{projectId}</code>
          </div>
        ) : null}

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
            可见性
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem",
              border: "1px solid var(--line)",
              background: "white",
              fontFamily: "inherit",
              fontSize: "0.95rem",
              color: "var(--ink)",
            }}
          >
            <option value="private">Private</option>
            <option value="org_shared">Org Shared</option>
            <option value="public">Public</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.3rem", color: "var(--muted)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            描述
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
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

        <fieldset style={{ border: "1px solid var(--line)", padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <legend style={{ color: "var(--muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>LLM 配置</legend>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.2rem", color: "var(--muted)", fontSize: "0.78rem" }}>后端</label>
              <select
                value={llmBackend}
                onChange={(e) => setLlmBackend(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid var(--line)",
                  background: "white",
                  fontFamily: "inherit",
                  fontSize: "0.9rem",
                  color: "var(--ink)",
                }}
              >
                <option value="deepseek">DeepSeek</option>
                <option value="openai">OpenAI</option>
                <option value="claude">Claude</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.2rem", color: "var(--muted)", fontSize: "0.78rem" }}>模型</label>
              <input
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid var(--line)",
                  background: "white",
                  fontFamily: "inherit",
                  fontSize: "0.9rem",
                  color: "var(--ink)",
                }}
              />
            </div>
          </div>
        </fieldset>

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
