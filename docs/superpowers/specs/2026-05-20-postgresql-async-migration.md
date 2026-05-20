# PostgreSQL 接入 + 全面 Async 改造设计

> 状态: draft
> 日期: 2026-05-20

## 目标

将 aiwiki 后端数据库从 SQLite 迁至 PostgreSQL 16，同步完成全栈 async 化改造，引入 BaseRepository 抽象层。graphify 语义提取逻辑不动，数据库只存项目/KB/数据源/构建任务/发布版本的元数据及 ID → 文件路径映射。

## 架构概览

```
数据库 (PostgreSQL)                 文件系统 (data/)
─────────────────────────          ────────────────────────────────
projects (id, name, ...)           data/projects/{project_id}/
sources (id, project_id, name, ...)    └── sources/{source_id}/
knowledge_bases (id, project_id, ...)  └── kb/{kb_id}/
build_jobs (id, kb_id, ...)            └── builds/{job_id}/
releases (id, kb_id, ...)              └── releases/{rel_id}/
artifact_versions (path 字段)            └── graph.json, obsidian/, ...
```

graphify 自身逻辑完全不动，读文件、写文件，BuildService 负责把结果路径写回数据库。

## 设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 数据库 | PostgreSQL 16 (Homebrew) | 生产级、持久化 |
| 认证 | sunweini 用户 peer 认证 | 本地开发简化 |
| 驱动 | asyncpg | FastAPI 原生 async 支持 |
| 迁移 | 全面 async (方案 B) | 用户明确要求架构重构式 |
| 依赖管理 | requirements.txt | 用户习惯 |

## 1. 数据模型 (不变)

现有 7 张表结构不变，字段不变，仅 engine 从 SQLite 切至 PostgreSQL。

### ID 命名规范

| 前缀 | 实体 | 示例 | 可编辑 |
|------|------|------|--------|
| `proj_` | Project | `proj_delivery_alpha` | 否 |
| `src_` | Source | `src_7967b607db94` | 否 |
| `kb_` | KnowledgeBase | `kb_f871e0fc2f2b` | 否 |
| `bind_` | Binding | `bind_5cc68cca2fa9` | 否 |
| `job_` | BuildJob | `job_0898194ed50d` | 否 |
| `rel_` | Release | `rel_dc338a7102f1` | 否 |
| `art_` | ArtifactVersion | `art_rel_xxx_graph` | 否 |

### display name vs ID

- **name** (显示名称): Project / Source / KB 有此字段，支持中文，前端展示用，**可编辑**
- **id**: 所有实体都有，英文+数字，创建时生成，**不可变**，后端创建目录/文件用

### CRUD 约束

- 创建 KB 必须先选 Project，`project_id` 创建后不可改
- 编辑操作只改 `name` 字段，ID 不可变
- 删除 Project 需检查是否有关联 KB/Source，有关联时拒绝或级联标记

## 2. 数据库连接层

### 新文件: `backend/app/db/database.py`

替代 `base.py` 的 engine/session 创建职责：

```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

engine = create_async_engine(
    settings.database_url,       # postgresql+asyncpg://sunweini@localhost:5432/aiwiki
    pool_size=settings.db_pool_size,           # 10
    max_overflow=settings.db_max_overflow,      # 20
    pool_recycle=settings.db_pool_recycle_seconds,  # 3600
    pool_pre_ping=True,
    echo=settings.environment == "dev",
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

async def get_async_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

### 改动: `backend/app/config.py`

```python
database_url: str = "postgresql+asyncpg://sunweini@localhost:5432/aiwiki"
db_pool_size: int = 10
db_max_overflow: int = 20
db_pool_recycle_seconds: int = 3600
```

环境变量前缀 `AIKB_` 覆盖所有字段。

## 3. Repository 层

### 新文件: `backend/app/db/repository.py`

泛型基类，提供通用 CRUD：

```python
from typing import Generic, TypeVar
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

T = TypeVar("T")

class BaseRepository(Generic[T]):
    model: type[T]

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(self, id: str) -> T | None:
        return await self.session.get(self.model, id)

    async def list(self, *filters, limit: int = 100, offset: int = 0) -> list[T]:
        stmt = select(self.model).filter(*filters).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, entity: T) -> T:
        self.session.add(entity)
        await self.session.commit()
        await self.session.refresh(entity)
        return entity

    async def update(self, entity: T) -> T:
        self.session.add(entity)
        await self.session.commit()
        return entity

    async def delete(self, entity: T) -> None:
        await self.session.delete(entity)
        await self.session.commit()
```

### 改造: 6 个 Repository

全部改为继承 `BaseRepository[Model]`，删除重复的 CRUD 代码，只保留特殊查询：

- `SourceRepository`: 保留 `list_by_project()`, `list_all_polling()`
- `KnowledgeBaseRepository`: 保留 `list_by_project()` 等
- `BuildJobRepository`: 保留 `list_by_kb()`, `list_by_kb_paginated()`, `list_sources()`
- `ReleaseRepository`: 保留 `list_by_kb()`, `get_active_release_id()`
- `ArtifactVersionRepository`: 保留 `batch_create()`
- `BindingRepository`: 保留 `list_by_kb()` 等

## 4. Service 层

所有 Service 方法改为 `async def`，`Session` → `AsyncSession`。

### 请求级 Service

```python
class SourceService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = SourceRepository(session)

    async def create_source(self, project_id: str, payload: SourceCreate) -> Source:
        source = Source(id=f"src_{uuid4().hex[:12]}", project_id=project_id, ...)
        return await self.repo.create(source)

    async def update_source(self, source_id: str, payload: SourceUpdate) -> Source:
        source = await self.repo.get(source_id)
        if source is None:
            raise ValueError("not found")
        source.name = payload.name          # 只改 name
        # source.id 不可变
        return await self.repo.update(source)

    async def delete_source(self, source_id: str) -> None:
        source = await self.repo.get(source_id)
        if source is None:
            raise ValueError("not found")
        await self.repo.delete(source)
