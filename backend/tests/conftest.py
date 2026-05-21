import os

# Route tests to a SEPARATE database so production data is never touched.
# The test DB is created/destroyed inside the _test_engine fixture.
_test_db_url = "postgresql+asyncpg://sunweini@localhost:5432/aiwiki_test"
os.environ["AIKB_DATABASE_URL"] = _test_db_url
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


def _create_test_database():
    """Create the test database if it doesn't exist (sync, outside any transaction)."""
    from sqlalchemy import create_engine as sync_create_engine

    # Parse the async URL into a sync one for the maintenance "postgres" database
    # asyncpg URL: postgresql+asyncpg://user@host:port/dbname
    sync_url = settings.database_url.replace("+asyncpg", "")
    base = sync_url.rsplit("/", 1)[0] + "/postgres"
    db_name = sync_url.rsplit("/", 1)[1].split("?")[0]

    maint = sync_create_engine(base, isolation_level="AUTOCOMMIT")
    with maint.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :name"),
            {"name": db_name},
        ).scalar()
        if not exists:
            conn.execute(text(f"CREATE DATABASE {db_name}"))
    maint.dispose()


@pytest_asyncio.fixture(scope="session")
async def _test_engine():
    """Session-scoped test engine — uses isolated test database, dropped after tests."""
    import app.db.models  # noqa: F401  # ensure all models registered

    _create_test_database()

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
