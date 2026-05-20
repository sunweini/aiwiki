interface VaultIndexBrowserProps {
  entries: string[];
}

export function VaultIndexBrowser({ entries }: VaultIndexBrowserProps) {
  return (
    <div style={{ border: "1px solid var(--line)", background: "rgba(255,255,255,0.28)" }}>
      <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid var(--line)", fontWeight: 600 }}>知识库索引</div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {entries.map((entry) => (
          <li key={entry} style={{ padding: "0.75rem 1rem", borderBottom: "1px solid rgba(215, 204, 187, 0.55)" }}>
            {entry}
          </li>
        ))}
      </ul>
    </div>
  );
}
