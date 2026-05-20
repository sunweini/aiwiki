import os

# Override stale env vars before any app import touches Settings()
os.environ.pop("AIKB_DATABASE_URL", None)
os.environ["AIKB_DB_POOL_PRE_PING"] = "false"

import pytest
import pytest_asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


def pytest_configure(config):
    """Strict asyncio mode — only marked tests run async. Session-scoped event loops."""
    config.option.asyncio_mode = "strict"
    if hasattr(config, "inicfg"):
        config.inicfg["asyncio_default_fixture_loop_scope"] = "session"
        config.inicfg["asyncio_default_test_loop_scope"] = "session"

from app.config import settings
from app.db.base import Base

# FK-safe truncation: null circular refs, then child→parent order.
# After nulling active_release_id and release_id:
#   - artifact_versions → releases
#   - releases → build_jobs (NOT NULL)
#   - kb_source_bindings → knowledge_bases + sources
#   - build_jobs → knowledge_bases
#   - knowledge_bases → projects
_TRUNCATE_ORDER = [
    "artifact_versions",
    "knowledge_base_source_bindings",
    "releases",         # child of build_jobs
    "build_jobs",       # child of knowledge_bases; parent of releases (already deleted)
    "knowledge_bases",  # parent
    "sources",
    "projects",
]

_TRUNCATE_NULLS = [
    ("knowledge_bases", "active_release_id"),
    ("build_jobs", "release_id"),
]


@pytest_asyncio.fixture(scope="session")
async def _test_engine():
    """Session-scoped test engine — created fresh in the test event loop."""
    import app.db.models  # noqa: F401  # ensure all models registered

    engine = create_async_engine(
        settings.database_url,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_recycle=settings.db_pool_recycle_seconds,
        pool_pre_ping=True,
        echo=settings.environment == "dev",
    )

    # Replace module-level engine + sessionmaker so app code uses test engine
    import app.db.database as db_module

    await db_module.engine.dispose()
    db_module.engine = engine
    db_module.AsyncSessionLocal.configure(bind=engine)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        for table_name in _TRUNCATE_ORDER:
            await conn.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
    await engine.dispose()


@pytest_asyncio.fixture(autouse=True)
async def _clean_data(_test_engine):
    """Truncate data before and after each test."""
    async with _test_engine.begin() as conn:
        for table, col in _TRUNCATE_NULLS:
            await conn.execute(text(f"UPDATE {table} SET {col}=NULL"))
        for table_name in _TRUNCATE_ORDER:
            await conn.execute(text(f"DELETE FROM {table_name}"))
    yield
    async with _test_engine.begin() as conn:
        for table, col in _TRUNCATE_NULLS:
            await conn.execute(text(f"UPDATE {table} SET {col}=NULL"))
        for table_name in _TRUNCATE_ORDER:
            await conn.execute(text(f"DELETE FROM {table_name}"))


@pytest_asyncio.fixture
async def async_session():
    import app.db.database as db_module

    async with db_module.AsyncSessionLocal() as session:
        yield session
