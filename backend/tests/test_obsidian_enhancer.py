from pathlib import Path

from app.runner.obsidian_enhancer import ObsidianEnhancer


def test_obsidian_enhancer_is_idempotent(tmp_path: Path) -> None:
    vault = tmp_path / "obsidian"
    vault.mkdir()
    (vault / "index.md").write_text("# Vault\n", encoding="utf-8")

    enhancer = ObsidianEnhancer()
    enhancer.apply(vault, kb_id="kb_checkout_core", release_id="rel_2026_05_19_001")
    enhancer.apply(vault, kb_id="kb_checkout_core", release_id="rel_2026_05_19_001")

    content = (vault / "index.md").read_text(encoding="utf-8")
    assert content.count("kb_checkout_core") == 1


def test_creates_index_when_missing(tmp_path: Path) -> None:
    vault = tmp_path / "obsidian"
    vault.mkdir()

    enhancer = ObsidianEnhancer()
    enhancer.apply(vault, kb_id="kb_test", release_id="rel_001")

    index_path = vault / "index.md"
    assert index_path.exists()
    content = index_path.read_text(encoding="utf-8")
    assert "kb_test" in content
    assert "rel_001" in content