```

### BuildService

- `create_build_job()` → 改为 async
- `_update_job_stage()` → async，通过 `AsyncSessionLocal()` 获取 session
- `_persist_result()` → async
- `_mark_job_failed()` → async
- `_read_llm_config()` → async
- `enqueue_build()` → GraphifyRunner.run() 仍用 `run_in_executor`（graphify 同步），数据库部分 async

### 不动的 Service

- `GraphifyQueryAdapter`: 纯静态方法，只读 graph 文件，不走数据库
- `MCPGatewayService`: 只读 graph 文件 + 调用 GraphifyQueryAdapter，不走数据库

## 5. API 路由层

### 依赖注入替换

```python
# 之前
from app.db.base import SessionLocal
def get_session() -> Session: ...

# 之后
from app.db.database import get_async_session

@router.get("/")
async def list_items(..., session: AsyncSession = Depends(get_async_session)):
    ...
```

### CRUD 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/projects` | 创建 Project |
| GET | `/api/projects` | 列表 Project |
| PUT | `/api/projects/{project_id}` | 编辑 name |
| DELETE | `/api/projects/{project_id}` | 删除 Project |
| POST | `/api/projects/{project_id}/sources` | 创建 Source |
| GET | `/api/projects/{project_id}/sources` | 列表 Source |
| PUT | `/api/sources/{source_id}` | 编辑 name |
| DELETE | `/api/sources/{source_id}` | 删除 Source |
| POST | `/api/projects/{project_id}/knowledge-bases` | 创建 KB (绑定 Project) |
| GET | `/api/projects/{project_id}/knowledge-bases` | 列表 KB |
| PUT | `/api/knowledge-bases/{kb_id}` | 编辑 name |
| DELETE | `/api/knowledge-bases/{kb_id}` | 删除 KB |

## 6. Alembic

### 改动: `backend/alembic/env.py`

`settings.database_url` 现在是 `postgresql+asyncpg://...`，alembic 不支持 async 驱动。需要在 env.py 中做 scheme 替换：

```python
from app.config import settings

sync_url = settings.database_url.replace("+asyncpg", "")
config.set_main_option("sqlalchemy.url", sync_url)
```

迁移脚本不变（5 个版本）。

## 7. 依赖文件

### 新建: `backend/requirements.txt`

```text
fastapi>=0.115.0
uvicorn[standard]>=0.34.0
sqlalchemy[asyncio]>=2.0.30
asyncpg>=0.30.0
alembic>=1.18.0
pydantic>=2.10.0
pydantic-settings>=2.7.0
psycopg2-binary>=2.9.10
redis>=5.2.0
httpx>=0.28.0
python-multipart>=0.0.19
```

## 8. 启动流程

### 改动: `backend/app/main.py`

- `startup_create_tables()` → 不再需要 `Base.metadata.create_all()`（用 alembic migration），但开发环境保留
- `startup_git_poll()` → git 轮询循环改为 async session

## 9. 文件改动清单

| 操作 | 文件 | 说明 |
|------|------|------|
| 新建 | `backend/app/db/database.py` | async engine, session factory, get_async_session |
| 新建 | `backend/app/db/repository.py` | BaseRepository[T] 泛型基类 |
| 新建 | `backend/requirements.txt` | 依赖管理 |
| 改造 | `backend/app/config.py` | URL scheme + 连接池配置 |
| 改造 | `backend/app/db/base.py` | 删 engine/session 创建，保留 Base |
| 改造 | `backend/app/repositories/*.py` | 6 个继承 BaseRepository |
| 改造 | `backend/app/services/*.py` | 全面 async |
| 改造 | `backend/app/api/routes/*.py` | async 端点 + get_async_session |
| 改造 | `backend/app/api/routes/knowledge_bases.py` | PUT/DELETE KB |
| 改造 | `backend/app/api/routes/sources.py` | PUT/DELETE Source |
| 改造 | `backend/app/main.py` | startup 事件 async |
| 改造 | `backend/alembic/env.py` | URL scheme 替换 |
| 不动 | `backend/app/runner/graphify_runner.py` | graphify 逻辑不动 |
| 不动 | `backend/app/runner/workspace.py` | 文件系统操作不动 |
| 不动 | `backend/app/runner/source_materializer.py` | 文件同步不动 |
| 不动 | `backend/app/services/graphify_query_adapter.py` | 纯读文件不动 |

## 10. 测试策略

- 所有现有测试（33 个）需适配 async fixture
- pytest 加 `pytest-asyncio` 依赖
- Database fixture: 用测试 PostgreSQL 数据库或 SQLite :memory:（测试不强制 PG）
- BuildService 测试: mock AsyncSession + BaseRepository

## 11. 前端改动 (out of scope here, 单独设计)

- 项目管理页: 创建/编辑/删除 Project
- 知识库管理: 选择 Project → 创建 KB
- 数据源管理: 创建/编辑/删除 Source
- 构建触发: 已有的 create build 端点
