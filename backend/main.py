import os
import json
import time
import base64
import hashlib
import hmac
import math
import random
import string
import tempfile
from pathlib import Path
from typing import List, Optional
from uuid import uuid4

import mysql.connector
from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


DB_CONFIG = {
    "host": os.getenv("MYSQL_HOST", "mysql"),
    "port": int(os.getenv("MYSQL_PORT", "3306")),
    "user": os.getenv("MYSQL_USER", "yield_user"),
    "password": os.getenv("MYSQL_PASSWORD", "yield_password"),
    "database": os.getenv("MYSQL_DATABASE", "yield_system"),
}
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/data/uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
LIVE_FRAME_DIR = UPLOAD_DIR / "live"
LIVE_FRAME_DIR.mkdir(parents=True, exist_ok=True)
LIVE_FRAME_DB_INTERVAL_SECONDS = float(os.getenv("LIVE_FRAME_DB_INTERVAL_SECONDS", "1.0"))
LIVE_FRAME_DB_LAST_UPDATE: dict[str, float] = {}
REALTIME_ATTITUDE_CACHE: dict[str, dict[str, object]] = {}
REALTIME_ATTITUDE_TTL_SECONDS = float(os.getenv("REALTIME_ATTITUDE_TTL_SECONDS", "10.0"))
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin")
AUTH_SECRET = os.getenv("AUTH_SECRET", "yield-system-change-me")
AUTH_COOKIE_NAME = "yield_system_session"
AUTH_SESSION_SECONDS = int(os.getenv("AUTH_SESSION_SECONDS", str(8 * 60 * 60)))
CAPTCHA_SECONDS = int(os.getenv("CAPTCHA_SECONDS", "180"))

app = FastAPI(title="Air-Ground Yield API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


class MissionAreaPayload(BaseModel):
    areaMu: float = Field(ge=0)
    confirmed: bool = False
    boundary: List[List[float]]
    plannedPoints: List[List[float]]
    plannedShotCount: Optional[int] = Field(default=None, ge=0)


class MissionPayload(BaseModel):
    missionCode: str = Field(min_length=1, max_length=64)
    fieldName: str = Field(min_length=1, max_length=128)
    status: str = Field(default="planned", max_length=32)


class MissionUpdatePayload(BaseModel):
    fieldName: str = Field(min_length=1, max_length=128)
    status: Optional[str] = Field(default=None, max_length=32)


class CaptureImageMissionPayload(BaseModel):
    missionCode: str = Field(min_length=1, max_length=64)


class CaptureImageBatchMissionPayload(BaseModel):
    imageIds: List[int] = Field(min_length=1)
    missionCode: str = Field(min_length=1, max_length=64)


class CaptureImageBatchPayload(BaseModel):
    imageIds: List[int] = Field(min_length=1)


class CaptureMetricPayload(BaseModel):
    panicleCoverage: Optional[float] = Field(default=None, ge=0)
    plantHeight: Optional[float] = Field(default=None, ge=0)
    panicleDensity: Optional[float] = Field(default=None, ge=0)
    yieldPerMu: Optional[float] = Field(default=None, ge=0)
    grainCount: Optional[float] = Field(default=None, ge=0)
    grainVolume: Optional[float] = Field(default=None, ge=0)


def normalize_telemetry_row(row: dict) -> dict:
    device_code = row.get("device_code")
    cache = REALTIME_ATTITUDE_CACHE.get(device_code, {})
    expires_at = cache.get("expires_at")
    if expires_at and expires_at < time.time():
        REALTIME_ATTITUDE_CACHE.pop(device_code, None)
        cache = {}
    merged = dict(row)
    for key in ("roll", "pitch", "yaw", "flight_mode", "link_mode", "signal_strength", "positioning_quality", "satellite_count"):
        if merged.get(key) is None and cache.get(key) is not None:
            merged[key] = cache.get(key)
    return merged


def prune_realtime_attitude_cache() -> None:
    now = time.time()
    expired = [device_code for device_code, cache in REALTIME_ATTITUDE_CACHE.items() if cache.get("expires_at", 0) < now]
    for device_code in expired:
        REALTIME_ATTITUDE_CACHE.pop(device_code, None)


def update_realtime_attitude_cache(
    device_code: str,
    roll: Optional[float],
    pitch: Optional[float],
    yaw: Optional[float],
    flight_mode: Optional[str],
    link_mode: Optional[str],
    signal_strength: Optional[float],
    positioning_quality: Optional[str],
    satellite_count: Optional[int],
) -> None:
    values = {
        "roll": roll,
        "pitch": pitch,
        "yaw": yaw,
        "flight_mode": flight_mode,
        "link_mode": link_mode,
        "signal_strength": signal_strength,
        "positioning_quality": positioning_quality,
        "satellite_count": satellite_count,
    }
    if not any(value is not None for value in values.values()):
        return
    cache = REALTIME_ATTITUDE_CACHE.setdefault(device_code, {})
    for key, value in values.items():
        if value is not None:
            cache[key] = value
    cache["expires_at"] = time.time() + REALTIME_ATTITUDE_TTL_SECONDS
    cache["updated_at"] = time.time()


class LoginPayload(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=128)
    captcha: str = Field(min_length=4, max_length=8)
    captchaToken: str = Field(min_length=1, max_length=512)


def _sign_session(username: str, expires_at: int) -> str:
    message = f"{username}:{expires_at}".encode("utf-8")
    return hmac.new(AUTH_SECRET.encode("utf-8"), message, hashlib.sha256).hexdigest()


def _sign_value(value: str, expires_at: int) -> str:
    message = f"{value}:{expires_at}".encode("utf-8")
    return hmac.new(AUTH_SECRET.encode("utf-8"), message, hashlib.sha256).hexdigest()


def create_session_token(username: str) -> str:
    expires_at = int(time.time()) + AUTH_SESSION_SECONDS
    signature = _sign_session(username, expires_at)
    payload = f"{username}:{expires_at}:{signature}".encode("utf-8")
    return base64.urlsafe_b64encode(payload).decode("utf-8")


def verify_session_token(token: Optional[str]) -> Optional[str]:
    if not token:
        return None
    try:
        decoded = base64.urlsafe_b64decode(token.encode("utf-8")).decode("utf-8")
        username, expires_at_text, signature = decoded.rsplit(":", 2)
        expires_at = int(expires_at_text)
    except (ValueError, TypeError):
        return None

    if expires_at < int(time.time()):
        return None
    expected = _sign_session(username, expires_at)
    if not hmac.compare_digest(signature, expected):
        return None
    if not hmac.compare_digest(username, ADMIN_USERNAME):
        return None
    return username


def create_captcha():
    code = "".join(random.choice(string.ascii_uppercase + string.digits) for _ in range(4))
    expires_at = int(time.time()) + CAPTCHA_SECONDS
    signature = _sign_value(code, expires_at)
    payload = f"{code}:{expires_at}:{signature}".encode("utf-8")
    token = base64.urlsafe_b64encode(payload).decode("utf-8")
    return code, token


def verify_captcha(code: str, token: str) -> bool:
    try:
        decoded = base64.urlsafe_b64decode(token.encode("utf-8")).decode("utf-8")
        expected_code, expires_at_text, signature = decoded.rsplit(":", 2)
        expires_at = int(expires_at_text)
    except (ValueError, TypeError):
        return False
    if expires_at < int(time.time()):
        return False
    expected_signature = _sign_value(expected_code, expires_at)
    if not hmac.compare_digest(signature, expected_signature):
        return False
    return hmac.compare_digest(code.strip().upper(), expected_code)


def require_admin(request: Request) -> str:
    username = verify_session_token(request.cookies.get(AUTH_COOKIE_NAME))
    if not username:
        raise HTTPException(status_code=401, detail="Authentication required")
    return username


def ensure_columns(cursor, table_name: str, columns: dict[str, str]):
    cursor.execute(
        """
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA=%s AND TABLE_NAME=%s
        """,
        (DB_CONFIG["database"], table_name),
    )
    existing = {row[0] for row in cursor.fetchall()}
    for column_name, column_sql in columns.items():
        if column_name not in existing:
            cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_sql}")


