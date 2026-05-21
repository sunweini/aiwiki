# 开发环境搭建

## 依赖

| 组件 | 版本要求 |
|------|----------|
| Python | 3.12+ |
| Node.js | 18+ |
| PostgreSQL | 16+ |
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

# 3. 数据库迁移
alembic upgrade head

# 4. 启动后端 (默认 :8000)
# --reload-dir app/ 排除 data/ 目录，避免 graphify 输出触发重载
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir app/

# 5. 前端 (新终端)
cd frontend
npm install
npm run dev  # http://localhost:3000
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `AIKB_DATABASE_URL` | 数据库连接串（覆盖 config.py） | `postgresql+asyncpg://sunweini@localhost:5432/aiwiki` |
| `AIKB_DATA_ROOT` | 数据根目录 (projects/, releases/) | `./data` |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | `config.py` 内置（零配置） |
| `OPENAI_API_KEY` | OpenAI API 密钥 | — |

LLM API key 通过 `env:VARNAME` 引用传递给 KB 配置，例如 `env:DEEPSEEK_API_KEY`。
解析优先级：先查 `os.environ`，未设置则 fallback 到 `config.py` 中 `deepseek_api_key`。

## 配置 LLM Backend

创建 KB 时 `llm_backend` 等字段已内置默认值（`deepseek` + `deepseek-v4-flash`），无需手动指定。

| 后端 | 说明 |
|------|------|
| `deepseek` | DeepSeek API（**默认**，兼容 OpenAI） |
| `openai` | OpenAI 原生 |
| `claude` | Anthropic Claude（内置） |
| `ollama` | 本地 Ollama（内置） |
| `gemini` | Google Gemini（内置） |
| `kimi` | Moonshot Kimi（内置） |
| `bedrock` | AWS Bedrock（内置） |

自定义后端会自动注入 `graphify.llm.BACKENDS`，默认 fallback 为 DeepSeek 配置。

## 测试

```bash
cd backend
python3 -m pytest tests/ -v    # 56 tests
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
│   └── tests/                # 测试 (54)
├── data/                     # 运行时数据 (gitignored)
│   └── projects/{id}/        # 项目目录
│       ├── sources/          # 源文件副本
│       ├── kb/{kb_id}/       # KB 目录
│       │   ├── builds/       # build 工作区
│       │   ├── cache/        # AST 缓存
│       │   ├── obsidian/     # Obsidian vault (git repo)
│       │   ├── wiki/         # Wiki (git repo)
│       │   └── releases/     # release manifest
├── frontend/
│   └── src/
│       ├── app/              # Next.js App Router 页面
│       ├── components/       # React 组件
│       └── lib/              # API client + 类型
└── docs/                     # 文档
```
