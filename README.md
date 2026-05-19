# AI Code KB Platform

本地开发以 `backend/` 和 `frontend/` 两个目录分别启动。

## Backend

1. 安装 Python 依赖。
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -U pip
   pip install fastapi uvicorn sqlalchemy alembic pydantic-settings redis celery pytest
   ```
2. 配置环境变量。
   ```bash
   export AIKB_DATABASE_URL="postgresql+psycopg://user:password@localhost:5432/aikb"
   export AIKB_REDIS_URL="redis://localhost:6379/0"
   ```
3. 执行数据库迁移。
   ```bash
   alembic upgrade head
   ```
4. 启动 FastAPI。
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
5. 启动 Celery worker。
   ```bash
   celery -A app.tasks worker --loglevel=info
   ```

## Frontend

1. 安装依赖。
   ```bash
   cd frontend
   npm install
   ```
2. 启动 Next.js 开发服务器。
   ```bash
   npm run dev
   ```

## Minimum Demo Loop

最小可演示闭环按以下顺序串联 source → knowledge base → binding → build → release/artifact 查询 → MCP 状态：

1. 创建 source。
   ```bash
   curl -X POST http://localhost:8000/api/projects/proj_delivery_alpha/sources \
     -H 'Content-Type: application/json' \
     -d '{"name":"checkout-service","type":"github_repo","source_ref":"acme/checkout-service","sync_strategy":"webhook"}'
   ```
2. 创建 knowledge base，记录返回的 `id` 作为 `<KB_ID>`。
   ```bash
   curl -X POST http://localhost:8000/api/projects/proj_delivery_alpha/knowledge-bases \
     -H 'Content-Type: application/json' \
     -d '{"name":"Checkout Core","visibility":"org_shared"}'
   ```
3. 将 source 绑定到 knowledge base。
   ```bash
   curl -X POST http://localhost:8000/api/knowledge-bases/<KB_ID>/bindings \
     -H 'Content-Type: application/json' \
     -d '{"source_id":"<SOURCE_ID>","binding_status":"active"}'
   ```
4. 触发构建任务。
   ```bash
   curl -X POST http://localhost:8000/api/knowledge-bases/<KB_ID>/builds \
     -H 'Content-Type: application/json' \
     -d '{"build_type":"incremental_update","triggered_by":"manual","reason":"demo"}'
   ```
5. 查询 releases 列表。
   ```bash
   curl http://localhost:8000/api/knowledge-bases/<KB_ID>/releases
   ```
6. 查询当前 artifacts。
   ```bash
   curl http://localhost:8000/api/knowledge-bases/<KB_ID>/artifacts
   ```
7. 查询 MCP knowledge base 状态。
   ```bash
   curl -X POST http://localhost:8000/mcp/kb_status \
     -H 'Content-Type: application/json' \
     -d '{"kb_id":"<KB_ID>"}'
   ```

集成测试覆盖以上闭环：

```bash
cd backend
pytest tests/test_closure_flow.py -v
```


## 测试

```bash
cd backend && python3 -m pytest tests/ -v  # 51 tests
cd frontend && npx tsc --noEmit             # type check
```

## 文档

- [开发环境搭建](docs/DEV_SETUP.md)
- [API 参考](docs/API_REFERENCE.md)
- [架构设计](docs/ARCHITECTURE.md)
- [数据模型](docs/DATA_MODELS.md)