def safe_device_filename(device_code: str) -> str:
    safe = "".join(ch if ch.isalnum() or ch in {"-", "_"} else "_" for ch in device_code).strip("_")
    return safe or hashlib.sha1(device_code.encode("utf-8")).hexdigest()[:16]


def get_conn():
    return mysql.connector.connect(**DB_CONFIG)


def wait_for_db():
    last_error = None
    for _ in range(30):
        try:
            conn = get_conn()
            conn.close()
            return
        except mysql.connector.Error as exc:
            last_error = exc
            time.sleep(2)
    raise RuntimeError(f"Database unavailable: {last_error}")


def rebuild_yield_result(cursor, mission_code: Optional[str]):
    if not mission_code:
        return

    cursor.execute(
        """
        SELECT COALESCE(area_mu, 0) AS area_mu, COALESCE(planned_shot_count, 0) AS planned_shot_count
        FROM mission_areas
        WHERE mission_code=%s
        """,
        (mission_code,),
    )
    area_row = cursor.fetchone()
    area_mu = float(area_row[0]) if area_row else 0.0
    planned_shot_count = int(area_row[1] or 0) if area_row else 0

    cursor.execute(
        """
        SELECT AVG(cm.yield_per_mu), COUNT(DISTINCT CONCAT(ci.lng, ',', ci.lat))
        FROM capture_images ci
        JOIN capture_metrics cm ON cm.capture_image_id = ci.id
        WHERE ci.mission_code=%s
        """,
        (mission_code,),
    )
    avg_yield, point_count = cursor.fetchone()
    avg_yield = float(avg_yield or 0)
    point_count = int(point_count or 0)
    cursor.execute(
        """
        SELECT MAX(completed_shot_count), COUNT(*)
        FROM telemetry
        WHERE mission_code=%s AND completed_shot_count IS NOT NULL
        """,
        (mission_code,),
    )
    completed_row = cursor.fetchone()
    telemetry_completed_count = int(completed_row[0] or 0) if completed_row and completed_row[1] else 0
    if planned_shot_count <= 0:
        planned_shot_count = max(point_count, 1)
    if telemetry_completed_count > 0:
        completed_shot_count = telemetry_completed_count
    elif point_count > 0:
        completed_shot_count = planned_shot_count
    else:
        completed_shot_count = 0
    progress_ratio = min(completed_shot_count / planned_shot_count, 1.0) if planned_shot_count > 0 else 0.0
    fusion_yield = avg_yield * area_mu * progress_ratio / 1000
    uav_yield = fusion_yield * 0.955
    expected_points = max(planned_shot_count, area_mu * 15, 1)
    confidence = min(0.96, 0.78 + min(completed_shot_count / expected_points, 1) * 0.16)

    cursor.execute(
        """
        INSERT INTO yield_results(
          mission_code, avg_yield_per_mu, area_mu, capture_point_count,
          planned_shot_count, completed_shot_count, progress_ratio,
          fusion_yield_ton, uav_yield_ton, confidence
        )
        VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
          avg_yield_per_mu=VALUES(avg_yield_per_mu),
          area_mu=VALUES(area_mu),
          capture_point_count=VALUES(capture_point_count),
          planned_shot_count=VALUES(planned_shot_count),
          completed_shot_count=VALUES(completed_shot_count),
          progress_ratio=VALUES(progress_ratio),
          fusion_yield_ton=VALUES(fusion_yield_ton),
          uav_yield_ton=VALUES(uav_yield_ton),
          confidence=VALUES(confidence)
        """,
        (
            mission_code,
            avg_yield,
            area_mu,
            point_count,
            planned_shot_count,
            completed_shot_count,
            progress_ratio,
            fusion_yield,
            uav_yield,
            confidence,
        ),
    )


