from sqlalchemy import inspect

from app.db.base import Base, engine
from app.db.models import ArtifactVersion, BuildJob, KnowledgeBase, KnowledgeBaseSourceBinding, Project, Release, Source


def test_core_tables_exist() -> None:
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)

    tables = set(inspector.get_table_names())

    assert "projects" in tables
    assert "sources" in tables
    assert "knowledge_bases" in tables
    assert "knowledge_base_source_bindings" in tables
    assert "build_jobs" in tables
    assert "releases" in tables
    assert "artifact_versions" in tables


def test_core_foreign_keys_exist() -> None:
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)

    foreign_keys = {
        table_name: {
            tuple(foreign_key["constrained_columns"]): (
                foreign_key["referred_table"],
                tuple(foreign_key["referred_columns"]),
            )
            for foreign_key in inspector.get_foreign_keys(table_name)
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


def test_nullable_foreign_key_columns() -> None:
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)

    knowledge_base_columns = {
        column["name"]: column for column in inspector.get_columns("knowledge_bases")
    }
    build_job_columns = {
        column["name"]: column for column in inspector.get_columns("build_jobs")
    }

    assert knowledge_base_columns["active_release_id"]["nullable"] is True
    assert build_job_columns["release_id"]["nullable"] is True


def test_build_job_timestamp_columns_exist() -> None:
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)

    build_job_columns = {
        column["name"]: column for column in inspector.get_columns("build_jobs")
    }

    assert "created_at" in build_job_columns
    assert build_job_columns["created_at"]["nullable"] is False
    assert "started_at" in build_job_columns
    assert build_job_columns["started_at"]["nullable"] is False
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)

    release_columns = {
        column["name"]: column for column in inspector.get_columns("releases")
    }

    assert "created_at" in release_columns
    assert release_columns["created_at"]["nullable"] is False
