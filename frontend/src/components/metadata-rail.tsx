interface MetadataRailSection {
  title: string;
  items: Array<{ label: string; value: string }>;
}

interface MetadataRailProps {
  sections: MetadataRailSection[];
}

export function MetadataRail({ sections }: MetadataRailProps) {
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {sections.map((section) => (
        <section key={section.title} style={{ border: "1px solid var(--line)", padding: "1rem", background: "rgba(255,255,255,0.28)" }}>
          <h3 style={{ margin: 0, fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{section.title}</h3>
          <dl style={{ margin: "0.9rem 0 0", display: "grid", gap: "0.6rem" }}>
            {section.items.map((item) => (
              <div key={item.label}>
                <dt style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{item.label}</dt>
                <dd style={{ margin: "0.18rem 0 0", wordBreak: "break-word" }}>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