def refresh_all_yield_results(cursor):
    cursor.execute("SELECT DISTINCT mission_code FROM capture_images WHERE mission_code IS NOT NULL")
    mission_codes = [row[0] for row in cursor.fetchall()]
    cursor.execute("SELECT mission_code FROM missions")
    mission_codes.extend(row[0] for row in cursor.fetchall())
    for mission_code in sorted(set(filter(None, mission_codes))):
        rebuild_yield_result(cursor, mission_code)


def metric_response(row):
    if row.get("metric_id") is None:
        return None
    return {
        "panicleCoverage": f"{float(row['panicle_coverage'] or 0):.1f}%",
        "plantHeight": f"{float(row['plant_height_cm'] or 0):.1f} cm",
        "panicleDensity": f"{float(row['panicle_density'] or 0):.0f} panicles/m2",
        "yieldPerMu": f"{float(row['yield_per_mu'] or 0):.1f} kg/\u4ea9",
        "grainCount": f"{float(row['grain_count'] or 0):.0f} grains/panicle",
        "grainVolume": f"{float(row['grain_volume'] or 0):.0f} mm3/panicle",
    }


def ensure_schema():
    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS missions (
              id BIGINT PRIMARY KEY AUTO_INCREMENT,
              mission_code VARCHAR(64) NOT NULL UNIQUE,
              field_name VARCHAR(128) NOT NULL,
              status VARCHAR(32) NOT NULL DEFAULT 'pending',
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS devices (
              id BIGINT PRIMARY KEY AUTO_INCREMENT,
              device_code VARCHAR(64) NOT NULL UNIQUE,
              device_type ENUM('uav', 'ground') NOT NULL,
              name VARCHAR(128) NOT NULL,
              battery_level INT NULL,
              online BOOLEAN NOT NULL DEFAULT TRUE,
              last_lng DECIMAL(11, 7) NULL,
              last_lat DECIMAL(10, 7) NULL,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX idx_devices_type(device_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS telemetry (
              id BIGINT PRIMARY KEY AUTO_INCREMENT,
              device_id BIGINT NOT NULL,
              mission_code VARCHAR(64) NULL,
              lng DECIMAL(11, 7) NULL,
              lat DECIMAL(10, 7) NULL,
              altitude DECIMAL(8, 2) NULL,
              speed DECIMAL(8, 2) NULL,
              vx DECIMAL(8, 3) NULL,
              vy DECIMAL(8, 3) NULL,
              vz DECIMAL(8, 3) NULL,
              ax DECIMAL(8, 3) NULL,
              ay DECIMAL(8, 3) NULL,
              az DECIMAL(8, 3) NULL,
              roll DECIMAL(8, 3) NULL,
              pitch DECIMAL(8, 3) NULL,
              yaw DECIMAL(8, 3) NULL,
              flight_mode VARCHAR(64) NULL,
              link_mode VARCHAR(64) NULL,
              signal_strength DECIMAL(6, 2) NULL,
              positioning_quality VARCHAR(64) NULL,
              satellite_count INT NULL,
              completed_shot_count INT NULL,
              battery_level INT NULL,
              status VARCHAR(64) NULL,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT fk_telemetry_device FOREIGN KEY(device_id) REFERENCES devices(id),
              INDEX idx_telemetry_device_time(device_id, created_at),
              INDEX idx_telemetry_mission(mission_code)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        )
        ensure_columns(cursor, "telemetry", {
            "lng": "DECIMAL(11, 7) NULL",
            "lat": "DECIMAL(10, 7) NULL",
            "vx": "DECIMAL(8, 3) NULL",
            "vy": "DECIMAL(8, 3) NULL",
            "vz": "DECIMAL(8, 3) NULL",
            "ax": "DECIMAL(8, 3) NULL",
            "ay": "DECIMAL(8, 3) NULL",
            "az": "DECIMAL(8, 3) NULL",
            "roll": "DECIMAL(8, 3) NULL",
            "pitch": "DECIMAL(8, 3) NULL",
            "yaw": "DECIMAL(8, 3) NULL",
            "flight_mode": "VARCHAR(64) NULL",
            "link_mode": "VARCHAR(64) NULL",
            "signal_strength": "DECIMAL(6, 2) NULL",
            "positioning_quality": "VARCHAR(64) NULL",
            "satellite_count": "INT NULL",
            "completed_shot_count": "INT NULL",
        })
        cursor.execute("ALTER TABLE telemetry MODIFY lng DECIMAL(11, 7) NULL")
        cursor.execute("ALTER TABLE telemetry MODIFY lat DECIMAL(10, 7) NULL")
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS capture_images (
              id BIGINT PRIMARY KEY AUTO_INCREMENT,
              device_type ENUM('uav', 'ground') NOT NULL,
              device_code VARCHAR(64) NULL,
              mission_code VARCHAR(64) NULL,
              title VARCHAR(255) NOT NULL,
              image_url VARCHAR(512) NOT NULL,
              lng DECIMAL(11, 7) NOT NULL,
              lat DECIMAL(10, 7) NOT NULL,
              captured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_capture_device_type(device_type),
              INDEX idx_capture_mission(mission_code),
              INDEX idx_capture_time(captured_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS mission_areas (
              id BIGINT PRIMARY KEY AUTO_INCREMENT,
              mission_code VARCHAR(64) NOT NULL UNIQUE,
              area_mu DECIMAL(10, 3) NOT NULL DEFAULT 0,
              confirmed BOOLEAN NOT NULL DEFAULT FALSE,
              boundary_json JSON NOT NULL,
              planned_points_json JSON NOT NULL,
              planned_shot_count INT NOT NULL DEFAULT 0,
              updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_mission_areas_confirmed(confirmed)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        )
        ensure_columns(cursor, "mission_areas", {
            "planned_shot_count": "INT NOT NULL DEFAULT 0",
        })
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS capture_metrics (
              id BIGINT PRIMARY KEY AUTO_INCREMENT,
              capture_image_id BIGINT NOT NULL UNIQUE,
              panicle_coverage DECIMAL(6, 2) NULL,
              plant_height_cm DECIMAL(6, 2) NULL,
              panicle_density DECIMAL(8, 2) NULL,
              yield_per_mu DECIMAL(8, 2) NULL,
              grain_count DECIMAL(8, 2) NULL,
              grain_volume DECIMAL(10, 2) NULL,
              source VARCHAR(64) NOT NULL DEFAULT 'manual',
              updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT fk_capture_metrics_image
                FOREIGN KEY(capture_image_id) REFERENCES capture_images(id)
                ON DELETE CASCADE,
              INDEX idx_capture_metrics_yield(yield_per_mu)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS yield_results (
              id BIGINT PRIMARY KEY AUTO_INCREMENT,
              mission_code VARCHAR(64) NOT NULL UNIQUE,
              avg_yield_per_mu DECIMAL(8, 2) NOT NULL DEFAULT 0,
              area_mu DECIMAL(10, 3) NOT NULL DEFAULT 0,
              capture_point_count INT NOT NULL DEFAULT 0,
              planned_shot_count INT NOT NULL DEFAULT 0,
              completed_shot_count INT NOT NULL DEFAULT 0,
              progress_ratio DECIMAL(6, 5) NOT NULL DEFAULT 0,
              fusion_yield_ton DECIMAL(10, 3) NOT NULL DEFAULT 0,
              uav_yield_ton DECIMAL(10, 3) NOT NULL DEFAULT 0,
              confidence DECIMAL(5, 3) NOT NULL DEFAULT 0,
              updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_yield_results_updated(updated_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        )
        ensure_columns(cursor, "yield_results", {
            "planned_shot_count": "INT NOT NULL DEFAULT 0",
            "completed_shot_count": "INT NOT NULL DEFAULT 0",
            "progress_ratio": "DECIMAL(6, 5) NOT NULL DEFAULT 0",
        })
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS live_frames (
              id BIGINT PRIMARY KEY AUTO_INCREMENT,
              device_code VARCHAR(64) NOT NULL UNIQUE,
              mission_code VARCHAR(64) NULL,
              image_url VARCHAR(512) NOT NULL,
              captured_at TIMESTAMP NULL,
              updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_live_frames_updated(updated_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        )
        refresh_all_yield_results(cursor)
        conn.commit()


@app.on_event("startup")
def startup():
    wait_for_db()
    ensure_schema()


@app.get("/api/health")
def health():
    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
    return {"status": "ok"}


@app.post("/api/auth/login")
def login(payload: LoginPayload, response: Response):
    valid_user = hmac.compare_digest(payload.username, ADMIN_USERNAME)
    valid_password = hmac.compare_digest(payload.password, ADMIN_PASSWORD)
    valid_captcha = verify_captcha(payload.captcha, payload.captchaToken)
    if not (valid_user and valid_password and valid_captcha):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=create_session_token(ADMIN_USERNAME),
        max_age=AUTH_SESSION_SECONDS,
        httponly=True,
        samesite="lax",
    )
    return {"status": "ok", "username": ADMIN_USERNAME}


@app.get("/api/auth/captcha")
def captcha():
    code, token = create_captcha()
    return {"code": code, "token": token, "expiresIn": CAPTCHA_SECONDS}


@app.get("/api/auth/me")
def current_user(admin: str = Depends(require_admin)):
    return {"authenticated": True, "username": admin}


@app.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie(key=AUTH_COOKIE_NAME, httponly=True, samesite="lax")
    return {"status": "ok"}


@app.get("/api/missions")
def list_missions(admin: str = Depends(require_admin)):
    with get_conn() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT m.mission_code, m.field_name, m.status, m.created_at, m.updated_at,
                   a.area_mu, a.confirmed, a.boundary_json, a.planned_points_json,
                   a.planned_shot_count
            FROM missions m
            LEFT JOIN mission_areas a ON a.mission_code = m.mission_code
            ORDER BY m.created_at ASC, m.id ASC
            """
        )
        rows = cursor.fetchall()

    return [
        {
            "missionCode": row["mission_code"],
            "fieldName": row["field_name"],
            "status": row["status"],
            "areaMu": float(row["area_mu"]) if row["area_mu"] is not None else None,
            "confirmed": bool(row["confirmed"]) if row["confirmed"] is not None else False,
            "boundary": json.loads(row["boundary_json"]) if row["boundary_json"] else [],
            "plannedPoints": json.loads(row["planned_points_json"]) if row["planned_points_json"] else [],
            "plannedShotCount": int(row["planned_shot_count"] or 0),
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }
        for row in rows
    ]


@app.post("/api/missions")
def create_mission(payload: MissionPayload, admin: str = Depends(require_admin)):
    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO missions(mission_code, field_name, status)
            VALUES(%s, %s, %s)
            ON DUPLICATE KEY UPDATE
              field_name=VALUES(field_name),
              status=VALUES(status)
            """,
            (payload.missionCode, payload.fieldName, payload.status),
        )
        conn.commit()
    return {"status": "ok", "missionCode": payload.missionCode}


@app.put("/api/missions/{mission_code}")
def update_mission(mission_code: str, payload: MissionUpdatePayload, admin: str = Depends(require_admin)):
    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM missions WHERE mission_code=%s", (mission_code,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Mission not found")
        cursor.execute(
            """
            UPDATE missions
            SET field_name=%s, status=COALESCE(%s, status)
            WHERE mission_code=%s
            """,
            (payload.fieldName, payload.status, mission_code),
        )
        conn.commit()
    return {"status": "ok", "missionCode": mission_code}


@app.delete("/api/missions/{mission_code}")
def delete_mission(mission_code: str, admin: str = Depends(require_admin)):
    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM missions WHERE mission_code=%s", (mission_code,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Mission not found")
        cursor.execute("DELETE FROM mission_areas WHERE mission_code=%s", (mission_code,))
        cursor.execute("DELETE FROM capture_images WHERE mission_code=%s", (mission_code,))
        cursor.execute("DELETE FROM telemetry WHERE mission_code=%s", (mission_code,))
        cursor.execute("DELETE FROM yield_results WHERE mission_code=%s", (mission_code,))
        cursor.execute("DELETE FROM missions WHERE mission_code=%s", (mission_code,))
        conn.commit()
    return {"status": "ok", "missionCode": mission_code}


@app.get("/api/devices")
def list_devices(admin: str = Depends(require_admin)):
    with get_conn() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT device_code, device_type, name, battery_level, online,
                   last_lng, last_lat, updated_at
            FROM devices
            ORDER BY id
            """
        )
        return cursor.fetchall()


@app.post("/api/telemetry")
def create_telemetry(
    device_code: str = Form(...),
    device_type: str = Form(...),
    lng: Optional[float] = Form(None),
    lat: Optional[float] = Form(None),
    battery_level: Optional[int] = Form(None),
    mission_code: Optional[str] = Form(None),
    altitude: Optional[float] = Form(None),
    speed: Optional[float] = Form(None),
    vx: Optional[float] = Form(None),
    vy: Optional[float] = Form(None),
    vz: Optional[float] = Form(None),
    ax: Optional[float] = Form(None),
    ay: Optional[float] = Form(None),
    az: Optional[float] = Form(None),
    roll: Optional[float] = Form(None),
    pitch: Optional[float] = Form(None),
    yaw: Optional[float] = Form(None),
    flight_mode: Optional[str] = Form(None),
    link_mode: Optional[str] = Form(None),
    signal_strength: Optional[float] = Form(None),
    positioning_quality: Optional[str] = Form(None),
    satellite_count: Optional[int] = Form(None),
    completed_shot_count: Optional[int] = Form(None),
    completed_capture_count: Optional[int] = Form(None),
    completed_shots: Optional[int] = Form(None),
    status: Optional[str] = Form(None),
):
    completed_count = completed_shot_count
    if completed_count is None:
        completed_count = completed_capture_count
    if completed_count is None:
        completed_count = completed_shots
    if completed_count is not None:
        completed_count = max(0, int(completed_count))

    with get_conn() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM devices WHERE device_code=%s", (device_code,))
        device = cursor.fetchone()
        if not device:
            cursor.execute(
                """
                INSERT INTO devices(device_code, device_type, name, battery_level, online, last_lng, last_lat)
                VALUES(%s, %s, %s, %s, TRUE, %s, %s)
                """,
                (device_code, device_type, device_code, battery_level, lng, lat),
            )
            device_id = cursor.lastrowid
        else:
            device_id = device["id"]
            cursor.execute(
                """
                UPDATE devices
                SET device_type=%s, battery_level=COALESCE(%s, battery_level), online=TRUE,
                    last_lng=COALESCE(%s, last_lng), last_lat=COALESCE(%s, last_lat)
                WHERE id=%s
                """,
                (device_type, battery_level, lng, lat, device_id),
            )

        cursor.execute(
            """
            INSERT INTO telemetry(
              device_id, mission_code, lng, lat, altitude, speed,
              vx, vy, vz, ax, ay, az, flight_mode,
              link_mode, signal_strength, positioning_quality, satellite_count,
              completed_shot_count, battery_level, status
            )
            VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                device_id, mission_code, lng, lat, altitude, speed,
                vx, vy, vz, ax, ay, az, flight_mode,
                link_mode, signal_strength, positioning_quality, satellite_count,
                completed_count, battery_level, status,
            ),
        )
        telemetry_id = cursor.lastrowid
        update_realtime_attitude_cache(
            device_code,
            roll,
            pitch,
            yaw,
            flight_mode,
            link_mode,
            signal_strength,
            positioning_quality,
            satellite_count,
        )
        conn.commit()
        if mission_code and completed_count is not None:
            cursor = conn.cursor()
            rebuild_yield_result(cursor, mission_code)
            conn.commit()
        return {"id": telemetry_id}


@app.get("/api/live-frame/image/{filename}")
def live_frame_image(filename: str):
    if "/" in filename or "\\" in filename or not filename.lower().endswith(".jpg"):
        raise HTTPException(status_code=400, detail="Invalid live frame filename")
    path = (LIVE_FRAME_DIR / filename).resolve()
    if path.parent != LIVE_FRAME_DIR.resolve() or not path.exists():
        raise HTTPException(status_code=404, detail="Live frame not found")
    return Response(
        content=path.read_bytes(),
        media_type="image/jpeg",
        headers={"Cache-Control": "no-store, max-age=0"},
    )


@app.get("/api/live-frame/stream")
def live_frame_stream(device_code: str, fps: float = 20.0, admin: str = Depends(require_admin)):
    filename = f"{safe_device_filename(device_code)}.jpg"
    path = (LIVE_FRAME_DIR / filename).resolve()
    if path.parent != LIVE_FRAME_DIR.resolve():
        raise HTTPException(status_code=400, detail="Invalid live frame path")

    frame_interval = 1.0 / max(1.0, min(float(fps or 20.0), 30.0))

    def generate():
        boundary = b"--frame\r\n"
        while True:
            if path.exists():
                try:
                    content = path.read_bytes()
                except OSError:
                    content = b""
                if content:
                    yield (
                        boundary
                        + b"Content-Type: image/jpeg\r\n"
                        + b"Cache-Control: no-store\r\n"
                        + f"Content-Length: {len(content)}\r\n\r\n".encode("ascii")
                        + content
                        + b"\r\n"
                    )
            time.sleep(frame_interval)

    return StreamingResponse(
        generate(),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={"Cache-Control": "no-store, max-age=0"},
    )


@app.get("/api/telemetry/latest")
def latest_telemetry(admin: str = Depends(require_admin)):
    prune_realtime_attitude_cache()
    with get_conn() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT d.device_code, d.device_type, d.name, d.battery_level, d.last_lng, d.last_lat,
                   t.mission_code, t.altitude, t.speed, t.vx, t.vy, t.vz, t.ax, t.ay, t.az,
                   t.flight_mode, t.link_mode, t.signal_strength,
                   t.positioning_quality, t.satellite_count, t.completed_shot_count,
                   t.status, t.created_at
            FROM devices d
            LEFT JOIN telemetry t ON t.id = (
                SELECT id FROM telemetry WHERE device_id = d.id ORDER BY created_at DESC LIMIT 1
            )
            ORDER BY d.id
            """
        )
        return [normalize_telemetry_row(row) for row in cursor.fetchall()]


@app.get("/api/telemetry/path")
def telemetry_path(device_code: str, limit: int = 300, admin: str = Depends(require_admin)):
    limit = max(1, min(int(limit or 300), 1000))
    prune_realtime_attitude_cache()
    with get_conn() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT d.device_code, t.lng, t.lat, t.altitude, t.speed, t.flight_mode, t.created_at
            FROM telemetry t
            JOIN devices d ON d.id = t.device_id
            WHERE d.device_code = %s AND t.lng IS NOT NULL AND t.lat IS NOT NULL
            ORDER BY t.created_at DESC
            LIMIT %s
            """,
            (device_code, limit),
        )
        rows = cursor.fetchall()
        rows.reverse()
        return rows


@app.post("/api/live-frame")
async def upload_live_frame(
    file: UploadFile = File(...),
    device_code: str = Form(...),
    mission_code: Optional[str] = Form(None),
    captured_at: Optional[str] = Form(None),
):
    suffix = Path(file.filename or "").suffix.lower() or ".jpg"
    if suffix not in {".jpg", ".jpeg"}:
        raise HTTPException(status_code=400, detail="Unsupported live frame type")

    filename = f"{safe_device_filename(device_code)}.jpg"
    path = LIVE_FRAME_DIR / filename
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty live frame")
    fd, tmp_name = tempfile.mkstemp(prefix=f".{filename}.", suffix=".tmp", dir=str(LIVE_FRAME_DIR))
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(tmp_name, path)
    finally:
        if os.path.exists(tmp_name):
            os.unlink(tmp_name)
    url = f"/api/live-frame/image/{filename}"

    now = time.monotonic()
    last_update = LIVE_FRAME_DB_LAST_UPDATE.get(device_code, 0)
    if LIVE_FRAME_DB_INTERVAL_SECONDS <= 0 or now - last_update >= LIVE_FRAME_DB_INTERVAL_SECONDS:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO live_frames(device_code, mission_code, image_url, captured_at)
                VALUES(%s, %s, %s, COALESCE(%s, NOW()))
                ON DUPLICATE KEY UPDATE
                  mission_code=VALUES(mission_code),
                  image_url=VALUES(image_url),
                  captured_at=VALUES(captured_at),
                  updated_at=CURRENT_TIMESTAMP
                """,
                (device_code, mission_code, url, captured_at),
            )
            conn.commit()
        LIVE_FRAME_DB_LAST_UPDATE[device_code] = now
    return {"status": "ok", "deviceCode": device_code, "url": url}


@app.get("/api/live-frame/latest")
def latest_live_frame(device_code: str, admin: str = Depends(require_admin)):
    with get_conn() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT device_code, mission_code, image_url, captured_at, updated_at
            FROM live_frames
            WHERE device_code=%s
            """,
            (device_code,),
        )
        row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Live frame not found")
    return {
        "deviceCode": row["device_code"],
        "missionCode": row["mission_code"],
        "imageUrl": row["image_url"],
        "capturedAt": row["captured_at"],
        "updatedAt": row["updated_at"],
    }


