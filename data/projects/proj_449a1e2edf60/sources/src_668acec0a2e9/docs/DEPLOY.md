# 袁夫稻田智慧园区 V2 — 部署手册

## 目录
1. [系统要求](#1-系统要求)
2. [测试环境部署](#2-测试环境部署)
3. [正式环境部署](#3-正式环境部署)
4. [Nginx 反向代理](#4-nginx-反向代理)
5. [HTTPS 证书](#5-https-证书)
6. [环境变量参考](#6-环境变量参考)
7. [健康检查与监控](#7-健康检查与监控)
8. [备份与恢复](#8-备份与恢复)
9. [常见问题](#9-常见问题)

---

## 1. 系统要求

| 组件 | 测试环境 | 正式环境 |
|------|---------|---------|
| 操作系统 | Ubuntu 20.04+ / macOS / WSL2 | Ubuntu 22.04 LTS |
| CPU | 2 核 | 4 核+ |
| 内存 | 4 GB | 8 GB+ |
| 磁盘 | 20 GB | 100 GB SSD |
| Docker | 24.0+ | 24.0+ |
| Docker Compose | 2.20+ | 2.20+ |
| Go | 1.21+（仅本地开发） | —（Docker 构建） |
| Node.js | 18+（仅前端开发） | —（Docker 构建） |

---

## 2. 测试环境部署

测试环境快速启动，所有服务本地运行，数据持久化到 Docker volume。

### 2.1 克隆项目

```bash
git clone <repo-url> /opt/yfsc-platform
cd /opt/yfsc-platform
git checkout feat/phase1-foundation
```

### 2.2 配置环境变量

```bash
cp backend/.env.example backend/.env
# 编辑 .env，修改 JWT_SECRET 和 APP_SECRET 为随机字符串
openssl rand -hex 32  # 生成随机 secret
```

**backend/.env（测试环境）:**
```env
APP_PORT=8080
APP_ENV=development
APP_SECRET=dev-random-secret-abc123

DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=yfsc_platform_v2

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

JWT_SECRET=dev-jwt-secret-xyz789
JWT_EXPIRE_HOURS=24
JWT_REFRESH_EXPIRE_HOURS=168

WECHAT_APP_ID=
WECHAT_APP_SECRET=
```

**web-admin/.env.development（前端开发）:**
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 2.3 启动后端

```bash
# 方式 A: Docker Compose（推荐）
cd backend
docker compose up -d
# 启动 MySQL:3306 + Redis:6379

# 方式 B: 本地运行
cd backend
cp .env.example .env
# 编辑 .env 中 DB_HOST=localhost
go run cmd/server/main.go &
```

### 2.4 初始化数据库

```bash
# Docker 方式 — 数据库已通过 AutoMigrate 自动创建表
# 插入种子数据
cd backend
go run cmd/seed/main.go
```

种子数据包含：
- 6 个角色（ADMIN_PLATFORM, PLATFORM_OPER, PARK_ADMIN, PARK_MANAGER, SHOP_ADMIN, SHOP_CASHIER）
- 1 个管理员（admin / admin123）
- 2 个园区（黄梅袁夫稻田、武汉袁夫稻田）
- 4 个店铺类型

### 2.5 启动前端

```bash
cd web-admin
npm install
npm run dev
# 访问 http://localhost:5173
# Vite 自动代理 /api 请求到后端（配置在 vite.config.ts）
```

### 2.6 验证测试环境

```bash
# 后端健康检查
curl http://localhost:8080/api/v1/callback/ping
# → {"code":0,"message":"success","data":{"status":"ok"}}

# 登录测试
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# → {"code":0,"data":{"access_token":"...","employee":{...}}}

# 运行测试
cd backend && go test ./... -count=1
```

---

## 3. 正式环境部署

正式环境使用 Docker Compose 全栈部署：Nginx（反向代理 + HTTPS）→ Go 后端 → MySQL + Redis。

### 3.1 目录结构

```
/opt/yfsc-platform/
├── backend/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── config.yaml
│   └── .env
├── web-admin/
│   ├── Dockerfile
│   └── nginx.conf
├── nginx/
│   ├── nginx.conf
│   └── ssl/
│       ├── fullchain.pem
│       └── privkey.pem
└── docker-compose.prod.yml
```

### 3.2 后端 Dockerfile

```dockerfile
# backend/Dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o server cmd/server/main.go

FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata
ENV TZ=Asia/Shanghai
WORKDIR /app
COPY --from=builder /build/server .
COPY config.yaml .

EXPOSE 8080
CMD ["./server"]
```

```bash
docker build -t yfsc-backend:latest -f backend/Dockerfile backend/
```

### 3.3 前端 Dockerfile

```dockerfile
# web-admin/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.25-alpine
COPY --from=builder /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**web-admin/nginx.conf（SPA 路由支持）:**
```nginx
server {
    listen 80;
    server_name admin.yuanfu.com;
    root /usr/share/nginx/html;
    index index.html;

    # SPA history mode
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理到后端
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
docker build -t yfsc-frontend:latest -f web-admin/Dockerfile web-admin/
```

### 3.4 正式环境 docker-compose.prod.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: yfsc-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: yfsc_platform_v2
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/migrations:/docker-entrypoint-initdb.d
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
      - --max_connections=200
      - --innodb_buffer_pool_size=256M
    ports:
      - "127.0.0.1:3306:3306"
    networks:
      - yfsc-net
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: yfsc-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"
    networks:
      - yfsc-net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  backend:
    image: yfsc-backend:latest
    container_name: yfsc-backend
    restart: unless-stopped
    env_file:
      - backend/.env
    ports:
      - "127.0.0.1:8080:8080"
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - yfsc-net
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    image: yfsc-frontend:latest
    container_name: yfsc-frontend
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:80"
    depends_on:
      - backend
    networks:
      - yfsc-net

volumes:
  mysql_data:
  redis_data:

networks:
  yfsc-net:
    driver: bridge
```

### 3.5 正式环境 .env

```env
# backend/.env（正式环境）
APP_PORT=8080
APP_ENV=production
APP_SECRET=<openssl rand -hex 32>

DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<强密码>
DB_NAME=yfsc_platform_v2
DB_MAX_IDLE_CONNS=25
DB_MAX_OPEN_CONNS=100

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

JWT_SECRET=<openssl rand -hex 32>
JWT_EXPIRE_HOURS=12
JWT_REFRESH_EXPIRE_HOURS=72

WECHAT_APP_ID=<微信 AppID>
WECHAT_APP_SECRET=<微信 AppSecret>

DB_ROOT_PASSWORD=<强密码>
```

### 3.6 启动正式环境

```bash
# 1. 生成密钥
JWT_SECRET=$(openssl rand -hex 32)
APP_SECRET=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -hex 16)
echo "JWT_SECRET=$JWT_SECRET" >> backend/.env
echo "APP_SECRET=$APP_SECRET" >> backend/.env
echo "DB_ROOT_PASSWORD=$DB_PASSWORD" >> backend/.env
echo "DB_PASSWORD=$DB_PASSWORD" >> backend/.env

# 2. 构建镜像
docker build -t yfsc-backend:latest -f backend/Dockerfile backend/
docker build -t yfsc-frontend:latest -f web-admin/Dockerfile web-admin/

# 3. 启动
docker compose -f docker-compose.prod.yml up -d

# 4. 等待 MySQL 就绪后，初始化数据
docker exec -it yfsc-backend ./server  # 启动 AutoMigrate
docker exec -it yfsc-backend go run cmd/seed/main.go

# 5. 查看日志
docker compose -f docker-compose.prod.yml logs -f
```

---

## 4. Nginx 反向代理

外网入口用 Nginx 做 HTTPS 终止 + 反向代理。

```nginx
# /etc/nginx/sites-available/yfsc-platform
server {
    # 主域名 — PC 管理后台
    server_name admin.yuanfu.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API 直连后端
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # 小程序回调（美团/抖音可能通过此域名回调）
    location /api/v1/callback/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/yfsc-platform /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 5. HTTPS 证书

### 5.1 Let's Encrypt（推荐）

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d admin.yuanfu.com

# 自动续期（crontab）
0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

### 5.2 自签证书（测试环境）

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/CN=localhost"
```

---

## 6. 环境变量参考

| 变量 | 说明 | 默认值 | 必须 |
|------|------|--------|------|
| `APP_PORT` | 后端监听端口 | `8080` | 否 |
| `APP_ENV` | 环境标识 | `development` | 否 |
| `APP_SECRET` | 应用加密密钥 | — | **是** |
| `DB_HOST` | MySQL 地址 | `localhost` | **是** |
| `DB_PORT` | MySQL 端口 | `3306` | 否 |
| `DB_USER` | MySQL 用户 | `root` | **是** |
| `DB_PASSWORD` | MySQL 密码 | — | **是** |
| `DB_NAME` | 数据库名 | `yfsc_platform_v2` | 否 |
| `DB_MAX_IDLE_CONNS` | 连接池空闲连接 | `10` | 否 |
| `DB_MAX_OPEN_CONNS` | 连接池最大连接 | `100` | 否 |
| `REDIS_HOST` | Redis 地址 | `localhost` | **是** |
| `REDIS_PORT` | Redis 端口 | `6379` | 否 |
| `JWT_SECRET` | JWT 签名密钥 | — | **是** |
| `JWT_EXPIRE_HOURS` | Access Token 有效期 | `24` | 否 |
| `JWT_REFRESH_EXPIRE_HOURS` | Refresh Token 有效期 | `168` | 否 |
| `WECHAT_APP_ID` | 微信 AppID | — | 需要微信功能时 |
| `WECHAT_APP_SECRET` | 微信 AppSecret | — | 需要微信功能时 |

---

## 7. 健康检查与监控

### 7.1 健康检查端点

| 端点 | 说明 |
|------|------|
| `GET /api/v1/callback/ping` | 后端存活检查 |
| `GET /` | 前端页面加载 |

### 7.2 Docker 健康检查

```bash
# 检查所有容器状态
docker compose -f docker-compose.prod.yml ps

# 后端健康
curl -f http://localhost:8080/api/v1/callback/ping || echo "DOWN"

# MySQL 连接检查
docker exec yfsc-mysql mysqladmin ping -h localhost
```

### 7.3 日志

```bash
# 查看后端日志
docker logs -f yfsc-backend --tail 100

# 查看 Nginx 访问日志
tail -f /var/log/nginx/access.log

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

---

## 8. 备份与恢复

### 8.1 数据库备份

```bash
# 每日定时备份（crontab）
0 2 * * * docker exec yfsc-mysql mysqldump -u root -p$DB_PASSWORD \
  --single-transaction --routines --triggers \
  yfsc_platform_v2 | gzip > /backup/yfsc_$(date +\%Y\%m\%d).sql.gz

# 保留最近 30 天
find /backup/ -name "yfsc_*.sql.gz" -mtime +30 -delete
```

### 8.2 恢复

```bash
# 解压并导入
gunzip -c /backup/yfsc_20260515.sql.gz | \
  docker exec -i yfsc-mysql mysql -u root -p$DB_PASSWORD yfsc_platform_v2
```

### 8.3 Redis 持久化

Redis 配置了 AOF（appendonly yes），数据自动持久化到 volume `redis_data`。备份方式：

```bash
docker exec yfsc-redis redis-cli BGSAVE
docker cp yfsc-redis:/data/dump.rdb /backup/redis_$(date +%Y%m%d).rdb
```

---

## 9. 常见问题

### 端口冲突
```bash
# 检查端口占用
sudo ss -tlnp | grep -E '80|443|3306|6379|8080'

# Docker 端口映射修改 docker-compose.prod.yml
ports:
  - "127.0.0.1:8081:8080"  # 将 8080 映射到宿主机 8081
```

### MySQL 连接失败
```bash
# 测试连通性
docker exec yfsc-backend ping mysql

# 查看 MySQL 日志
docker logs yfsc-mysql
```

### 数据库迁移失败
```bash
# 手动执行迁移（GORM AutoMigrate）
docker exec yfsc-backend ./server  # 启动时自动执行

# 或使用 MySQL 客户端直接执行 SQL
mysql -h 127.0.0.1 -u root -p yfsc_platform_v2 < backend/migrations/001_init.sql
```

### 前端 404（SPA 路由）
确认 nginx.conf 中有 `try_files $uri $uri/ /index.html;`。如果使用 Nginx 代理，确保前端容器内 nginx 配置正确。

### 小程序回调无法访问
小程序要求 HTTPS + 已备案域名。确认：
1. 域名已备案
2. HTTPS 证书有效
3. Nginx 正确代理 `/api/v1/callback/` 到后端 `8080`

### 内存不足
```bash
# 限制 Docker 资源
# docker-compose.prod.yml 添加：
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
```
