type Tone = "accent" | "success" | "warning" | "danger" | "muted";

interface StatusChip {
  label: string;
  tone: Tone;
}

interface ReleaseStatusChipsProps {
  items: StatusChip[];
}

const toneMap: Record<Tone, { background: string; color: string; border: string }> = {
  accent: { background: "rgba(39, 76, 91, 0.08)", color: "var(--accent)", border: "rgba(39, 76, 91, 0.22)" },
  success: { background: "rgba(86, 122, 99, 0.08)", color: "var(--success)", border: "rgba(86, 122, 99, 0.22)" },
  warning: { background: "rgba(155, 107, 47, 0.08)", color: "var(--warning)", border: "rgba(155, 107, 47, 0.22)" },
  danger: { background: "rgba(138, 59, 50, 0.08)", color: "var(--danger)", border: "rgba(138, 59, 50, 0.22)" },
  muted: { background: "rgba(111, 104, 95, 0.08)", color: "var(--muted)", border: "rgba(111, 104, 95, 0.18)" },
};

export function ReleaseStatusChips({ items }: ReleaseStatusChipsProps) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
      {items.map((item) => {
        const tone = toneMap[item.tone];
        return (
          <span
            key={item.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.35rem 0.75rem",
              borderRadius: 999,
              border: `1px solid ${tone.border}`,
              background: tone.background,
              color: tone.color,
              fontSize: "0.82rem",
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </span>
        );
      })}
    </div>
  );
}