@app.post("/api/capture-images")
async def upload_capture_image(
    file: UploadFile = File(...),
    device_type: str = Form(...),
    lng: float = Form(...),
    lat: float = Form(...),
    title: Optional[str] = Form(None),
    mission_code: Optional[str] = Form(None),
    device_code: Optional[str] = Form(None),
    captured_at: Optional[str] = Form(None),
    panicle_coverage: Optional[float] = Form(None),
    plant_height_cm: Optional[float] = Form(None),
    panicle_density: Optional[float] = Form(None),
    yield_per_mu: Optional[float] = Form(None),
    grain_count: Optional[float] = Form(None),
    grain_volume: Optional[float] = Form(None),
):
    suffix = Path(file.filename or "").suffix.lower() or ".jpg"
    if suffix not in {".jpg", ".jpeg", ".png", ".webp"}:
        raise HTTPException(status_code=400, detail="Unsupported image type")

    filename = f"{uuid4().hex}{suffix}"
    path = UPLOAD_DIR / filename
    content = await file.read()
    path.write_bytes(content)
    url = f"/uploads/{filename}"

    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO capture_images(device_type, device_code, mission_code, title, image_url, lng, lat, captured_at)
            VALUES(%s, %s, %s, %s, %s, %s, %s, COALESCE(%s, NOW()))
            """,
            (device_type, device_code, mission_code, title or file.filename, url, lng, lat, captured_at),
        )
        image_id = cursor.lastrowid
        cursor.execute(
            """
            INSERT INTO capture_metrics(
              capture_image_id, panicle_coverage, plant_height_cm, panicle_density,
              yield_per_mu, grain_count, grain_volume, source
            )
            VALUES(%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                image_id,
                panicle_coverage,
                plant_height_cm,
                panicle_density,
                yield_per_mu,
                grain_count,
                grain_volume,
                "device_upload",
            ),
        )
        rebuild_yield_result(cursor, mission_code)
        conn.commit()
        return {"id": image_id, "url": url}


