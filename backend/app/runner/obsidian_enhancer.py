from pathlib import Path


class ObsidianEnhancer:
    def apply(self, vault: Path, kb_id: str, release_id: str | None) -> None:
        index_path = vault / "index.md"
        if not index_path.exists():
            index_path.write_text(f"# {kb_id}\n\nKnowledge base vault.\n", encoding="utf-8")
        marker = f"\nKB: {kb_id}\nRelease: {release_id}\n"
        content = index_path.read_text(encoding="utf-8")
        if marker not in content:
            index_path.write_text(content + marker, encoding="utf-8")
