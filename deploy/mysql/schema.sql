CREATE TABLE IF NOT EXISTS missions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  mission_code VARCHAR(64) NOT NULL UNIQUE,
  field_name VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
