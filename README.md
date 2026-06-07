# 实验室设备预约管理系统

面向高校和科研院所，提供实验设备的在线预约、使用记录追踪、维护计划管理和权限分级控制，解决设备闲置与争抢并存的矛盾。

## Docker Compose 快速启动

首次启动前复制环境变量文件：

```bash
cp .env.example .env
docker compose up -d
```

访问地址：

- 前端：http://localhost:28501
- 后端健康检查：http://localhost:29501/health
- API 示例：http://localhost:28501/api/overview

## 项目主要功能

- 设备档案与分类管理：支持录入设备名称、型号、编号、存放位置、购置日期、使用说明文档，可上传设备图片，支持按分类（如光学仪器、电子仪器、生化设备）筛选和检索。
- 时段预约与资质校验：设备开放预约的最小单位为30分钟，用户选择日期后查看该设备当日可约时段，预约时自动校验用户资质（如是否需要培训认证），冲突时段禁止预约。
- 扫码签到与违约释放：预约成功后生成使用二维码，使用人需在使用开始和结束时扫码签到，系统自动记录实际使用时长，超时未签到自动释放设备并标记违约。
- 设备维护计划管理：管理员可为设备设定定期维护周期（如每周/每月），维护时段自动从可预约池中剔除，维护完成后记录维护内容、耗材更换情况和维护人。
- 利用率统计报表：管理员可查看设备利用率报表（按周/月/年）、高频使用人排行、设备故障率统计，支持导出Excel格式的月度使用报告。

## 本地开发方式

前端：

```bash
cd frontend
npm install
npm run dev
```

后端：

```bash
cd backend
npm install
npm run dev
```

## 技术栈

| 分层 | 技术 |
| --- | --- |
| 前端 | React 18 + TypeScript、Ant Design、Vite |
| 后端 | NestJS + TypeScript |
| 数据库 | MySQL 8.0 |
| 认证 | JWT（Access Token + Refresh Token） |
| 依赖 | TypeORM、bcryptjs、class-validator |

## 项目目录结构

```text
.
├── backend/              # 后端服务
├── database/             # 数据库脚本
├── frontend/             # 前端应用
├── docker-compose.yml    # 一键部署编排
├── .env.example          # 环境变量示例
└── README.md
```

## 环境变量说明

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| COMPOSE_PROJECT_NAME | Compose 项目名，避免中文目录名导致项目名为空 | ldequipreserve |
| DB_NAME | 数据库名称 | app |
| DB_USER | 数据库用户 | app |
| DB_PASSWORD | 数据库密码 | app_pwd |
| DB_ROOT_PASSWORD | 数据库 root 密码 | root_pwd |
| JWT_SECRET | JWT 签名密钥 | change_me_to_a_long_random_string |
| FRONTEND_PORT | 前端宿主机端口 | 28501 |
| BACKEND_PORT | 后端宿主机端口 | 29501 |
| DB_PORT | 数据库宿主机端口 | 3306 |

## Docker 部署说明

- 使用 `docker compose up -d` 启动，不需要额外传入 `-p`。
- `docker-compose.yml` 顶层已声明 `name: ldequipreserve`，并且 `.env` 包含 `COMPOSE_PROJECT_NAME=ldequipreserve`，可在中文目录名下启动。
- 数据库数据保存在命名卷 `db_data` 中，不依赖当前目录名。
- 前端容器由 Nginx 托管静态资源，并把 `/api/` 反向代理到 `backend:29501`。
- 若本地端口冲突，可修改 `.env` 中的 `FRONTEND_PORT`、`BACKEND_PORT`、`DB_PORT`。

常用命令：

```bash
docker compose config --quiet
docker compose ps
docker compose down
```

## License

MIT
