# Rice Yield Prediction System

An API-driven UAV rice yield prediction backend system for real deployment. The project includes a browser-based dashboard, FastAPI backend, MySQL database schema, Nginx deployment configuration, and technical documentation.

The repository is kept as source code only. Runtime data, uploaded images, large DJI map tiles, deployment archives, Jetson backups, and temporary analysis files are intentionally excluded from Git.

## Production URL

```text
http://www.ricepheno.cn
```

## Features

- Administrator login and logout
- Mission creation, rename, deletion, area setting, and waypoint planning
- UAV telemetry ingestion and dashboard display
- UAV live-frame ingestion and preview
- Capture image upload, query, export, deletion, and mission reassignment
- Capture metric and yield result persistence
- Map/heatmap resource integration
- Docker Compose deployment

## Project Structure

```text
.
|-- index.html
|-- styles.css
|-- app.js
|-- config.js
|-- backend/
|   |-- main.py
|   |-- requirements.txt
|   `-- Dockerfile
|-- deploy/
|   |-- mysql/schema.sql
|   `-- nginx/
|-- docs/
|-- docker-compose.yml
|-- .env.example
`-- README.md
```

## Quick Start

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env`, then start the stack:

```bash
docker compose up -d --build
```

Open:

```text
http://localhost
```

Default administrator credentials are read from environment variables:

```text
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
```

For production, change all default passwords and set a strong `AUTH_SECRET`.

## Database

The database starts empty. It does not seed demo missions, devices, images, metrics, or yield values. All business data must be written through API calls.

Main tables:

- `devices`
- `missions`
- `mission_areas`
- `telemetry`
- `capture_images`
- `capture_metrics`
- `yield_results`
- `live_frames`

## Main APIs

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

## Map and Large Assets

Large map tiles and historical capture images should not be committed directly to normal Git history. Use one of these approaches:

- publish `assets/model_map/` as a separate resource package;
- manage large assets with Git LFS;
- mount map and upload directories directly on the deployment server.

`config.js` intentionally contains empty map service credentials. Fill in your own key locally or in deployment.

## Checks

```bash
python -m compileall backend
node --check app.js
```

## License

MIT License.
