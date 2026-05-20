import pytest
from sqlalchemy import inspect


def _get_engine():
    import app.db.database as db_module
    return db_module.engine


def _inspect_tables(sync_conn):
    return set(inspect(sync_conn).get_table_names())


def _inspect_fks(sync_conn):
    inspector = inspect(sync_conn)
    return {
        table_name: {
            tuple(fk["constrained_columns"]): (
                fk["referred_table"],
                tuple(fk["referred_columns"]),
            )
            for fk in inspector.get_foreign_keys(table_name)
        }
        for table_name in {
            "sources",
            "knowledge_bases",
            "knowledge_base_source_bindings",
            "build_jobs",
            "releases",
            "artifact_versions",
        }
    }


def _inspect_columns(sync_conn, table_name):
    inspector = inspect(sync_conn)
    return {col["name"]: col for col in inspector.get_columns(table_name)}


@pytest.mark.asyncio
async def test_core_tables_exist() -> None:
    async with _get_engine().connect() as conn:
        tables = await conn.run_sync(_inspect_tables)

    assert "projects" in tables
    assert "sources" in tables
    assert "knowledge_bases" in tables
    assert "knowledge_base_source_bindings" in tables
    assert "build_jobs" in tables
    assert "releases" in tables
    assert "artifact_versions" in tables


@pytest.mark.asyncio
async def test_core_foreign_keys_exist() -> None:
    async with _get_engine().connect() as conn:
        foreign_keys = await conn.run_sync(_inspect_fks)

    assert foreign_keys["sources"] == {
        ("project_id",): ("projects", ("id",)),
    }
    assert foreign_keys["knowledge_bases"] == {
        ("project_id",): ("projects", ("id",)),
        ("active_release_id",): ("releases", ("id",)),
    }
    assert foreign_keys["knowledge_base_source_bindings"] == {
        ("knowledge_base_id",): ("knowledge_bases", ("id",)),
        ("source_id",): ("sources", ("id",)),
    }
    assert foreign_keys["build_jobs"] == {
        ("knowledge_base_id",): ("knowledge_bases", ("id",)),
        ("release_id",): ("releases", ("id",)),
    }
    assert foreign_keys["releases"] == {
        ("knowledge_base_id",): ("knowledge_bases", ("id",)),
        ("build_job_id",): ("build_jobs", ("id",)),
    }
    assert foreign_keys["artifact_versions"] == {
        ("release_id",): ("releases", ("id",)),
    }


@pytest.mark.asyncio
async def test_nullable_foreign_key_columns() -> None:
    async with _get_engine().connect() as conn:
        kb_cols = await conn.run_sync(_inspect_columns, "knowledge_bases")
        bj_cols = await conn.run_sync(_inspect_columns, "build_jobs")

    assert kb_cols["active_release_id"]["nullable"] is True
    assert bj_cols["release_id"]["nullable"] is True


@pytest.mark.asyncio
async def test_build_job_timestamp_columns_exist() -> None:
    async with _get_engine().connect() as conn:
        bj_cols = await conn.run_sync(_inspect_columns, "build_jobs")
        rel_cols = await conn.run_sync(_inspect_columns, "releases")

    assert "created_at" in bj_cols
    assert bj_cols["created_at"]["nullable"] is False
    assert "started_at" in bj_cols
    assert bj_cols["started_at"]["nullable"] is False

    assert "created_at" in rel_cols
    assert rel_cols["created_at"]["nullable"] is False
