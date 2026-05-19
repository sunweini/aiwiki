# 开发环境搭建

## 依赖

| 组件 | 版本要求 |
|------|----------|
| Python | 3.12+ |
| Node.js | 18+ |
| PostgreSQL | 16+ (或 SQLite 用于开发) |
| graphify | 已发布 wheel |

## 快速启动

```bash
# 1. 克隆仓库
git clone https://github.com/sunweini/aiwiki.git
cd aiwiki

# 2. 后端
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # 编辑配置

# 3. 数据库迁移
alembic upgrade head

# 4. 启动后端 (默认 :8000)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 5. 前端 (新终端)
cd frontend
npm install
npm run dev  # http://localhost:3000
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | 数据库连接串 | `sqlite:///./test.db` |
| `WORKSPACE_ROOT` | build 工作目录 | `./data/workspaces` |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | — |
| `OPENAI_API_KEY` | OpenAI API 密钥 | — |

LLM API key 通过 `env:VARNAME` 引用传递给 KB 配置，例如 `env:DEEPSEEK_API_KEY`。

## 配置 LLM Backend

创建 KB 时设置 `llm_backend` 字段：

| 后端 | 说明 |
|------|------|
| `deepseek` | DeepSeek API（兼容 OpenAI） |
| `openai` | OpenAI 原生 |
| `claude` | Anthropic Claude（内置） |
| `ollama` | 本地 Ollama（内置） |
| `gemini` | Google Gemini（内置） |

自定义后端会自动注入 `graphify.llm.BACKENDS`，支持 `llm_base_url_override` 和 `llm_model_override`。

## 测试

```bash
cd backend
python3 -m pytest tests/ -v    # 51 tests
```

前端类型检查：

```bash
cd frontend
npx tsc --noEmit
```

## 目录结构

```
aiwiki/
├── backend/
│   ├── app/
│   │   ├── api/routes/       # REST API 端点
│   │   ├── db/models/        # SQLAlchemy 模型
│   │   ├── mcp/              # MCP 协议端点
│   │   ├── repositories/     # 数据访问层
│   │   ├── runner/           # graphify pipeline
│   │   ├── schemas/          # Pydantic 验证
│   │   └── services/         # 业务逻辑
│   ├── alembic/              # 数据库迁移
│   ├── tests/                # 测试 (51)
│   └── data/workspaces/      # build 工作目录 (gitignored)
├── frontend/
│   └── src/
│       ├── app/              # Next.js App Router 页面
│       ├── components/       # React 组件
│       └── lib/              # API client + 类型
└── docs/                     # 文档
```
