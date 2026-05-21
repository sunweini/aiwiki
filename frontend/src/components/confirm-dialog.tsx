"use client";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({ title, message, confirmLabel = "删除", onConfirm, onCancel, loading }: ConfirmDialogProps) {
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
      <div
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          padding: "1.75rem",
          maxWidth: 420,
          width: "90%",
        }}
      >
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.3rem" }}>{title}</h2>
        <p style={{ margin: "0 0 1.5rem", color: "var(--muted)", lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button
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
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "0.55rem 1.25rem",
              border: "1px solid var(--danger)",
              background: "var(--danger)",
              color: "white",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "0.9rem",
            }}
          >
            {loading ? "处理中…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