@app.get("/api/capture-images")
def list_capture_images(mission_code: Optional[str] = None, admin: str = Depends(require_admin)):
    with get_conn() as conn:
        cursor = conn.cursor(dictionary=True)
        if mission_code:
            cursor.execute(
                """
                SELECT ci.id, ci.device_type, ci.device_code, ci.mission_code, ci.title,
                       ci.image_url, ci.lng, ci.lat, ci.captured_at, ci.created_at,
                       cm.id AS metric_id, cm.panicle_coverage, cm.plant_height_cm,
                       cm.panicle_density, cm.yield_per_mu, cm.grain_count, cm.grain_volume
                FROM capture_images ci
                LEFT JOIN capture_metrics cm ON cm.capture_image_id = ci.id
                WHERE ci.mission_code=%s
                ORDER BY ci.captured_at DESC, ci.id DESC
                """,
                (mission_code,),
            )
        else:
            cursor.execute(
                """
                SELECT ci.id, ci.device_type, ci.device_code, ci.mission_code, ci.title,
                       ci.image_url, ci.lng, ci.lat, ci.captured_at, ci.created_at,
                       cm.id AS metric_id, cm.panicle_coverage, cm.plant_height_cm,
                       cm.panicle_density, cm.yield_per_mu, cm.grain_count, cm.grain_volume
                FROM capture_images ci
                LEFT JOIN capture_metrics cm ON cm.capture_image_id = ci.id
                ORDER BY ci.captured_at DESC, ci.id DESC
                """
            )
        rows = cursor.fetchall()
    return [
        {
            "id": row["id"],
            "type": row["device_type"],
            "deviceCode": row["device_code"],
            "missionCode": row["mission_code"],
            "title": row["title"],
            "src": row["image_url"],
            "point": [float(row["lng"]), float(row["lat"])],
            "metrics": metric_response(row),
            "capturedAt": row["captured_at"],
            "createdAt": row["created_at"],
        }
        for row in rows
    ]


