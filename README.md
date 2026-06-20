# 水稻产量预测系统

面向实际部署的无人机水稻测产后台系统。系统由前端管理大屏、FastAPI 后端、MySQL 数据库和 Nginx 静态资源服务组成，业务数据均通过 API 写入和读取，不内置演示任务、演示设备或模拟测产数据。

## 功能范围

- 管理员登录与退出登录
- 任务创建、重命名、删除、区域设置和任务点规划
- 无人机遥测数据接收与展示
- 无人机实时画面接收与展示
- 采集图像上传、查询、导出、删除和任务归属修改
- 采集指标与产量结果存储
- DJI 建模地图/热力图资源接入
- Docker Compose 一键部署

## 项目结构

```text
.
├── index.html                 # 前端页面
├── styles.css                 # 页面样式
├── app.js                     # 前端业务逻辑
├── config.js                  # 前端运行配置
├── backend/
│   ├── main.py                # FastAPI 接口
│   ├── requirements.txt       # 后端依赖
│   └── Dockerfile             # API 镜像
├── deploy/
│   ├── mysql/schema.sql       # MySQL 初始化表结构
│   └── nginx/                 # Nginx 配置
├── docs/                      # 技术文档与论文配图
├── docker-compose.yml         # 本地/服务器部署编排
├── .env.example               # 环境变量模板
└── README.md
```

## 本地启动

1. 复制环境变量模板：

```bash
cp .env.example .env
```

2. 修改 `.env` 中的数据库密码和 `AUTH_SECRET`。

3. 启动服务：

```bash
docker compose up -d --build
```

4. 访问：

```text
http://localhost
```

默认管理员账号密码来自环境变量：

```text
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
```

## 数据库

数据库按空库启动，不写入示例任务、示例设备、示例图像或演示产量。任务、遥测、实时画面、采集图像、指标和估产结果都通过 API 写入。

主要数据表：

- `devices`
- `missions`
- `mission_areas`
- `telemetry`
- `capture_images`
- `capture_metrics`
- `yield_results`
- `live_frames`

## 主要接口

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/missions`
- `POST /api/missions`
- `PUT /api/missions/{mission_code}`
- `DELETE /api/missions/{mission_code}`
- `PUT /api/missions/{mission_code}/area`
- `GET /api/devices`
- `POST /api/telemetry`
- `GET /api/telemetry/latest`
- `GET /api/telemetry/path`
- `POST /api/live-frame`
- `GET /api/live-frame/latest`
- `POST /api/capture-images`
- `GET /api/capture-images`
- `PUT /api/capture-images/{image_id}/metrics`
- `PUT /api/capture-images/{image_id}/mission`
- `POST /api/capture-image-batches/delete`
- `PUT /api/capture-image-batches/mission`
- `GET /api/yield-results`

## 地图与大资源

本仓库默认只保留后台系统源码和必要轻量资源。DJI 建模地图瓦片、历史采集图片、部署压缩包、Jetson 备份等大文件不建议直接提交到普通 Git 历史。

如需在 GitHub 中管理大地图资源，建议使用 Git LFS；也可以把 `assets/model_map/` 作为独立资源包发布，并在部署时放回同名目录。

## 检查命令

```bash
python -m compileall backend
node --check app.js
```

## License

See `LICENSE`.