@app.put("/api/capture-images/{image_id}/mission")
def update_capture_image_mission(image_id: int, payload: CaptureImageMissionPayload, admin: str = Depends(require_admin)):
    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT mission_code FROM capture_images WHERE id=%s", (image_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Capture image not found")
        old_mission_code = row[0]
        cursor.execute(
            """
            INSERT IGNORE INTO missions(mission_code, field_name, status)
            VALUES(%s, %s, 'planned')
            """,
            (payload.missionCode, f"田块 {payload.missionCode}"),
        )
        cursor.execute(
            "UPDATE capture_images SET mission_code=%s WHERE id=%s",
            (payload.missionCode, image_id),
        )
        rebuild_yield_result(cursor, old_mission_code)
        rebuild_yield_result(cursor, payload.missionCode)
        conn.commit()
    return {"status": "ok", "id": image_id, "missionCode": payload.missionCode}


@app.put("/api/capture-image-batches/mission")
def update_capture_images_mission(payload: CaptureImageBatchMissionPayload, admin: str = Depends(require_admin)):
    unique_ids = sorted(set(payload.imageIds))
    placeholders = ", ".join(["%s"] * len(unique_ids))
    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute(
            f"SELECT DISTINCT mission_code FROM capture_images WHERE id IN ({placeholders})",
            unique_ids,
        )
        old_mission_codes = [row[0] for row in cursor.fetchall()]
        cursor.execute(
            """
            INSERT IGNORE INTO missions(mission_code, field_name, status)
            VALUES(%s, %s, 'planned')
            """,
            (payload.missionCode, f"田块 {payload.missionCode}"),
        )
        cursor.execute(
            f"UPDATE capture_images SET mission_code=%s WHERE id IN ({placeholders})",
            [payload.missionCode, *unique_ids],
        )
        affected = cursor.rowcount
        for mission_code in old_mission_codes:
            rebuild_yield_result(cursor, mission_code)
        rebuild_yield_result(cursor, payload.missionCode)
        conn.commit()
    return {"status": "ok", "missionCode": payload.missionCode, "updated": affected}


@app.post("/api/capture-image-batches/delete")
def delete_capture_images(payload: CaptureImageBatchPayload, admin: str = Depends(require_admin)):
    unique_ids = sorted(set(payload.imageIds))
    placeholders = ", ".join(["%s"] * len(unique_ids))
    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute(
            f"SELECT DISTINCT mission_code FROM capture_images WHERE id IN ({placeholders})",
            unique_ids,
        )
        mission_codes = [row[0] for row in cursor.fetchall()]
        cursor.execute(
            f"DELETE FROM capture_images WHERE id IN ({placeholders})",
            unique_ids,
        )
        affected = cursor.rowcount
        for mission_code in mission_codes:
            rebuild_yield_result(cursor, mission_code)
        conn.commit()
    return {"status": "ok", "deleted": affected}


@app.delete("/api/capture-images/{image_id}")
def delete_capture_image(image_id: int, admin: str = Depends(require_admin)):
    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT mission_code FROM capture_images WHERE id=%s", (image_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Capture image not found")
        mission_code = row[0]
        cursor.execute("DELETE FROM capture_images WHERE id=%s", (image_id,))
        rebuild_yield_result(cursor, mission_code)
        conn.commit()
    return {"status": "ok", "id": image_id}


@app.put("/api/capture-images/{image_id}/metrics")
def update_capture_metrics(image_id: int, payload: CaptureMetricPayload, admin: str = Depends(require_admin)):
    values = payload.dict()
    if not any(value is not None for value in values.values()):
        raise HTTPException(status_code=400, detail="No metric fields provided")

    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT mission_code, device_type FROM capture_images WHERE id=%s", (image_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Capture image not found")
        mission_code, device_type = row
        metric_values = {
            "panicle_coverage": values["panicleCoverage"],
            "plant_height_cm": values["plantHeight"],
            "panicle_density": values["panicleDensity"],
            "yield_per_mu": values["yieldPerMu"],
            "grain_count": values["grainCount"],
            "grain_volume": values["grainVolume"],
        }
        cursor.execute(
            """
            INSERT INTO capture_metrics(
              capture_image_id, panicle_coverage, plant_height_cm, panicle_density,
              yield_per_mu, grain_count, grain_volume, source
            )
            VALUES(%s, %s, %s, %s, %s, %s, %s, 'api')
            ON DUPLICATE KEY UPDATE
              panicle_coverage=VALUES(panicle_coverage),
              plant_height_cm=VALUES(plant_height_cm),
              panicle_density=VALUES(panicle_density),
              yield_per_mu=VALUES(yield_per_mu),
              grain_count=VALUES(grain_count),
              grain_volume=VALUES(grain_volume),
              source='api'
            """,
            (
                image_id,
                metric_values["panicle_coverage"],
                metric_values["plant_height_cm"],
                metric_values["panicle_density"],
                metric_values["yield_per_mu"],
                metric_values["grain_count"],
                metric_values["grain_volume"],
            ),
        )
        rebuild_yield_result(cursor, mission_code)
        conn.commit()
    return {"status": "ok", "id": image_id}


@app.get("/api/yield-results")
def list_yield_results(mission_code: Optional[str] = None, admin: str = Depends(require_admin)):
    with get_conn() as conn:
        cursor = conn.cursor(dictionary=True)
        if mission_code:
            cursor.execute(
                """
                SELECT mission_code, avg_yield_per_mu, area_mu, capture_point_count,
                       planned_shot_count, completed_shot_count, progress_ratio,
                       fusion_yield_ton, uav_yield_ton, confidence, updated_at
                FROM yield_results
                WHERE mission_code=%s
                """,
                (mission_code,),
            )
        else:
            cursor.execute(
                """
                SELECT mission_code, avg_yield_per_mu, area_mu, capture_point_count,
                       planned_shot_count, completed_shot_count, progress_ratio,
                       fusion_yield_ton, uav_yield_ton, confidence, updated_at
                FROM yield_results
                ORDER BY updated_at DESC
                """
            )
        rows = cursor.fetchall()
    return [
        {
            "missionCode": row["mission_code"],
            "avgYieldPerMu": float(row["avg_yield_per_mu"]),
            "areaMu": float(row["area_mu"]),
            "capturePointCount": int(row["capture_point_count"]),
            "plannedShotCount": int(row["planned_shot_count"]),
            "completedShotCount": int(row["completed_shot_count"]),
            "progressRatio": float(row["progress_ratio"]),
            "fusionYieldTon": float(row["fusion_yield_ton"]),
            "uavYieldTon": float(row["uav_yield_ton"]),
            "confidence": float(row["confidence"]),
            "updatedAt": row["updated_at"],
        }
        for row in rows
    ]


@app.get("/api/missions/{mission_code}/area")
def get_mission_area(mission_code: str, admin: str = Depends(require_admin)):
    with get_conn() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT mission_code, area_mu, confirmed, boundary_json, planned_points_json,
                   planned_shot_count, updated_at
            FROM mission_areas
            WHERE mission_code=%s
            """,
            (mission_code,),
        )
        row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Mission area not found")
    return {
        "missionCode": row["mission_code"],
        "areaMu": float(row["area_mu"]),
        "confirmed": bool(row["confirmed"]),
        "boundary": json.loads(row["boundary_json"]),
        "plannedPoints": json.loads(row["planned_points_json"]),
        "plannedShotCount": int(row["planned_shot_count"] or 0),
        "updatedAt": row["updated_at"],
    }


@app.put("/api/missions/{mission_code}/area")
def save_mission_area(mission_code: str, payload: MissionAreaPayload, admin: str = Depends(require_admin)):
    if payload.confirmed and len(payload.boundary) < 3:
        raise HTTPException(status_code=400, detail="Boundary requires at least 3 points")

    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT IGNORE INTO missions(mission_code, field_name, status)
            VALUES(%s, %s, 'planned')
            """,
            (mission_code, f"田块 {mission_code}"),
        )
        planned_shot_count = payload.plannedShotCount
        if planned_shot_count is None:
            planned_shot_count = len(payload.plannedPoints)

        cursor.execute(
            """
            INSERT INTO mission_areas(
              mission_code, area_mu, confirmed, boundary_json, planned_points_json, planned_shot_count
            )
            VALUES(%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
              area_mu=VALUES(area_mu),
              confirmed=VALUES(confirmed),
              boundary_json=VALUES(boundary_json),
              planned_points_json=VALUES(planned_points_json),
              planned_shot_count=VALUES(planned_shot_count)
            """,
            (
                mission_code,
                payload.areaMu,
                payload.confirmed,
                json.dumps(payload.boundary, ensure_ascii=False),
                json.dumps(payload.plannedPoints, ensure_ascii=False),
                int(planned_shot_count or 0),
            ),
        )
        rebuild_yield_result(cursor, mission_code)
        conn.commit()
    return {"status": "ok", "missionCode": mission_code}
