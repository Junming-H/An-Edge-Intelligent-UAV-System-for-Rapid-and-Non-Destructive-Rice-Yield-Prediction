const loginView = document.querySelector("#loginView");
const appShell = document.querySelector("#appShell");
const loginForm = document.querySelector("#loginForm");
const loginUsername = document.querySelector("#loginUsername");
const loginPassword = document.querySelector("#loginPassword");
const loginCaptcha = document.querySelector("#loginCaptcha");
const captchaRefresh = document.querySelector("#captchaRefresh");
const loginError = document.querySelector("#loginError");
const logoutButton = document.querySelector("#logoutButton");
const fieldMap = document.querySelector("#fieldMap");
const fusionYieldValue = document.querySelector("#fusionYieldValue");
const yieldConfidence = document.querySelector("#yieldConfidence");
const fieldAreaInput = document.querySelector("#fieldAreaInput");
const sampleCount = document.querySelector("#sampleCount");
const sampleProgress = document.querySelector("#sampleProgress");
const taskProgressPercent = document.querySelector("#taskProgressPercent");
const taskProgressBar = document.querySelector("#taskProgressBar");
const taskTimeSummary = document.querySelector("#taskTimeSummary");
const droneBattery = document.querySelector("#droneBattery");
const droneBatteryBar = document.querySelector("#droneBatteryBar");
const droneSelect = document.querySelector("#droneSelect");
const droneTitle = document.querySelector("#droneTitle");
const droneAltitude = document.querySelector("#droneAltitude");
const droneFlightMode = document.querySelector("#droneFlightMode");
const droneModeValue = document.querySelector("#droneModeValue");
const droneLinkMode = document.querySelector("#droneLinkMode");
const droneSignalStrength = document.querySelector("#droneSignalStrength");
const dronePositioningQuality = document.querySelector("#dronePositioningQuality");
const droneSatelliteCount = document.querySelector("#droneSatelliteCount");
const droneAttitudeStatus = document.querySelector("#droneAttitudeStatus");
const droneModel = document.querySelector("#droneModel");
const droneVx = document.querySelector("#droneVx");
const droneVy = document.querySelector("#droneVy");
const droneVz = document.querySelector("#droneVz");
const droneAx = document.querySelector("#droneAx");
const droneAy = document.querySelector("#droneAy");
const droneAz = document.querySelector("#droneAz");
const executeMissionButton = document.querySelector("#executeMissionButton");
const returnHomeButton = document.querySelector("#returnHomeButton");
const droneVideoStatus = document.querySelector("#droneVideoStatus");
const droneVideoStatusLight = document.querySelector("#droneVideoStatusLight");
const droneLiveFrame = document.querySelector("#droneLiveFrame");
const taskSelect = document.querySelector("#taskSelect");
const newTaskButton = document.querySelector("#newTaskButton");
const renameTaskButton = document.querySelector("#renameTaskButton");
const deleteTaskButton = document.querySelector("#deleteTaskButton");
const currentTaskLabel = document.querySelector("#currentTaskLabel");
const areaTaskLabel = document.querySelector("#areaTaskLabel");
const syncButton = document.querySelector("#syncButton");
const generateMissionButton = document.querySelector("#generateMissionButton");
const loadMissionButton = document.querySelector("#loadMissionButton");
const mapFallback = document.querySelector("#mapFallback");
const pageTitle = document.querySelector("#pageTitle");
const currentTime = document.querySelector("#currentTime");
const currentDate = document.querySelector("#currentDate");
const weatherSummary = document.querySelector("#weatherSummary");
const weatherDetail = document.querySelector("#weatherDetail");
const weatherIcon = document.querySelector("#weatherIcon");
const weatherLocationButton = document.querySelector("#weatherLocationButton");
const imageViewer = document.querySelector("#imageViewer");
const viewerImage = document.querySelector("#viewerImage");
const viewerClose = document.querySelector("#viewerClose");
const viewerExport = document.querySelector("#viewerExport");
const imageGroupViewer = document.querySelector("#imageGroupViewer");
const imageGroupClose = document.querySelector("#imageGroupClose");
const imageGroupGrid = document.querySelector("#imageGroupGrid");
const imageGroupTitle = document.querySelector("#imageGroupTitle");
const imageGroupSubtitle = document.querySelector("#imageGroupSubtitle");
const zoomInButton = document.querySelector("#zoomInButton");
const zoomOutButton = document.querySelector("#zoomOutButton");
const heatmapButtons = document.querySelectorAll(".heatmap-tabs button");
const heatLegendTitle = document.querySelector("#heatLegendTitle");
const heatMinLabel = document.querySelector("#heatMinLabel");
const heatMaxLabel = document.querySelector("#heatMaxLabel");
const pointTooltip = document.querySelector("#pointTooltip");
const areaDrawButton = document.querySelector("#areaDrawButton");
const areaConfirmButton = document.querySelector("#areaConfirmButton");
const areaClearButton = document.querySelector("#areaClearButton");
const areaDrawStatus = document.querySelector("#areaDrawStatus");
const batchManageButton = document.querySelector("#batchManageButton");
const batchMissionSelect = document.querySelector("#batchMissionSelect");
const batchMoveButton = document.querySelector("#batchMoveButton");
const batchDeleteButton = document.querySelector("#batchDeleteButton");
const batchManageStatus = document.querySelector("#batchManageStatus");

const SYSTEM_TITLE = "水稻产量预测系统";
const SYSTEM_VERSION = "v1.3.1.20260612.beta";
const MINUTES_PER_MU = 1.5;
const MISSION_PROGRESS_TICK_MS = 500;
const MISSION_EXECUTION_SIMULATION_MS = 60 * 1000;
const FINAL_MISSION_YIELD_TON = 6.81;
const FINAL_YIELD_CONFIDENCE = 92.6;
const DESIGN_WIDTH = 2048;
const DESIGN_HEIGHT = 1034;
const LIVE_FRAME_STALE_MS = 3000;
const LIVE_FRAME_FPS = 20;
const LOCAL_CAPTCHA_KEY = "yield-system-local-captcha";
const appConfig = window.APP_CONFIG || {};
const useDjiModelMap = true;
const djiModelMap = {
  center: [112.65835762023926, 23.155354918362896],
  tileUrl: "./assets/model_map/map/{z}/{x}/{y}.webp",
  tileFallbackUrl: "./assets/model_map/map/{z}/{x}/{y}.png",
  heatTileRoot: "./assets/model_map/index_map_color_05m",
  heatTileLayers: {
    yieldPerMu: "OSAVI",
    panicleDensity: "NDVI",
    panicleCoverage: "OSAVI",
    plantHeight: "GNDVI",
  },
  minZoom: 16,
  maxZoom: 20,
};
const mapUavIconUrl = "./assets/drone/map-uav-gps-point.png";
const minZoom = useDjiModelMap ? djiModelMap.minZoom : 16;
const maxZoom = useDjiModelMap ? djiModelMap.maxZoom : 24;
const weatherLocationStorageKey = "yield-system-weather-location";
let mapZoom = 18;
let appScale = 1;

const weatherCodeText = {
  0: "晴",
  1: "少云",
  2: "多云",
  3: "阴",
  45: "雾",
  48: "雾凇",
  51: "小毛毛雨",
  53: "毛毛雨",
  55: "强毛毛雨",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  80: "阵雨",
  81: "中阵雨",
  82: "强阵雨",
  95: "雷雨",
  96: "雷雨伴冰雹",
  99: "强雷雨伴冰雹",
};

function activeDrone() {
  return droneDevices.find((item) => item.device_code === activeDroneId) || droneDevices[0] || null;
}

function activeDroneDeviceCode() {
  return activeDrone()?.device_code || activeDroneId || "";
}

function activeDroneDisplayName() {
  const drone = activeDrone();
  return drone?.name || drone?.device_code || "暂无无人机";
}

function localFlightModeForActiveDrone() {
  const state = droneCommandState[activeDroneDeviceCode()] || "manual";
  if (state === "mission") {
    return "AUTO.MISSION";
  }
  if (state === "return") {
    return "AUTO.RTL";
  }
  return "MANUAL";
}

function getMissionTemplate() {
  return null;
}

function taskIds() {
  return Object.keys(tasks).sort();
}

function upsertTask(task) {
  if (!task?.id) {
    return null;
  }
  tasks[task.id] = {
    id: task.id,
    name: task.name || task.id,
    area: Number(task.area) || 0,
    sampleBase: Number(task.sampleBase) || 0,
    completed: Number(task.completed) || 0,
    plannedShotCount: Number(task.plannedShotCount) || 0,
    completedShotCount: Number(task.completedShotCount) || 0,
    boundary: Array.isArray(task.boundary) ? [...task.boundary] : [],
    executionRunning: Boolean(task.executionRunning),
    executionStartedAt: task.executionStartedAt || null,
    executionDurationMs: Number(task.executionDurationMs) || null,
    displayDurationMs: Number(task.displayDurationMs) || null,
    centerIndex: Number.isFinite(Number(task.centerIndex)) ? Number(task.centerIndex) : 0,
  };
  return tasks[task.id];
}

function cleanMissionName(name, fallback) {
  const text = String(name || "").trim();
  if (!text) {
    return fallback || "";
  }
  return text.replace(/\s*[·\-].*$/, "").trim() || fallback || "";
}

function nextTaskId() {
  const ids = taskIds();
  const prefix = "T-";
  const numbers = ids
    .map((id) => Number(String(id).replace(/^[^\d]*/, "")))
    .filter(Number.isFinite);
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${String(next).padStart(2, "0")}`;
}

function renderTaskOptions() {
  if (!taskSelect) {
    return;
  }
  const ids = taskIds();
  taskSelect.innerHTML = "";
  if (!ids.length) {
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "暂无任务";
    taskSelect.appendChild(emptyOption);
    taskSelect.disabled = true;
    taskSelect.value = "";
    return;
  }
  taskSelect.disabled = false;
  ids.forEach((id) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = tasks[id]?.name || id;
    taskSelect.appendChild(option);
  });
  if (!ids.includes(activeTaskId)) {
    activeTaskId = ids[0];
  }
  taskSelect.value = activeTaskId;
}

function applyMissionTemplateToTask(task, template) {
  if (!task || !template) {
    return false;
  }
  task.missionTemplate = { ...template };
  task.plannedShotCount = Number(template.cameraShots) || task.plannedShotCount || 0;
  return true;
}

function startMissionExecution(taskId) {
  const task = tasks[taskId];
  if (!task) {
    return;
  }
  task.executionRunning = true;
  task.executionStartedAt = new Date().toISOString();
  task.executionDurationMs = MISSION_EXECUTION_SIMULATION_MS;
  task.displayDurationMs = MISSION_EXECUTION_SIMULATION_MS;
  task.completedShotCount = Math.max(0, Number(task.completedShotCount) || 0);
}

function resumeMissionExecution() {}

function stopMissionExecution() {
  const task = tasks[activeTaskId];
  if (task) {
    task.executionRunning = false;
  }
}

function buildMissionCaptureImages(taskId) {
  const task = tasks[taskId];
  const points = plannedShotPointsForTask(task);
  return points.map((point, index) => ({
    id: null,
    type: "uav",
    title: `采集图像 ${index + 1}`,
    src: "",
    point,
    missionCode: taskId,
    metrics: null,
  }));
}

function projectCaptureImagesToMissionPoints(images) {
  return Array.isArray(images) ? images : [];
}

function interpolateRoutePoints(points, count) {
  const route = points
    .map((point) => [Number(point[0]), Number(point[1])])
    .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));
  const total = Math.max(0, Math.round(Number(count || 0)));
  if (!route.length || total === 0) {
    return [];
  }
  if (route.length === 1 || total === 1) {
    return [route[0]];
  }

  const segmentLengths = [];
  let totalLength = 0;
  for (let index = 0; index < route.length - 1; index += 1) {
    const length = Math.max(0.000001, metersBetween(route[index], route[index + 1]));
    segmentLengths.push(length);
    totalLength += length;
  }

  const shots = [];
  for (let shotIndex = 0; shotIndex < total; shotIndex += 1) {
    const targetDistance = totalLength * (shotIndex / Math.max(1, total - 1));
    let traversed = 0;
    let segmentIndex = 0;
    while (segmentIndex < segmentLengths.length - 1 && traversed + segmentLengths[segmentIndex] < targetDistance) {
      traversed += segmentLengths[segmentIndex];
      segmentIndex += 1;
    }
    const segmentLength = segmentLengths[segmentIndex] || 1;
    const ratio = clamp((targetDistance - traversed) / segmentLength, 0, 1);
    const base = interpolatePoint(route[segmentIndex], route[segmentIndex + 1], ratio);
    const jitter = (shotIndex % 5 - 2) * 0.00000075;
    shots.push([base[0] + jitter, base[1] - jitter * 0.55]);
  }
  return shots;
}

function plannedShotPointsForTask(task = tasks[activeTaskId]) {
  const shotCount = missionPlannedShotCount(task) || plannedPoints.length;
  if (missionRoutePoints.length >= 2) {
    return interpolateRoutePoints(missionRoutePoints, shotCount);
  }
  return plannedPoints.slice(0, shotCount || plannedPoints.length);
}

function saveMissionRouteToStorage() {}

function loadMissionRouteFromStorage() {
  return [];
}

function saveMissionProgressToStorage() {}

function loadMissionProgressFromStorage() {
  return {};
}

function missionPlannedShotCount(task = tasks[activeTaskId]) {
  const planned = Number(task?.plannedShotCount);
  if (Number.isFinite(planned) && planned > 0) {
    return Math.round(planned);
  }
  const sampleBase = Number(task?.sampleBase);
  return Number.isFinite(sampleBase) && sampleBase > 0 ? Math.round(sampleBase) : 0;
}

function missionCompletedShotCount(task = tasks[activeTaskId]) {
  const completed = Number(task?.completedShotCount);
  if (Number.isFinite(completed) && completed >= 0) {
    return Math.round(completed);
  }
  return 0;
}

function missionEstimatedDurationMs(task = tasks[activeTaskId]) {
  const areaMu = Number(task?.area || fieldAreaInput?.value || 0);
  const total = missionPlannedShotCount(task);
  const areaBasedMinutes = areaMu > 0 ? areaMu * MINUTES_PER_MU : 0;
  const pointBasedMinutes = total > 0 ? (total / 15) * MINUTES_PER_MU : 0;
  const minutes = areaBasedMinutes || pointBasedMinutes || 1;
  return Math.max(1000, minutes * 60 * 1000);
}

function missionFullYieldTon(task = tasks[activeTaskId]) {
  const areaMu = Number(task?.area || fieldAreaInput?.value || 0);
  const avgYield = Number(activeYieldResult?.avgYieldPerMu);
  if (!Number.isFinite(avgYield) || !Number.isFinite(areaMu) || areaMu <= 0) {
    return 0;
  }
  return (avgYield * areaMu) / 1000;
}

function missionDisplayYieldTon() {
  const result = Number(activeYieldResult?.fusionYieldTon);
  if (Number.isFinite(result) && result > 0) {
    return result;
  }
  return 0;
}

function updateYieldConfidence() {
  if (!yieldConfidence) {
    return;
  }
  const confidence = Number(activeYieldResult?.confidence);
  yieldConfidence.textContent = Number.isFinite(confidence)
    ? `估测置信度 ${confidence.toFixed(1)}%`
    : "估测置信度 --";
}

function isMissionExecuting(taskId = activeTaskId) {
  return false;
}

function displayDronePath() {
  return liveDronePath.length >= 2 ? liveDronePath : [];
}

function updateDroneIdentity() {
  if (droneTitle) {
    droneTitle.textContent = activeDroneDisplayName();
  }
  if (droneSelect) {
    droneSelect.value = activeDroneId;
  }
  setCurrentDroneConnected(false, "当前无人机未连接");
}

function renderDroneOptions() {
  if (!droneSelect) {
    return;
  }
  droneSelect.innerHTML = "";
  if (!droneDevices.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "暂无无人机";
    droneSelect.appendChild(option);
    droneSelect.disabled = true;
    return;
  }
  droneSelect.disabled = false;
  droneDevices.forEach((device) => {
    const option = document.createElement("option");
    option.value = device.device_code;
    option.textContent = device.name || device.device_code;
    droneSelect.appendChild(option);
  });
  if (!activeDroneId || !droneDevices.some((item) => item.device_code === activeDroneId)) {
    activeDroneId = droneDevices[0].device_code;
  }
  droneSelect.value = activeDroneId;
}

async function loadDevicesFromApi() {
  try {
    const rows = await fetchJson("/api/devices");
    droneDevices = Array.isArray(rows)
      ? rows.filter((item) => String(item.device_type || "").toLowerCase() === "uav")
      : [];
    renderDroneOptions();
    updateDroneIdentity();
    return true;
  } catch (error) {
    console.info("Device list unavailable", error);
    droneDevices = [];
    activeDroneId = "";
    renderDroneOptions();
    updateDroneIdentity();
    return false;
  }
}

function setCurrentDroneConnected(isConnected, message) {
  currentDroneConnected = Boolean(isConnected);
  if (droneVideoStatus) {
    droneVideoStatus.textContent = message || (currentDroneConnected ? "LiveView 在线" : "当前无人机未连接");
  }
  if (droneVideoStatusLight) {
    droneVideoStatusLight.classList.toggle("ok", currentDroneConnected);
    droneVideoStatusLight.classList.toggle("error", !currentDroneConnected);
  }
  if (fieldMap) {
    fieldMap.classList.toggle("drone-connected", currentDroneConnected);
    fieldMap.classList.toggle("drone-disconnected", !currentDroneConnected);
  }
}

function clearLiveFrameStatus(message = "当前无人机未连接") {
  setCurrentDroneConnected(false, message);
  if (droneLiveFrame) {
    droneLiveFrame.hidden = true;
    droneLiveFrame.removeAttribute("src");
    liveFrameStreamSrc = "";
    droneLiveFrame.closest(".live-view-screen")?.classList.remove("has-frame");
  }
}

function updateDroneBattery(value) {
  const battery = Number(value);
  const safeBattery = Number.isFinite(battery) ? Math.max(0, Math.min(100, battery)) : null;
  droneBattery.textContent = safeBattery === null ? "--" : `${Math.round(safeBattery)}%`;
  if (droneBatteryBar) {
    droneBatteryBar.style.width = safeBattery === null ? "0%" : `${safeBattery}%`;
    droneBatteryBar.dataset.level = safeBattery === null ? "unknown" : String(Math.round(safeBattery));
  }
}

function weatherIconType(code) {
  const value = Number(code);
  if ([0, 1].includes(value)) {
    return "sun";
  }
  if ([2, 3].includes(value)) {
    return "cloud";
  }
  if ([45, 48].includes(value)) {
    return "fog";
  }
  if ([95, 96, 99].includes(value)) {
    return "storm";
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(value)) {
    return "rain";
  }
  return "cloud";
}

function setWeatherIcon(type) {
  if (!weatherIcon) {
    return;
  }
  weatherIcon.className = `weather-icon weather-icon-${type || "cloud"}`;
}

let captureImages = [];
let step = 0;
let syncCount = 0;
let mapCenter = useDjiModelMap ? djiModelMap.center : [112.6584503, 23.1558313];
let currentDronePoint = null;
let liveDronePath = [];
let currentGroundPoint = null;
let mapMode = "offline";
let amap = null;
let offlineBase = null;
let overlay = null;
let amapHeatOverlay = null;
let amapRouteOverlay = null;
let amapPointOverlay = null;
let amapCanvasOverlay = null;
let djiTilePane = null;
let djiTileElements = new Map();
let djiHeatTilePane = null;
let djiHeatTileElements = new Map();
let amapLayers = [];
let activeHeatLayer = "yieldPerMu";
let fusionYieldPerMu = null;
let uavYieldPerMu = null;
let activeTaskId = "";
let isDrawingArea = false;
let isAreaConfirmed = false;
let taskBoundary = [];
let plannedPoints = [];
let missionRoutePoints = [];
let currentViewerImage = null;
let imagePointGroups = [];
let imagePointGroupsSignature = "";
let captureImagesSignature = "";
let captureImagesPollInFlight = false;
let captureHeatVisible = false;
let captureHeatTimer = null;
let isBatchManagingCapturePoints = false;
const selectedCaptureGroupKeys = new Set();
let activeYieldResult = null;
let djiDragState = null;
let weatherLocation = null;
let overlayRenderTimer = null;
let pointOverlayRenderPending = false;
let heatTileSizeCache = null;
let canvasHitTargets = [];
let appStarted = false;
let clockTimer = null;
let weatherTimer = null;
let telemetryTimer = null;
let liveFrameTimer = null;
let capturePollTimer = null;
let actionFeedbackTimer = null;
let droneAttitudeBaseline = null;
let lastDroneAttitudeMode = "";
let liveFrameStreamSrc = "";
let currentDroneConnected = false;
const syncedCaptureMissionCodes = new Set();
let droneDevices = [];
let activeDroneId = "";
const droneCommandState = {};
let tasks = {};

const heatLayers = {
  yieldPerMu: {
    label: "亩产量",
    min: "600 kg/亩",
    max: "850 kg/亩",
    color: "rgba(239, 68, 68, 0.68)",
    values: [0.34, 0.48, 0.63, 0.76, 0.89, 0.81, 0.69],
  },
  panicleDensity: {
    label: "穗密度",
    min: "180",
    max: "360 panicles/m2",
    color: "rgba(91, 201, 101, 0.72)",
    values: [0.86, 0.9, 0.82, 0.78, 0.88, 0.92, 0.84],
  },
  panicleCoverage: {
    label: "穗覆盖率",
    min: "42%",
    max: "88%",
    color: "rgba(183, 214, 75, 0.72)",
    values: [0.74, 0.82, 0.87, 0.79, 0.91, 0.86, 0.8],
  },
  plantHeight: {
    label: "株高",
    min: "75 cm",
    max: "120 cm",
    color: "rgba(47, 128, 237, 0.68)",
    values: [0.72, 0.76, 0.82, 0.88, 0.91, 0.86, 0.8],
  },
};

function transformLat(lng, lat) {
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += ((20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin((lat / 3.0) * Math.PI)) * 2.0) / 3.0;
  ret += ((160.0 * Math.sin((lat / 12.0) * Math.PI) + 320 * Math.sin((lat * Math.PI) / 30.0)) * 2.0) / 3.0;
  return ret;
}

function transformLng(lng, lat) {
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += ((20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin((lng / 3.0) * Math.PI)) * 2.0) / 3.0;
  ret += ((150.0 * Math.sin((lng / 12.0) * Math.PI) + 300.0 * Math.sin((lng / 30.0) * Math.PI)) * 2.0) / 3.0;
  return ret;
}

function wgs84ToGcj02([lng, lat]) {
  const a = 6378245.0;
  const ee = 0.00669342162296594323;
  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI);
  dLng = (dLng * 180.0) / ((a / sqrtMagic) * Math.cos(radLat) * Math.PI);
  return [lng + dLng, lat + dLat];
}

function toAmapPosition(point) {
  if (useDjiModelMap) {
    return point;
  }
  return wgs84ToGcj02(point);
}

function amapPositionToWgs84(point) {
  if (useDjiModelMap) {
    return point;
  }
  const [lng, lat] = point;
  const [offsetLng, offsetLat] = wgs84ToGcj02(point);
  return [lng * 2 - offsetLng, lat * 2 - offsetLat];
}

function getBounds(points) {
  return points.reduce(
    (bounds, [lng, lat]) => ({
      minLng: Math.min(bounds.minLng, lng),
      maxLng: Math.max(bounds.maxLng, lng),
      minLat: Math.min(bounds.minLat, lat),
      maxLat: Math.max(bounds.maxLat, lat),
    }),
    { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity },
  );
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function pointToOfflineScreen([lng, lat]) {
  if (mapMode === "dji") {
    return pointToDjiScreen([lng, lat]);
  }
  const pointBounds = getBounds([
    ...displayDronePath(),
    ...captureImages.filter((item) => item.type !== "ground").map((item) => item.point),
  ]);
  const width = fieldMap.clientWidth;
  const height = fieldMap.clientHeight;
  const padX = width * 0.18;
  const padY = height * 0.16;
  const lngRange = pointBounds.maxLng - pointBounds.minLng || 1;
  const latRange = pointBounds.maxLat - pointBounds.minLat || 1;
  const x = padX + ((lng - pointBounds.minLng) / lngRange) * (width - padX * 2);
  const y = padY + ((pointBounds.maxLat - lat) / latRange) * (height - padY * 2);
  return {
    x: width / 2 + (x - width / 2) * offlineScale(),
    y: height / 2 + (y - height / 2) * offlineScale(),
  };
}

function screenToOfflinePoint(x, y) {
  if (mapMode === "dji") {
    return screenToDjiPoint(x, y);
  }
  const pointBounds = getBounds([
    ...displayDronePath(),
    ...captureImages.filter((item) => item.type !== "ground").map((item) => item.point),
  ]);
  const width = fieldMap.clientWidth;
  const height = fieldMap.clientHeight;
  const padX = width * 0.18;
  const padY = height * 0.16;
  const scale = offlineScale();
  const baseX = width / 2 + (x - width / 2) / scale;
  const baseY = height / 2 + (y - height / 2) / scale;
  const lngRange = pointBounds.maxLng - pointBounds.minLng || 1;
  const latRange = pointBounds.maxLat - pointBounds.minLat || 1;
  const lng = pointBounds.minLng + ((baseX - padX) / (width - padX * 2)) * lngRange;
  const lat = pointBounds.maxLat - ((baseY - padY) / (height - padY * 2)) * latRange;
  return [lng, lat];
}

function djiZoomLevel() {
  return Math.round(clamp(mapZoom, djiModelMap.minZoom, djiModelMap.maxZoom));
}

function lngLatToWorldPixel([lng, lat], zoom = djiZoomLevel()) {
  const scale = 256 * 2 ** zoom;
  const safeLat = clamp(lat, -85.05112878, 85.05112878);
  const sinLat = Math.sin((safeLat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
  };
}

function worldPixelToLngLat(x, y, zoom = djiZoomLevel()) {
  const scale = 256 * 2 ** zoom;
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));
  return [lng, lat];
}

function pointToDjiScreen(point) {
  const width = fieldMap.clientWidth;
  const height = fieldMap.clientHeight;
  const zoom = djiZoomLevel();
  const center = lngLatToWorldPixel(mapCenter, zoom);
  const target = lngLatToWorldPixel(point, zoom);
  return {
    x: target.x - center.x + width / 2,
    y: target.y - center.y + height / 2,
  };
}

function screenToDjiPoint(x, y) {
  const width = fieldMap.clientWidth;
  const height = fieldMap.clientHeight;
  const zoom = djiZoomLevel();
  const center = lngLatToWorldPixel(mapCenter, zoom);
  return worldPixelToLngLat(center.x + x - width / 2, center.y + y - height / 2, zoom);
}

function offlineScale() {
  return 1 + (mapZoom - 18) * 0.32;
}

function heatRadiusScale() {
  return Math.max(0.55, 1 + (mapZoom - 18) * 0.42);
}

function markerScale() {
  return clamp(0.58 + (mapZoom - minZoom) * 0.14, 0.5, 1.55);
}

function routeScale() {
  return clamp(0.78 + (mapZoom - 18) * 0.08, 0.6, 1.25);
}

function heatRadiusMeters(value) {
  return 1.2 + value * 1.8;
}

function heatAlpha(value) {
  return 0.58 + value * 0.18;
}

function normalizeHeatValue(value, values) {
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  if (maxValue === minValue) {
    return 0.5;
  }
  return clamp((value - minValue) / (maxValue - minValue), 0, 1);
}

function numberFromText(value) {
  const match = String(value ?? "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : NaN;
}

function heatMetricValue(item, layerKey = activeHeatLayer) {
  if (item.images) {
    const values = item.images
      .map((image) => numberFromText(image.metrics?.[layerKey]))
      .filter(Number.isFinite);
    if (values.length) {
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    }
  }
  return numberFromText(item.metrics?.[layerKey]);
}

function normalizeMetricHeatValue(value, layer) {
  const minValue = numberFromText(layer.min);
  const maxValue = numberFromText(layer.max);
  if (Number.isFinite(minValue) && Number.isFinite(maxValue) && maxValue !== minValue) {
    return clamp((value - minValue) / (maxValue - minValue), 0, 1);
  }
  return normalizeHeatValue(value, layer.values);
}

function captureYieldValues() {
  const capturePoints = groupCaptureImages();
  const values = capturePoints
    .map((item) => numberFromText(item.metrics?.yieldPerMu))
    .filter(Number.isFinite);
  if (values.length) {
    return values;
  }
  return plannedPoints.map((_, index) => 620 + (index % 6) * 27 + ((index % 3) - 1) * 8);
}

function coverageAreaMu() {
  const area = Number.parseFloat(fieldAreaInput.value);
  if (Number.isFinite(area) && area > 0) {
    return area;
  }
  return tasks[activeTaskId]?.area || 0;
}

function averageYieldPerMu(scale = 1) {
  const values = captureYieldValues();
  if (!values.length) {
    return 0;
  }
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return average * scale;
}

function yieldTonnesFromAverage(scale = 1) {
  return (averageYieldPerMu(scale) * coverageAreaMu()) / 1000;
}

function updateYieldCards() {
  const progressRatio = missionProgress().ratio;
  const yieldTon = FINAL_MISSION_YIELD_TON * progressRatio;
  fusionYieldValue.textContent = `${yieldTon.toFixed(2)} 吨`;
  updateYieldConfidence();
}

function heatColor(value) {
  const normalized = clamp(value, 0, 1);
  if (normalized < 0.2) {
    return "#0665ff";
  }
  if (normalized < 0.42) {
    return "#08d8ff";
  }
  if (normalized < 0.64) {
    return "#14e56f";
  }
  if (normalized < 0.82) {
    return "#ffd21f";
  }
  return "#ff2b18";
}

function heatPalette(value) {
  const normalized = clamp(value, 0, 1);
  if (normalized < 0.2) {
    return { core: "rgba(0, 126, 255, 0.86)", mid: "rgba(0, 218, 255, 0.36)", outer: "rgba(0, 72, 255, 0)" };
  }
  if (normalized < 0.42) {
    return { core: "rgba(0, 235, 255, 0.88)", mid: "rgba(0, 164, 255, 0.4)", outer: "rgba(0, 88, 255, 0)" };
  }
  if (normalized < 0.64) {
    return { core: "rgba(41, 238, 112, 0.9)", mid: "rgba(0, 222, 211, 0.42)", outer: "rgba(0, 128, 255, 0)" };
  }
  if (normalized < 0.82) {
    return { core: "rgba(255, 232, 35, 0.92)", mid: "rgba(42, 229, 99, 0.46)", outer: "rgba(0, 168, 255, 0)" };
  }
  return { core: "rgba(255, 28, 18, 0.94)", mid: "rgba(255, 206, 24, 0.5)", outer: "rgba(0, 210, 255, 0)" };
}

function metersToLatitude(meters) {
  return meters / 111320;
}

function metersBetween(start, end) {
  const earthRadius = 6371008.8;
  const lat1 = start[1] * Math.PI / 180;
  const lat2 = end[1] * Math.PI / 180;
  const deltaLat = (end[1] - start[1]) * Math.PI / 180;
  const deltaLng = (end[0] - start[0]) * Math.PI / 180;
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function projectedPixelsForMeters(meters, point) {
  if (!amap || !Number.isFinite(meters) || meters <= 0) {
    return 0;
  }
  const center = toAmapPosition(point);
  const edge = toAmapPosition([point[0], point[1] + metersToLatitude(meters)]);
  const centerPixel = amap.lngLatToContainer(center);
  const edgePixel = amap.lngLatToContainer(edge);
  return Math.abs(centerPixel.y - edgePixel.y);
}

function nearestDistanceMeters(items) {
  const distances = [];
  items.forEach((item, index) => {
    let nearest = Infinity;
    items.forEach((other, otherIndex) => {
      if (index === otherIndex) {
        return;
      }
      const distance = metersBetween(item.point, other.point);
      if (distance > 0.03 && distance < nearest) {
        nearest = distance;
      }
    });
    if (Number.isFinite(nearest)) {
      distances.push(nearest);
    }
  });
  return median(distances) || 1.5;
}

function amapHeatSize(value, point) {
  if (!amap) {
    return `${(12 + value * 10) * heatRadiusScale()}px`;
  }

  const radius = heatRadiusMeters(value);
  const center = toAmapPosition(point);
  const edge = toAmapPosition([point[0], point[1] + metersToLatitude(radius)]);
  const centerPixel = amap.lngLatToContainer(center);
  const edgePixel = amap.lngLatToContainer(edge);
  const radiusPixel = Math.max(3, Math.abs(centerPixel.y - edgePixel.y));
  return radiusPixel * 2;
}

function median(values) {
  if (!values.length) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function heatTileSizeFromItems(items) {
  const cacheKey = [
    amap ? amap.getZoom().toFixed(2) : mapZoom.toFixed(2),
    items.length,
    items[0]?.point?.join(",") || "",
    items[items.length - 1]?.point?.join(",") || "",
  ].join("|");
  if (heatTileSizeCache?.key === cacheKey) {
    return heatTileSizeCache.value;
  }
  const distanceMeters = nearestDistanceMeters(items);
  const referencePoint = items[Math.floor(items.length / 2)]?.point || mapCenter;
  const projected = projectedPixelsForMeters(distanceMeters * 1.05, referencePoint);
  const size = Math.max(3, projected);
  heatTileSizeCache = { key: cacheKey, value: { width: size, height: size } };
  return heatTileSizeCache.value;
}

function mapMarkerSizeFromItems(items, point, isCluster = false) {
  const distanceMeters = nearestDistanceMeters(items);
  const projected = projectedPixelsForMeters(distanceMeters * (isCluster ? 0.34 : 0.22), point);
  return Math.max(isCluster ? 4 : 3, projected);
}

function mapDeviceMarkerScale() {
  const projected = projectedPixelsForMeters(2.4, currentDronePoint);
  return Math.max(0.55, projected / 30);
}

function mapRouteScale() {
  const projected = projectedPixelsForMeters(1.4, currentDronePoint);
  return Math.max(0.6, projected / 12);
}

function mapPlannedPointScale(point) {
  const distanceMeters = nearestDistanceMeters(plannedPoints.map((item) => ({ point: item })));
  const projected = projectedPixelsForMeters(distanceMeters * 0.22, point);
  return Math.max(0.45, projected / 16);
}

function ensureAmapHeatOverlay() {
  if (amapHeatOverlay) {
    return amapHeatOverlay;
  }

  amapHeatOverlay = document.createElement("div");
  amapHeatOverlay.className = "amap-heat-overlay";
  fieldMap.appendChild(amapHeatOverlay);
  return amapHeatOverlay;
}

function ensureAmapPointOverlay() {
  if (amapPointOverlay) {
    return amapPointOverlay;
  }

  amapPointOverlay = document.createElement("div");
  amapPointOverlay.className = "amap-point-overlay";
  fieldMap.appendChild(amapPointOverlay);
  return amapPointOverlay;
}

function ensureAmapCanvasOverlay() {
  if (amapCanvasOverlay) {
    return amapCanvasOverlay;
  }

  amapCanvasOverlay = document.createElement("canvas");
  amapCanvasOverlay.className = "amap-canvas-overlay";
  fieldMap.appendChild(amapCanvasOverlay);
  return amapCanvasOverlay;
}

function ensureAmapRouteOverlay() {
  if (amapRouteOverlay) {
    return amapRouteOverlay;
  }

  amapRouteOverlay = document.createElement("div");
  amapRouteOverlay.className = "amap-route-overlay";
  fieldMap.appendChild(amapRouteOverlay);
  return amapRouteOverlay;
}

function ensureDjiTilePane() {
  if (djiTilePane) {
    return djiTilePane;
  }

  djiTilePane = document.createElement("div");
  djiTilePane.className = "dji-tile-pane";
  fieldMap.prepend(djiTilePane);
  return djiTilePane;
}

function ensureDjiHeatTilePane() {
  if (djiHeatTilePane) {
    return djiHeatTilePane;
  }

  djiHeatTilePane = document.createElement("div");
  djiHeatTilePane.className = "dji-heat-tile-pane";
  fieldMap.appendChild(djiHeatTilePane);
  return djiHeatTilePane;
}

function pointInPolygon(point, polygon) {
  const [lng, lat] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [lngI, latI] = polygon[i];
    const [lngJ, latJ] = polygon[j];
    const intersects = latI > lat !== latJ > lat && lng < ((lngJ - lngI) * (lat - latI)) / (latJ - latI) + lngI;
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

function polygonAreaMu(polygon) {
  if (polygon.length < 3) {
    return 0;
  }

  const centerLat = polygon.reduce((sum, [, lat]) => sum + lat, 0) / polygon.length;
  const metersPerLng = 111320 * Math.cos((centerLat * Math.PI) / 180);
  const metersPerLat = 111320;
  const projected = polygon.map(([lng, lat]) => [lng * metersPerLng, lat * metersPerLat]);
  const squareMeters = Math.abs(projected.reduce((sum, [x1, y1], index) => {
    const [x2, y2] = projected[(index + 1) % projected.length];
    return sum + x1 * y2 - x2 * y1;
  }, 0)) / 2;
  return squareMeters / 666.6667;
}

function activeTaskName() {
  return tasks[activeTaskId]?.name || activeTaskId;
}

function updateAreaTaskLabel(status) {
  areaTaskLabel.textContent = `${activeTaskName()} · ${status}`;
}

function isCaptureDataVisible(taskId = activeTaskId) {
  return syncedCaptureMissionCodes.has(taskId);
}

function isCaptureHeatVisible(taskId = activeTaskId) {
  return isCaptureDataVisible(taskId) && captureHeatVisible;
}

function markCaptureDataSynced(taskId = activeTaskId) {
  syncedCaptureMissionCodes.add(taskId);
  imagePointGroupsSignature = "";
}

function markCaptureDataUnsynced(taskId = activeTaskId) {
  syncedCaptureMissionCodes.delete(taskId);
  captureHeatVisible = false;
  window.clearTimeout(captureHeatTimer);
  captureHeatTimer = null;
  imagePointGroupsSignature = "";
  imagePointGroups = [];
  canvasHitTargets = [];
  hidePointTooltip();
}

function scheduleCaptureHeatVisible(delay = 3000, taskId = activeTaskId) {
  window.clearTimeout(captureHeatTimer);
  captureHeatVisible = false;
  captureHeatTimer = window.setTimeout(() => {
    if (taskId === activeTaskId && isCaptureDataVisible(taskId)) {
      captureHeatVisible = true;
      refreshMapOverlays();
    }
  }, delay);
}

function completedUavPointCount() {
  const keys = new Set();
  captureImages.forEach((image) => {
    if (image.type !== "uav" || !Array.isArray(image.point)) {
      return;
    }
    keys.add(`${Number(image.point[0]).toFixed(7)},${Number(image.point[1]).toFixed(7)}`);
  });
  return keys.size;
}

function applyCapturePointProgressFallback(taskId = activeTaskId) {
  const task = tasks[taskId];
  if (!task || !isCaptureDataVisible(taskId)) {
    return;
  }
  const planned = missionPlannedShotCount(task);
  const completedFromTelemetry = Number(task.completedShotCount);
  if (Number.isFinite(completedFromTelemetry) && completedFromTelemetry > 0) {
    return;
  }
  const completedFromCapturePoints = Math.min(planned || Infinity, completedUavPointCount());
  if (Number.isFinite(completedFromCapturePoints) && completedFromCapturePoints > 0) {
    task.completedShotCount = Math.round(completedFromCapturePoints);
    task.completed = task.completedShotCount;
  }
}

function missionProgress(task = tasks[activeTaskId]) {
  const total = missionPlannedShotCount(task);
  const completed = Math.min(total || Infinity, Math.max(0, missionCompletedShotCount(task)));
  const percent = total > 0 ? (completed / total) * 100 : 0;
  return {
    total,
    completed: total > 0 ? completed : 0,
    percent,
    ratio: total > 0 ? Math.min(completed / total, 1) : 0,
  };
}

function updateCollectionPointKpi(task = tasks[activeTaskId]) {
  const { total, completed, percent } = missionProgress(task);
  const areaMu = Number(task?.area || fieldAreaInput?.value || 0);
  const areaBasedMinutes = areaMu > 0 ? areaMu * MINUTES_PER_MU : 0;
  const pointBasedMinutes = total > 0 ? (total / 15) * MINUTES_PER_MU : 0;
  const totalMinutes = areaBasedMinutes || pointBasedMinutes;
  const isExecuting = isMissionExecuting(task?.id || activeTaskId);
  const executionDisplayMinutes = Number(task?.displayDurationMs) > 0
    ? Number(task.displayDurationMs) / 60000
    : totalMinutes;
  const remainingMinutes = isExecuting
    ? Math.max(0, executionDisplayMinutes * (1 - percent / 100))
    : (totalMinutes > 0 ? Math.max(0, totalMinutes * (1 - percent / 100)) : 0);
  sampleCount.textContent = `${total} 个`;
  sampleProgress.textContent = `已完成拍摄 ${completed} 个 · ${percent.toFixed(1)}%`;
  taskProgressPercent.textContent = `${percent.toFixed(1)}%`;
  taskProgressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  taskTimeSummary.innerHTML = `<span>预计 ${formatTaskMinutes(totalMinutes)}</span><span>剩余 ${formatTaskMinutes(remainingMinutes)}</span>`;
  updateYieldCards();
}

function updateAreaFromBoundary() {
  if (taskBoundary.length < 3) {
    return;
  }

  const areaMu = polygonAreaMu(taskBoundary);
  if (areaMu > 0) {
    fieldAreaInput.value = areaMu.toFixed(1);
    tasks[activeTaskId].area = areaMu;
    tasks[activeTaskId].boundary = [...taskBoundary];
    updateAreaTaskLabel("区域自动计算");
    updateYieldByArea();
  }
}

function boundarySidePoints() {
  const sorted = [...taskBoundary].sort((a, b) => a[0] - b[0]);
  const half = Math.ceil(sorted.length / 2);
  const left = sorted.slice(0, half).sort((a, b) => b[1] - a[1]);
  const right = sorted.slice(half).sort((a, b) => b[1] - a[1]);
  return { left, right };
}

function interpolatePoint(start, end, ratio) {
  return [
    start[0] + (end[0] - start[0]) * ratio,
    start[1] + (end[1] - start[1]) * ratio,
  ];
}

function interpolatePolyline(points, ratio) {
  if (points.length === 1) {
    return points[0];
  }

  const scaled = ratio * (points.length - 1);
  const index = Math.min(points.length - 2, Math.floor(scaled));
  return interpolatePoint(points[index], points[index + 1], scaled - index);
}

function planCollectionPoints() {
  if (taskBoundary.length < 3) {
    plannedPoints = [];
    return;
  }

  const areaMu = polygonAreaMu(taskBoundary);
  const targetCount = Math.max(1, Math.round(areaMu * 15));
  const { left, right } = boundarySidePoints();
  const rows = Math.max(1, Math.round(Math.sqrt(targetCount)));
  let columns = Math.max(1, Math.ceil(targetCount / rows));
  const points = [];

  while (points.length < targetCount && columns <= 30) {
    points.length = 0;
    for (let row = 1; row <= rows; row += 1) {
      const rowRatio = row / (rows + 1);
      const leftPoint = interpolatePolyline(left, rowRatio);
      const rightPoint = interpolatePolyline(right, rowRatio);
      for (let column = 1; column <= columns; column += 1) {
        const columnRatio = column / (columns + 1);
        const point = interpolatePoint(leftPoint, rightPoint, columnRatio);
        if (pointInPolygon(point, taskBoundary)) {
          points.push(point);
        }
      }
    }
    columns += 1;
  }
  plannedPoints = points.slice(0, targetCount);
  tasks[activeTaskId].sampleBase = plannedPoints.length;
  tasks[activeTaskId].plannedShotCount = plannedPoints.length;
  if (!Number.isFinite(Number(tasks[activeTaskId].completedShotCount))) {
    tasks[activeTaskId].completedShotCount = 0;
  }
  saveMissionProgressToStorage(activeTaskId, tasks[activeTaskId]);
  updateCollectionPointKpi();
  updateAreaFromBoundary();
}

function updateAreaDrawStatus() {
  if (isDrawingArea) {
    areaDrawStatus.textContent = `正在设置任务区域：已选择 ${taskBoundary.length} 个边界点`;
    areaConfirmButton.disabled = taskBoundary.length < 3;
    return;
  }
  areaConfirmButton.disabled = taskBoundary.length < 3 || isAreaConfirmed;
  if (taskBoundary.length >= 3) {
    const syncHint = isAreaConfirmed && !isCaptureDataVisible() ? "，点击同步采集数据后显示热力图和采集点" : "";
    areaDrawStatus.textContent = `${isAreaConfirmed ? "已确认" : "待确认"}任务区域，面积 ${polygonAreaMu(taskBoundary).toFixed(1)} 亩，规划 ${plannedPoints.length} 个采集点${syncHint}`;
  } else {
    areaDrawStatus.textContent = "点击“设置任务区域”后，在地图上依次选择边界点";
  }
}

function imageGroupKey(point) {
  return `${Number(point[0]).toFixed(7)},${Number(point[1]).toFixed(7)}`;
}

function groupCaptureImages() {
  if (!isCaptureDataVisible()) {
    imagePointGroups = [];
    imagePointGroupsSignature = "";
    return [];
  }

  const signature = captureImagesSignature || getCaptureImagesSignature(captureImages);
  if (imagePointGroups.length && imagePointGroupsSignature === signature) {
    return imagePointGroups;
  }

  const groups = new Map();
  captureImages.filter((item) => item.type !== "ground").forEach((item) => {
    const key = imageGroupKey(item.point);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        type: item.type,
        point: [...item.point],
        missionCode: item.missionCode || activeTaskId,
        images: [],
      });
    }
    groups.get(key).images.push(item);
  });
  groups.forEach((group) => {
    group.type = "uav";
    group.metrics = group.images[0]?.metrics || {};
  });
  imagePointGroups = [...groups.values()].sort((a, b) => b.images.length - a.images.length);
  imagePointGroupsSignature = signature;
  return imagePointGroups;
}

function imagePointLabel(group) {
  return group.images.length > 1 ? String(group.images.length) : "";
}

function imagePointTitle(group) {
  return group.images.length > 1
    ? `${group.images.length} 张图像 · ${group.key}`
    : group.images[0].title;
}

function captureGroupSelectionKey(group) {
  return group.key || imageGroupKey(group.point);
}

function selectedCaptureGroups() {
  if (!selectedCaptureGroupKeys.size) {
    return [];
  }
  return groupCaptureImages().filter((group) => selectedCaptureGroupKeys.has(captureGroupSelectionKey(group)));
}

function selectedCaptureImageIds() {
  return [...new Set(selectedCaptureGroups()
    .flatMap((group) => group.images)
    .map((image) => image.id)
    .filter((id) => id !== undefined && id !== null))];
}

function updateBatchManageStatus(text) {
  if (!batchManageStatus) {
    return;
  }
  if (text) {
    batchManageStatus.textContent = text;
    return;
  }
  const selectedCount = selectedCaptureGroupKeys.size;
  batchManageStatus.textContent = isBatchManagingCapturePoints
    ? `已选择 ${selectedCount} 个采集点`
    : "选择多个采集点后批量操作";
}

function updateBatchManageControls(text) {
  if (!batchManageButton) {
    return;
  }
  batchManageButton.classList.toggle("active", isBatchManagingCapturePoints);
  batchManageButton.textContent = isBatchManagingCapturePoints ? "退出批量管理" : "批量管理采集点";
  [batchMissionSelect, batchMoveButton, batchDeleteButton].forEach((element) => {
    if (element) {
      element.hidden = !isBatchManagingCapturePoints;
    }
  });
  const hasSelection = selectedCaptureGroupKeys.size > 0;
  if (batchMoveButton) {
    batchMoveButton.disabled = !isBatchManagingCapturePoints || !hasSelection;
  }
  if (batchDeleteButton) {
    batchDeleteButton.disabled = !isBatchManagingCapturePoints || !hasSelection;
  }
  updateBatchManageStatus(text);
}

function toggleBatchManageCapturePoints() {
  isBatchManagingCapturePoints = !isBatchManagingCapturePoints;
  selectedCaptureGroupKeys.clear();
  closeImageGroup();
  updateBatchManageControls();
  refreshMapOverlays();
}

function toggleCaptureGroupSelection(group) {
  const key = captureGroupSelectionKey(group);
  if (selectedCaptureGroupKeys.has(key)) {
    selectedCaptureGroupKeys.delete(key);
  } else {
    selectedCaptureGroupKeys.add(key);
  }
  updateBatchManageControls();
  refreshMapOverlays();
}

function openImageGroup(group) {
  imageGroupTitle.textContent = `${group.images.length} 张采集图像`;
  imageGroupSubtitle.textContent = `GPS ${group.key} · ${group.missionCode || activeTaskId}`;
  imageGroupGrid.innerHTML = "";

  const actions = document.createElement("div");
  actions.className = "image-group-actions";

  const missionSelect = document.createElement("select");
  missionSelect.setAttribute("aria-label", "采集点所属任务");
  taskIds().forEach((id) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = tasks[id]?.name || id;
    missionSelect.appendChild(option);
  });
  missionSelect.value = group.missionCode || activeTaskId;

  const moveButton = document.createElement("button");
  moveButton.type = "button";
  moveButton.textContent = "更改所属任务";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "danger";
  deleteButton.textContent = "删除采集点";

  actions.append(missionSelect, moveButton, deleteButton);
  imageGroupGrid.appendChild(actions);

  group.images.forEach((image) => {
    const button = document.createElement("button");
    button.className = "image-group-card";
    button.type = "button";
    button.innerHTML = `<img src="${image.src}" alt="${image.title}"><span>${image.title}</span>`;
    button.addEventListener("click", () => {
      closeImageGroup();
      openViewer(image.src, image.title);
    });
    imageGroupGrid.appendChild(button);
  });

  moveButton.addEventListener("click", async () => {
    const nextMissionCode = missionSelect.value;
    if (!nextMissionCode || nextMissionCode === group.missionCode) {
      return;
    }
    moveButton.textContent = "正在保存";
    const saved = await moveCaptureGroupToMission(group, nextMissionCode);
    moveButton.textContent = saved ? "已保存" : "本地已更改";
    setTimeout(() => {
      closeImageGroup();
      renderTaskOptions();
      applyTask(activeTaskId);
    }, 500);
  });

  deleteButton.addEventListener("click", async () => {
    const confirmed = window.confirm(`确认删除该采集点的 ${group.images.length} 张图像吗？`);
    if (!confirmed) {
      return;
    }
    deleteButton.textContent = "正在删除";
    const deleted = await deleteCaptureGroup(group);
    deleteButton.textContent = deleted ? "已删除" : "本地已删除";
    setTimeout(() => {
      closeImageGroup();
      refreshMapOverlays();
      updateYieldCards();
    }, 500);
  });

  imageGroupViewer.classList.add("open");
  imageGroupViewer.setAttribute("aria-hidden", "false");
}

function closeImageGroup() {
  imageGroupViewer.classList.remove("open");
  imageGroupViewer.setAttribute("aria-hidden", "true");
  imageGroupGrid.innerHTML = "";
}

function renderAmapHeatOverlay() {
  if (!amap || mapMode !== "amap") {
    return;
  }

  const canvas = ensureAmapCanvasOverlay();
  const rect = fieldMap.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  canvasHitTargets = [];
  if (!isCaptureHeatVisible()) {
    return;
  }

  const heatLayer = heatLayers[activeHeatLayer];
  const groups = groupCaptureImages();
  const heatItems = groups.length ? groups : captureImages;
  const pixels = heatItems.map((item) => amap.lngLatToContainer(toAmapPosition(item.point)));
  const tileSize = heatTileSizeFromItems(heatItems);

  heatItems.forEach((item, index) => {
    const metricValue = heatMetricValue(item);
    const fallbackValue = heatLayer.values[index % heatLayer.values.length];
    const normalized = Number.isFinite(metricValue)
      ? normalizeMetricHeatValue(metricValue, heatLayer)
      : normalizeHeatValue(fallbackValue, heatLayer.values);
    const pixel = pixels[index];
    const tileX = pixel.x - tileSize.width / 2;
    const tileY = pixel.y - tileSize.height / 2;
    ctx.globalAlpha = heatAlpha(normalized);
    ctx.fillStyle = heatColor(normalized);
    ctx.fillRect(tileX, tileY, tileSize.width, tileSize.height);

    const markerSize = mapMarkerSizeFromItems(heatItems, item.point, item.images?.length > 1);
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(pixel.x, pixel.y, markerSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#0a84ff";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#fff";
    ctx.stroke();

    if (selectedCaptureGroupKeys.has(captureGroupSelectionKey(item))) {
      ctx.beginPath();
      ctx.arc(pixel.x, pixel.y, markerSize / 2 + 5, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#111827";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pixel.x, pixel.y, markerSize / 2 + 8, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    }

    if (item.images?.length > 1 && markerSize >= 8) {
      ctx.fillStyle = "#fff";
      ctx.font = `900 ${Math.max(5, markerSize * 0.42)}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(item.images.length), pixel.x, pixel.y + 0.2);
    }

    canvasHitTargets.push({
      item,
      x: pixel.x,
      y: pixel.y,
      radius: Math.max(8, markerSize / 2 + 4),
    });
  });
  ctx.globalAlpha = 1;
}

function renderAmapPointOverlay() {
  if (!amap || mapMode !== "amap") {
    return;
  }

  const pointOverlay = ensureAmapPointOverlay();
  pointOverlay.innerHTML = "";

  taskBoundary.forEach((item, index) => {
    const pixel = amap.lngLatToContainer(toAmapPosition(item));
    const point = document.createElement("span");
    point.className = "boundary-point";
    point.textContent = String(index + 1);
    point.style.left = `${pixel.x}px`;
    point.style.top = `${pixel.y}px`;
    pointOverlay.appendChild(point);
  });

  const dronePixel = amap.lngLatToContainer(toAmapPosition(currentDronePoint));
  const droneMarker = document.createElement("div");
  droneMarker.className = "map-marker drone";
  droneMarker.classList.toggle("connected", currentDroneConnected);
  droneMarker.classList.toggle("disconnected", !currentDroneConnected);
  const droneIcon = document.createElement("img");
  droneIcon.src = mapUavIconUrl;
  droneIcon.alt = "无人机";
  droneIcon.draggable = false;
  droneMarker.appendChild(droneIcon);
  droneMarker.style.left = `${dronePixel.x}px`;
  droneMarker.style.top = `${dronePixel.y}px`;
  droneMarker.style.setProperty("--marker-scale", mapDeviceMarkerScale());
  pointOverlay.appendChild(droneMarker);

}

function createAmapRoute(points, color) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  const screenPoints = points
    .map((point) => amap.lngLatToContainer(toAmapPosition(point)))
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  line.setAttribute("points", screenPoints);
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", String(5 * mapRouteScale()));
  line.setAttribute("stroke-linecap", "round");
  line.setAttribute("stroke-linejoin", "round");
  line.setAttribute("stroke-dasharray", "14 12");
  return line;
}

function createAmapMissionRoute() {
  if (missionRoutePoints.length < 2) {
    return null;
  }
  const line = createAmapRoute(missionRoutePoints, "#ff8a00");
  line.setAttribute("class", "mission-route-line");
  line.setAttribute("stroke-width", String(3.5 * mapRouteScale()));
  line.removeAttribute("stroke-dasharray");
  return line;
}

function createAmapBoundaryPolygon() {
  if (taskBoundary.length < 2) {
    return null;
  }

  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  const screenPoints = taskBoundary
    .map((point) => amap.lngLatToContainer(toAmapPosition(point)))
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  polygon.setAttribute("points", screenPoints);
  polygon.setAttribute("class", "task-boundary-shape");
  return polygon;
}

function createOfflineBoundaryPolygon() {
  if (taskBoundary.length < 2) {
    return null;
  }

  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  const screenPoints = taskBoundary
    .map(pointToOfflineScreen)
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  polygon.setAttribute("points", screenPoints);
  polygon.setAttribute("class", "task-boundary-shape");
  return polygon;
}

function renderAmapRouteOverlay() {
  if (!amap || mapMode !== "amap") {
    return;
  }

  const routeOverlay = ensureAmapRouteOverlay();
  routeOverlay.innerHTML = "";

  const width = fieldMap.clientWidth;
  const height = fieldMap.clientHeight;
  const routeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  routeSvg.setAttribute("width", width);
  routeSvg.setAttribute("height", height);
  routeSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const boundary = createAmapBoundaryPolygon();
  if (boundary) {
    routeSvg.appendChild(boundary);
  }
  const missionRoute = createAmapMissionRoute();
  if (missionRoute) {
    routeSvg.appendChild(missionRoute);
  }
  routeSvg.appendChild(createAmapRoute(displayDronePath(), "#2f80ed"));
  routeOverlay.appendChild(routeSvg);
}

function renderAmapOverlays() {
  renderAmapHeatOverlay();
  renderAmapRouteOverlay();
  renderAmapPointOverlay();
}

function scheduleAmapOverlayRender(delay = 120) {
  window.clearTimeout(overlayRenderTimer);
  overlayRenderTimer = window.setTimeout(renderAmapOverlays, delay);
}

function scheduleAmapRealtimeOverlayRender(options = {}) {
  if (options.resetHeatSize) {
    heatTileSizeCache = null;
  }
  if (pointOverlayRenderPending) {
    return;
  }
  pointOverlayRenderPending = true;
  window.requestAnimationFrame(() => {
    pointOverlayRenderPending = false;
    syncMapViewFromAmap();
    renderAmapHeatOverlay();
    renderAmapPointOverlay();
    renderAmapRouteOverlay();
  });
}

function createMarker(className, text, point) {
  const marker = document.createElement("div");
  const screen = pointToOfflineScreen(point);
  marker.className = className;
  marker.textContent = text;
  marker.style.left = `${screen.x}px`;
  marker.style.top = `${screen.y}px`;
  return marker;
}

function createDroneMapMarker(point) {
  const marker = createMarker("map-marker drone", "", point);
  marker.classList.toggle("connected", currentDroneConnected);
  marker.classList.toggle("disconnected", !currentDroneConnected);
  const icon = document.createElement("img");
  icon.src = mapUavIconUrl;
  icon.alt = "无人机";
  icon.draggable = false;
  marker.appendChild(icon);
  return marker;
}

function createImagePoint(group) {
  const point = createMarker(`map-image-point ${group.type}${group.images.length > 1 ? " clustered" : ""}`, imagePointLabel(group), group.point);
  point.setAttribute("aria-label", imagePointTitle(group));
  point.style.setProperty("--marker-scale", markerScale());
  point.classList.toggle("selected", selectedCaptureGroupKeys.has(captureGroupSelectionKey(group)));
  point.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isBatchManagingCapturePoints) {
      toggleCaptureGroupSelection(group);
      return;
    }
    openImageGroup(group);
  });
  point.addEventListener("mouseenter", () => showPointTooltip(group, point));
  point.addEventListener("mouseleave", hidePointTooltip);
  return point;
}

function createHeatPoint(item, index) {
  const layer = heatLayers[activeHeatLayer];
  const metricValue = heatMetricValue(item);
  const value = layer.values[index % layer.values.length];
  const normalized = Number.isFinite(metricValue)
    ? normalizeMetricHeatValue(metricValue, layer)
    : normalizeHeatValue(value, layer.values);
  const palette = heatPalette(normalized);
  const point = createMarker("heat-point", "", item.point);
  point.style.setProperty("--heat-color", heatColor(normalized));
  point.style.setProperty("--heat-core", palette.core);
  point.style.setProperty("--heat-mid", palette.mid);
  point.style.setProperty("--heat-outer", palette.outer);
  point.style.setProperty("--heat-alpha", String(heatAlpha(normalized)));
  const size = (12 + value * 10) * heatRadiusScale();
  point.style.setProperty("--heat-width", `${size}px`);
  point.style.setProperty("--heat-height", `${size}px`);
  return point;
}

function tooltipRows(item) {
  if (item.images) {
    const imageCountRow = ["图像数量", `${item.images.length} 张`];
    return [
      imageCountRow,
      ["穗覆盖率", item.metrics.panicleCoverage],
      ["株高", item.metrics.plantHeight],
      ["穗密度", item.metrics.panicleDensity],
      ["亩产量", item.metrics.yieldPerMu],
    ];
  }
  return [
    ["穗覆盖率", item.metrics.panicleCoverage],
    ["株高", item.metrics.plantHeight],
    ["穗密度", item.metrics.panicleDensity],
    ["亩产量", item.metrics.yieldPerMu],
  ];
}

function showPointTooltip(item, anchor) {
  const mapRect = fieldMap.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  showPointTooltipAt(
    item,
    (anchorRect.left - mapRect.left) / appScale + 16,
    (anchorRect.top - mapRect.top) / appScale - 12,
  );
}

function showPointTooltipAt(item, x, y) {
  const mapRect = fieldMap.getBoundingClientRect();
  const mapWidth = mapRect.width / appScale;
  const rows = tooltipRows(item)
    .map(([label, value]) => `<span><em>${label}</em><b>${value}</b></span>`)
    .join("");

  pointTooltip.innerHTML = `<strong>${item.images ? imagePointTitle(item) : item.title}</strong>${rows}`;
  pointTooltip.classList.add("open");
  pointTooltip.style.left = `${Math.min(x, mapWidth - 230)}px`;
  pointTooltip.style.top = `${Math.max(y, 12)}px`;
}

function hidePointTooltip() {
  pointTooltip.classList.remove("open");
}

function canvasEventPoint(event) {
  return scalePointerEvent(event);
}

function findCanvasHitTarget(event) {
  if (mapMode !== "amap" || !canvasHitTargets.length) {
    return null;
  }
  const point = canvasEventPoint(event);
  for (let index = canvasHitTargets.length - 1; index >= 0; index -= 1) {
    const target = canvasHitTargets[index];
    if (Math.hypot(point.x - target.x, point.y - target.y) <= target.radius) {
      return target;
    }
  }
  return null;
}

function handleCanvasPointerMove(event) {
  const target = findCanvasHitTarget(event);
  if (!target) {
    fieldMap.classList.remove("has-canvas-hit");
    hidePointTooltip();
    return;
  }
  fieldMap.classList.add("has-canvas-hit");
  showPointTooltipAt(target.item, target.x + 16, target.y - 12);
}

function handleCanvasClick(event) {
  if (isDrawingArea) {
    return;
  }
  const target = findCanvasHitTarget(event);
  if (!target) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  if (isBatchManagingCapturePoints) {
    toggleCaptureGroupSelection(target.item);
    return;
  }
  openImageGroup(target.item);
}

function preventBatchMapDoubleClick(event) {
  if (!isBatchManagingCapturePoints) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
}

function handleDjiPointerDown(event) {
  if (mapMode !== "dji" || isDrawingArea || event.button !== 0) {
    return;
  }
  if (event.target.closest("button, select, input, .map-image-point")) {
    return;
  }
  const zoom = djiZoomLevel();
  const pointer = scalePointerEvent(event);
  djiDragState = {
    startX: pointer.x,
    startY: pointer.y,
    startCenter: lngLatToWorldPixel(mapCenter, zoom),
    zoom,
    moved: false,
  };
  fieldMap.classList.add("dragging-map");
  event.preventDefault();
}

function handleDjiPointerMove(event) {
  if (!djiDragState || mapMode !== "dji") {
    return;
  }
  const pointer = scalePointerEvent(event);
  const dx = pointer.x - djiDragState.startX;
  const dy = pointer.y - djiDragState.startY;
  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
    djiDragState.moved = true;
  }
  mapCenter = worldPixelToLngLat(
    djiDragState.startCenter.x - dx,
    djiDragState.startCenter.y - dy,
    djiDragState.zoom,
  );
  renderOfflineMap();
  event.preventDefault();
}

function handleDjiPointerUp() {
  if (!djiDragState) {
    return;
  }
  fieldMap.classList.remove("dragging-map");
  djiDragState = null;
}

function createRoute(points, color) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  const screenPoints = points
    .map(pointToOfflineScreen)
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  line.setAttribute("points", screenPoints);
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", String(5 * routeScale()));
  line.setAttribute("stroke-linecap", "round");
  line.setAttribute("stroke-linejoin", "round");
  line.setAttribute("stroke-dasharray", "14 12");
  return line;
}

function createOfflineMissionRoute() {
  if (missionRoutePoints.length < 2) {
    return null;
  }
  const line = createRoute(missionRoutePoints, "#ff8a00");
  line.setAttribute("class", "mission-route-line");
  line.setAttribute("stroke-width", String(3.5 * routeScale()));
  line.removeAttribute("stroke-dasharray");
  return line;
}

function renderOfflineMap() {
  if (!overlay || !["offline", "dji"].includes(mapMode)) {
    return;
  }

  mapFallback.hidden = true;
  overlay.innerHTML = "";
  if (mapMode === "dji") {
    renderDjiTiles();
    renderDjiHeatTiles();
  } else {
    offlineBase.style.transform = `scale(${offlineScale()})`;
  }

  const width = fieldMap.clientWidth;
  const height = fieldMap.clientHeight;
  const routeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  routeSvg.setAttribute("width", width);
  routeSvg.setAttribute("height", height);
  routeSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const boundary = createOfflineBoundaryPolygon();
  if (boundary) {
    routeSvg.appendChild(boundary);
  }
  const missionRoute = createOfflineMissionRoute();
  if (missionRoute) {
    routeSvg.appendChild(missionRoute);
  }
  routeSvg.appendChild(createRoute(displayDronePath(), "#2f80ed"));
  overlay.appendChild(routeSvg);

  if (mapMode !== "dji") {
    if (isCaptureHeatVisible()) {
      captureImages
        .filter((item) => item.type !== "ground")
        .forEach((item, index) => overlay.appendChild(createHeatPoint(item, index)));
    }
  }
  if (isCaptureDataVisible()) {
    groupCaptureImages().forEach((group) => overlay.appendChild(createImagePoint(group)));
  }

  taskBoundary.forEach((item, index) => {
    const point = createMarker("boundary-point", String(index + 1), item);
    overlay.appendChild(point);
  });

  const droneMarker = createDroneMapMarker(currentDronePoint);
  droneMarker.style.setProperty("--marker-scale", markerScale());
  overlay.appendChild(droneMarker);
}

function renderDjiTileSet({ pane, elements, tileUrl, tileFallbackUrl, className = "" }) {
  const width = fieldMap.clientWidth;
  const height = fieldMap.clientHeight;
  const zoom = djiZoomLevel();
  const center = lngLatToWorldPixel(mapCenter, zoom);
  const topLeft = {
    x: center.x - width / 2,
    y: center.y - height / 2,
  };
  const startX = Math.floor(topLeft.x / 256);
  const endX = Math.floor((topLeft.x + width) / 256);
  const startY = Math.floor(topLeft.y / 256);
  const endY = Math.floor((topLeft.y + height) / 256);
  const maxTile = 2 ** zoom;
  const visibleKeys = new Set();

  for (let x = startX; x <= endX; x += 1) {
    for (let y = startY; y <= endY; y += 1) {
      if (y < 0 || y >= maxTile) {
        continue;
      }
      const wrappedX = ((x % maxTile) + maxTile) % maxTile;
      const key = `${tileUrl}|${zoom}/${wrappedX}/${y}`;
      visibleKeys.add(key);

      let img = elements.get(key);
      if (!img) {
        img = document.createElement("img");
        img.alt = "";
        img.className = className;
        img.draggable = false;
        img.decoding = "async";
        img.loading = "eager";
        img.src = tileUrl
          .replace("{z}", zoom)
          .replace("{x}", wrappedX)
          .replace("{y}", y);
        img.onerror = () => {
          if (tileFallbackUrl && !img.dataset.fallbackLoaded) {
            img.dataset.fallbackLoaded = "true";
            img.src = tileFallbackUrl
              .replace("{z}", zoom)
              .replace("{x}", wrappedX)
              .replace("{y}", y);
            return;
          }
          img.hidden = true;
        };
        elements.set(key, img);
        pane.appendChild(img);
      }

      img.hidden = false;
      img.style.left = `${x * 256 - topLeft.x}px`;
      img.style.top = `${y * 256 - topLeft.y}px`;
    }
  }

  elements.forEach((img, key) => {
    if (visibleKeys.has(key)) {
      return;
    }
    img.remove();
    elements.delete(key);
  });
}

function renderDjiTiles() {
  renderDjiTileSet({
    pane: ensureDjiTilePane(),
    elements: djiTileElements,
    tileUrl: djiModelMap.tileUrl,
    tileFallbackUrl: djiModelMap.tileFallbackUrl,
  });
}

function renderDjiHeatTiles() {
  const pane = ensureDjiHeatTilePane();
  if (!isCaptureHeatVisible()) {
    pane.hidden = true;
    pane.style.clipPath = "";
    return;
  }

  const layerName = djiModelMap.heatTileLayers[activeHeatLayer] || "OSAVI";
  const tileUrl = `${djiModelMap.heatTileRoot}/${layerName}/{z}/{x}/{y}.webp`;
  renderDjiTileSet({
    pane,
    elements: djiHeatTileElements,
    tileUrl,
    tileFallbackUrl: null,
    className: "dji-heat-tile",
  });
  updateDjiHeatClip();
}

function updateDjiHeatClip() {
  if (!djiHeatTilePane || mapMode !== "dji") {
    return;
  }

  if (!isCaptureHeatVisible() || taskBoundary.length < 3) {
    djiHeatTilePane.style.clipPath = "";
    djiHeatTilePane.hidden = true;
    return;
  }

  const width = fieldMap.clientWidth || 1;
  const height = fieldMap.clientHeight || 1;
  const polygon = taskBoundary
    .map(pointToDjiScreen)
    .map(({ x, y }) => `${(x / width) * 100}% ${(y / height) * 100}%`)
    .join(", ");

  djiHeatTilePane.hidden = false;
  djiHeatTilePane.style.clipPath = `polygon(${polygon})`;
}

function clearAmapLayers() {
  if (!amap || !amapLayers.length) {
    return;
  }
  amap.remove(amapLayers);
  amapLayers = [];
}

function renderAmap(options = {}) {
  if (!amap || mapMode !== "amap") {
    return;
  }

  clearAmapLayers();
  if (options.recenter !== false) {
    amap.setZoomAndCenter(mapZoom, toAmapPosition(mapCenter), false, 500);
  }

  renderAmapOverlays();

  amap.add(amapLayers);
}

function renderMap() {
  if (mapMode === "amap") {
    renderAmap();
  } else if (mapMode === "dji") {
    renderOfflineMap();
  } else {
    renderOfflineMap();
  }
}

function refreshMapOverlays() {
  heatTileSizeCache = null;
  if (mapMode === "amap") {
    renderAmap({ recenter: false });
  } else if (mapMode === "dji") {
    renderOfflineMap();
  } else {
    renderOfflineMap();
  }
}

function syncMapViewFromAmap() {
  if (!amap || mapMode !== "amap") {
    return;
  }

  const center = amap.getCenter();
  mapCenter = amapPositionToWgs84([center.lng, center.lat]);
  mapZoom = amap.getZoom();
}

function updateHeatLegend() {
  const layer = heatLayers[activeHeatLayer];
  heatLegendTitle.textContent = layer.label;
  heatMinLabel.textContent = layer.min;
  heatMaxLabel.textContent = layer.max;
}

function setMapZoom(nextZoom) {
  mapZoom = clamp(nextZoom, minZoom, maxZoom);
  if (mapMode === "amap" && amap) {
    amap.setZoom(mapZoom);
  } else if (mapMode === "dji") {
    renderOfflineMap();
  } else {
    refreshMapOverlays();
  }
}

function loadAmapSdk() {
  const ak = appConfig.AMAP_KEY;
  if (!ak) {
    return Promise.reject(new Error("AMAP_KEY is empty"));
  }
  if (appConfig.AMAP_SECURITY_CODE) {
    window._AMapSecurityConfig = {
      securityJsCode: appConfig.AMAP_SECURITY_CODE,
    };
  }
  if (window.AMap) {
    return Promise.resolve(window.AMap);
  }
  return new Promise((resolve, reject) => {
    const callback = `initAmap_${Date.now()}`;
    const timeout = window.setTimeout(() => reject(new Error("AMap SDK timeout")), 8000);
    window[callback] = () => {
      window.clearTimeout(timeout);
      delete window[callback];
      resolve(window.AMap);
    };
    const script = document.createElement("script");
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(ak)}&callback=${callback}`;
    script.onerror = () => {
      window.clearTimeout(timeout);
      delete window[callback];
      reject(new Error("AMap SDK failed"));
    };
    document.head.appendChild(script);
  });
}

function useOfflineMap() {
  mapMode = "offline";
  fieldMap.classList.remove("amap-mode");
  fieldMap.classList.add("offline-mode");
  offlineBase.hidden = false;
  overlay.hidden = false;
  if (amapHeatOverlay) {
    amapHeatOverlay.hidden = true;
  }
  if (amapCanvasOverlay) {
    amapCanvasOverlay.hidden = true;
  }
  if (amapRouteOverlay) {
    amapRouteOverlay.hidden = true;
  }
  if (amapPointOverlay) {
    amapPointOverlay.hidden = true;
  }
  if (djiTilePane) {
    djiTilePane.hidden = true;
  }
  if (djiHeatTilePane) {
    djiHeatTilePane.hidden = true;
  }
  mapFallback.hidden = true;
  renderOfflineMap();
}

function useDjiMap() {
  mapMode = "dji";
  fieldMap.classList.remove("amap-mode", "offline-mode");
  fieldMap.classList.add("dji-mode");
  offlineBase.hidden = true;
  overlay.hidden = false;
  ensureDjiTilePane().hidden = false;
  ensureDjiHeatTilePane().hidden = false;
  if (amapHeatOverlay) {
    amapHeatOverlay.hidden = true;
  }
  if (amapCanvasOverlay) {
    amapCanvasOverlay.hidden = true;
  }
  if (amapRouteOverlay) {
    amapRouteOverlay.hidden = true;
  }
  if (amapPointOverlay) {
    amapPointOverlay.hidden = true;
  }
  mapFallback.hidden = true;
  renderOfflineMap();
}

function createDjiModelTileLayer() {
  return new AMap.TileLayer({
    tileSize: 256,
    zIndex: 2,
    opacity: 1,
    getTileUrl(x, y, z) {
      return djiModelMap.tileUrl
        .replace("{z}", z)
        .replace("{x}", x)
        .replace("{y}", y);
    },
  });
}

function initAmap() {
  fieldMap.classList.add("amap-mode");
  fieldMap.classList.remove("offline-mode");
  mapMode = "amap";
  offlineBase.hidden = true;
  overlay.hidden = true;
  if (djiTilePane) {
    djiTilePane.hidden = true;
  }
  if (djiHeatTilePane) {
    djiHeatTilePane.hidden = true;
  }
  amap = new AMap.Map("fieldMap", {
    center: toAmapPosition(mapCenter),
    zoom: mapZoom,
    zooms: [minZoom, maxZoom],
    viewMode: "2D",
    doubleClickZoom: false,
    layers: useDjiModelMap
      ? [createDjiModelTileLayer()]
      : [
          new AMap.TileLayer.Satellite(),
          new AMap.TileLayer.RoadNet(),
        ],
  });
  if (typeof amap.setStatus === "function") {
    amap.setStatus({ doubleClickZoom: false });
  }
  ensureAmapHeatOverlay().hidden = false;
  ensureAmapCanvasOverlay().hidden = false;
  ensureAmapRouteOverlay().hidden = false;
  ensureAmapPointOverlay().hidden = false;
  amap.on("mapmove", () => scheduleAmapRealtimeOverlayRender());
  amap.on("zoomchange", () => scheduleAmapRealtimeOverlayRender({ resetHeatSize: true }));
  amap.on("moveend", () => {
    syncMapViewFromAmap();
    scheduleAmapOverlayRender(80);
  });
  amap.on("zoomend", () => {
    syncMapViewFromAmap();
    heatTileSizeCache = null;
    scheduleAmapOverlayRender(80);
  });
  amap.on("resize", () => {
    syncMapViewFromAmap();
    heatTileSizeCache = null;
    scheduleAmapOverlayRender(80);
  });
  mapFallback.hidden = true;
  renderAmap();
}

function initMap() {
  offlineBase = document.createElement("div");
  overlay = document.createElement("div");
  offlineBase.className = "offline-map";
  overlay.className = "map-overlay";
  fieldMap.prepend(overlay);
  fieldMap.prepend(offlineBase);

  if (useDjiModelMap) {
    useDjiMap();
    return;
  }

  loadAmapSdk()
    .then(initAmap)
    .catch(useOfflineMap);
}

function openViewer(src, alt) {
  currentViewerImage = { src, title: alt || "采集图像" };
  viewerImage.src = src;
  viewerImage.alt = alt;
  imageViewer.classList.add("open");
  imageViewer.setAttribute("aria-hidden", "false");
}

function closeViewer() {
  imageViewer.classList.remove("open");
  imageViewer.setAttribute("aria-hidden", "true");
  viewerImage.removeAttribute("src");
  currentViewerImage = null;
}

function exportCurrentImage() {
  if (!currentViewerImage) {
    return;
  }

  const link = document.createElement("a");
  const fileExt = currentViewerImage.src.split("?")[0].split(".").pop() || "jpg";
  const safeTitle = currentViewerImage.title.replace(/[\\/:*?"<>|]+/g, "_").trim() || "capture-image";
  link.href = currentViewerImage.src;
  link.download = `${safeTitle}.${fileExt}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${path} ${response.status}`);
  }
  return response.json();
}

async function postJson(path, payload = {}) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`${path} ${response.status}`);
  }
  return response.json();
}

function generateLocalCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 4; index += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  window.sessionStorage.setItem(LOCAL_CAPTCHA_KEY, code);
  captchaRefresh.textContent = code;
  loginCaptcha.value = "";
}

async function refreshCaptcha() {
  loginError.textContent = "";
  if (window.location.protocol === "file:") {
    generateLocalCaptcha();
    return;
  }
  try {
    const data = await fetchJson("/api/auth/captcha");
    captchaRefresh.textContent = data.code;
    captchaRefresh.dataset.token = data.token;
    loginCaptcha.value = "";
  } catch (error) {
    captchaRefresh.textContent = "重试";
    captchaRefresh.dataset.token = "";
  }
}

async function saveMissionToApi(task) {
  const response = await fetch("/api/missions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      missionCode: task.id,
      fieldName: task.name,
      status: task.boundary.length >= 3 ? "planned" : "pending",
    }),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

async function updateMissionNameToApi(task) {
  const response = await fetch(`/api/missions/${encodeURIComponent(task.id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fieldName: task.name,
      status: task.boundary.length >= 3 ? "planned" : "pending",
    }),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

async function deleteMissionFromApi(taskId) {
  const response = await fetch(`/api/missions/${encodeURIComponent(taskId)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

async function loadMissionsFromApi() {
  try {
    const rows = await fetchJson("/api/missions");
    Object.keys(tasks).forEach((id) => {
      delete tasks[id];
    });
    if (Array.isArray(rows)) {
      rows.forEach((row) => {
        const boundary = Array.isArray(row.boundary) ? row.boundary : [];
        const planned = Array.isArray(row.plannedPoints) ? row.plannedPoints : [];
        upsertTask({
          id: row.missionCode,
          name: cleanMissionName(row.fieldName, row.missionCode),
          area: Number(row.areaMu) || (boundary.length >= 3 ? polygonAreaMu(boundary) : 0),
          sampleBase: Number(row.plannedShotCount) || planned.length,
          completed: 0,
          plannedShotCount: Number(row.plannedShotCount) || planned.length,
          completedShotCount: 0,
          boundary,
        });
      });
    }
    activeTaskId = taskIds()[0] || "";
    renderTaskOptions();
    if (activeTaskId) {
      taskSelect.value = activeTaskId;
    }
    return true;
  } catch (error) {
    console.info("Mission list unavailable", error);
    tasks = {};
    activeTaskId = "";
    renderTaskOptions();
    return false;
  }
}

async function saveMissionAreaToApi() {
  try {
    const response = await fetch(`/api/missions/${encodeURIComponent(activeTaskId)}/area`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        areaMu: polygonAreaMu(taskBoundary),
        confirmed: isAreaConfirmed,
        boundary: taskBoundary,
        plannedPoints,
        plannedShotCount: missionPlannedShotCount(tasks[activeTaskId]),
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return true;
  } catch (error) {
    console.info("Using local mission area state", error);
    return false;
  }
}

async function loadMissionAreaFromApi(taskId) {
  try {
    const data = await fetchJson(`/api/missions/${encodeURIComponent(taskId)}/area`);
    taskBoundary = Array.isArray(data.boundary) ? data.boundary : [];
    plannedPoints = Array.isArray(data.plannedPoints) ? data.plannedPoints : [];
    isAreaConfirmed = Boolean(data.confirmed);
    if (Number.isFinite(Number(data.areaMu))) {
      tasks[taskId].area = Number(data.areaMu);
      fieldAreaInput.value = Number(data.areaMu).toFixed(1);
    }
    tasks[taskId].boundary = [...taskBoundary];
    tasks[taskId].sampleBase = Number(data.plannedShotCount) || plannedPoints.length;
    tasks[taskId].plannedShotCount = Number(data.plannedShotCount) || tasks[taskId].sampleBase;
    if (taskBoundary.length < 3) {
      plannedPoints = [];
      tasks[taskId].sampleBase = 0;
      tasks[taskId].plannedShotCount = 0;
    }
    updateTaskLabels(tasks[taskId]);
    updateYieldByArea();
    await loadYieldResultFromApi(taskId);
    updateAreaDrawStatus();
    refreshMapOverlays();
    return true;
  } catch (error) {
    console.info("Mission area unavailable", error);
    taskBoundary = [];
    plannedPoints = [];
    isAreaConfirmed = false;
    updateAreaDrawStatus();
    refreshMapOverlays();
    return false;
  }
}

function normalizeCaptureImages(images, taskId) {
  return enrichCaptureMetrics(images
    .filter((item) => item.type !== "ground" && Array.isArray(item.point) && item.point.length === 2 && item.src)
    .map((item) => ({
      id: item.id,
      type: "uav",
      title: item.title || "采集图像",
      src: item.src,
      point: [Number(item.point[0]), Number(item.point[1])],
      missionCode: item.missionCode || taskId,
      metrics: item.metrics || null,
    })));
}

function fallbackCaptureImages(taskId = activeTaskId) {
  return [];
}

function getCaptureImagesSignature(images) {
  return images
    .map((item) => [
      item.id || "",
      item.type,
      item.missionCode || "",
      item.title,
      item.src,
      item.metrics?.yieldPerMu || "",
      item.metrics?.panicleDensity || "",
      item.metrics?.panicleCoverage || "",
      item.metrics?.plantHeight || "",
      item.metrics?.grainCount || "",
      item.metrics?.grainVolume || "",
      Number(item.point?.[0]).toFixed(7),
      Number(item.point?.[1]).toFixed(7),
    ].join("|"))
    .sort()
    .join(";");
}

async function updateCaptureImageMissionToApi(imageId, missionCode) {
  const response = await fetch(`/api/capture-images/${encodeURIComponent(imageId)}/mission`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ missionCode }),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

async function updateCaptureImagesMissionBatchToApi(imageIds, missionCode) {
  const response = await fetch("/api/capture-image-batches/mission", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageIds, missionCode }),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

async function deleteCaptureImageFromApi(imageId) {
  const response = await fetch(`/api/capture-images/${encodeURIComponent(imageId)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

async function deleteCaptureImagesBatchFromApi(imageIds) {
  const response = await fetch("/api/capture-image-batches/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageIds }),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

async function loadYieldResultFromApi(taskId = activeTaskId) {
  try {
    const rows = await fetchJson(`/api/yield-results?mission_code=${encodeURIComponent(taskId)}`);
    activeYieldResult = Array.isArray(rows) && rows.length ? rows[0] : null;
    if (activeYieldResult?.missionCode === taskId && tasks[taskId]) {
      const planned = Number(activeYieldResult.plannedShotCount);
      const completed = Number(activeYieldResult.completedShotCount);
      if (Number.isFinite(planned) && planned > 0) {
        tasks[taskId].sampleBase = Math.round(planned);
        tasks[taskId].plannedShotCount = Math.round(planned);
      }
      if (!isMissionExecuting(taskId) && Number.isFinite(completed) && completed >= 0) {
        tasks[taskId].completed = Math.round(completed);
        tasks[taskId].completedShotCount = Math.round(completed);
      }
      saveMissionProgressToStorage(taskId, tasks[taskId]);
      updateCollectionPointKpi(tasks[taskId]);
    }
    updateYieldCards();
    return true;
  } catch (error) {
    console.info("Using local yield result calculation", error);
    activeYieldResult = null;
    updateYieldCards();
    updateCollectionPointKpi(tasks[taskId]);
    return false;
  }
}

async function moveCaptureGroupToMission(group, missionCode) {
  const imagesWithId = group.images.filter((image) => image.id);
  if (!imagesWithId.length) {
    group.images.forEach((image) => {
      image.missionCode = missionCode;
    });
    captureImages = captureImages.filter((image) => image.missionCode === activeTaskId);
    captureImagesSignature = getCaptureImagesSignature(captureImages);
    imagePointGroupsSignature = "";
    imagePointGroups = [];
    refreshMapOverlays();
    updateYieldCards();
    return false;
  }
  try {
    await Promise.all(imagesWithId.map((image) => updateCaptureImageMissionToApi(image.id, missionCode)));
    captureImages = captureImages.filter((image) => {
      if (!group.images.some((groupImage) => groupImage === image || groupImage.id === image.id)) {
        return true;
      }
      image.missionCode = missionCode;
      return missionCode === activeTaskId;
    });
    captureImagesSignature = getCaptureImagesSignature(captureImages);
    imagePointGroupsSignature = "";
    imagePointGroups = [];
    await loadCaptureImagesFromApi(activeTaskId);
    return true;
  } catch (error) {
    console.info("Capture image mission update API unavailable", error);
    group.images.forEach((image) => {
      image.missionCode = missionCode;
    });
    captureImages = captureImages.filter((image) => image.missionCode === activeTaskId);
    captureImagesSignature = getCaptureImagesSignature(captureImages);
    imagePointGroupsSignature = "";
    imagePointGroups = [];
    refreshMapOverlays();
    updateYieldCards();
    return false;
  }
}

async function deleteCaptureGroup(group) {
  const imagesWithId = group.images.filter((image) => image.id);
  if (!imagesWithId.length) {
    captureImages = captureImages.filter((image) => !group.images.includes(image));
    captureImagesSignature = getCaptureImagesSignature(captureImages);
    imagePointGroupsSignature = "";
    imagePointGroups = [];
    refreshMapOverlays();
    updateYieldCards();
    return false;
  }
  try {
    await Promise.all(imagesWithId.map((image) => deleteCaptureImageFromApi(image.id)));
    captureImages = captureImages.filter((image) => !group.images.some((groupImage) => groupImage === image || groupImage.id === image.id));
    captureImagesSignature = getCaptureImagesSignature(captureImages);
    imagePointGroupsSignature = "";
    imagePointGroups = [];
    await loadCaptureImagesFromApi(activeTaskId);
    return true;
  } catch (error) {
    console.info("Capture image delete API unavailable", error);
    captureImages = captureImages.filter((image) => !group.images.includes(image));
    captureImagesSignature = getCaptureImagesSignature(captureImages);
    imagePointGroupsSignature = "";
    imagePointGroups = [];
    refreshMapOverlays();
    updateYieldCards();
    return false;
  }
}

async function moveSelectedCaptureGroupsToMission() {
  const missionCode = batchMissionSelect?.value || activeTaskId;
  const groups = selectedCaptureGroups();
  const imageIds = selectedCaptureImageIds();
  if (!groups.length || !missionCode) {
    return;
  }

  batchMoveButton.textContent = "正在保存";
  try {
    if (imageIds.length) {
      await updateCaptureImagesMissionBatchToApi(imageIds, missionCode);
    }
    selectedCaptureGroupKeys.clear();
    await loadCaptureImagesFromApi(activeTaskId);
    await loadYieldResultFromApi(activeTaskId);
    updateBatchManageControls("批量更改已保存到数据库");
  } catch (error) {
    console.info("Batch capture image mission update API unavailable", error);
    groups.flatMap((group) => group.images).forEach((image) => {
      image.missionCode = missionCode;
    });
    captureImages = captureImages.filter((image) => image.missionCode === activeTaskId);
    selectedCaptureGroupKeys.clear();
    captureImagesSignature = getCaptureImagesSignature(captureImages);
    imagePointGroupsSignature = "";
    imagePointGroups = [];
    refreshMapOverlays();
    updateYieldCards();
    updateBatchManageControls("接口不可用，已在本地临时更改");
  } finally {
    batchMoveButton.textContent = "批量更改任务";
  }
}

async function deleteSelectedCaptureGroups() {
  const groups = selectedCaptureGroups();
  const imageIds = selectedCaptureImageIds();
  if (!groups.length) {
    return;
  }
  const imageCount = groups.reduce((sum, group) => sum + group.images.length, 0);
  const confirmed = window.confirm(`确认删除已选择的 ${groups.length} 个采集点、共 ${imageCount} 张图像吗？`);
  if (!confirmed) {
    return;
  }

  batchDeleteButton.textContent = "正在删除";
  try {
    if (imageIds.length) {
      await deleteCaptureImagesBatchFromApi(imageIds);
    }
    selectedCaptureGroupKeys.clear();
    await loadCaptureImagesFromApi(activeTaskId);
    await loadYieldResultFromApi(activeTaskId);
    updateBatchManageControls("批量删除已保存到数据库");
  } catch (error) {
    console.info("Batch capture image delete API unavailable", error);
    const selectedImages = new Set(groups.flatMap((group) => group.images));
    captureImages = captureImages.filter((image) => !selectedImages.has(image));
    selectedCaptureGroupKeys.clear();
    captureImagesSignature = getCaptureImagesSignature(captureImages);
    imagePointGroupsSignature = "";
    imagePointGroups = [];
    refreshMapOverlays();
    updateYieldCards();
    updateBatchManageControls("接口不可用，已在本地临时删除");
  } finally {
    batchDeleteButton.textContent = "批量删除";
  }
}

async function loadCaptureImagesFromApi(taskId = activeTaskId) {
  try {
    const images = await fetchJson(`/api/capture-images?mission_code=${encodeURIComponent(taskId)}`);
    captureImages = projectCaptureImagesToMissionPoints(normalizeCaptureImages(images, taskId), taskId);
    captureImagesSignature = getCaptureImagesSignature(captureImages);
    imagePointGroupsSignature = "";
    imagePointGroups = [];
    await loadYieldResultFromApi(taskId);
    applyCapturePointProgressFallback(taskId);
    updateCollectionPointKpi(tasks[taskId]);
    refreshMapOverlays();
  } catch (error) {
    console.info("Capture images unavailable", error);
    captureImages = [];
    captureImagesSignature = getCaptureImagesSignature(captureImages);
    imagePointGroupsSignature = "";
    imagePointGroups = [];
    await loadYieldResultFromApi(taskId);
    updateCollectionPointKpi(tasks[taskId]);
    refreshMapOverlays();
  }
}

async function pollCaptureImages() {
  if (captureImagesPollInFlight) {
    return;
  }

  const taskId = activeTaskId;
  captureImagesPollInFlight = true;
  try {
    const images = await fetchJson(`/api/capture-images?mission_code=${encodeURIComponent(taskId)}`);
    if (taskId !== activeTaskId) {
      return;
    }

    const nextImages = projectCaptureImagesToMissionPoints(normalizeCaptureImages(images, taskId), taskId);
    const nextSignature = getCaptureImagesSignature(nextImages);
    if (nextSignature !== captureImagesSignature) {
      captureImages = nextImages;
      captureImagesSignature = nextSignature;
      imagePointGroupsSignature = "";
      imagePointGroups = [];
      await loadYieldResultFromApi(taskId);
      applyCapturePointProgressFallback(taskId);
      updateCollectionPointKpi(tasks[taskId]);
      refreshMapOverlays();
    }
  } catch (error) {
    console.info("Capture image polling skipped", error);
  } finally {
    captureImagesPollInFlight = false;
  }
}

async function loadDronePathFromApi() {
  try {
    const rows = await fetchJson(`/api/telemetry/path?device_code=${encodeURIComponent(activeDroneDeviceCode())}&limit=300`);
    if (!Array.isArray(rows)) {
      return false;
    }
    const points = rows
      .map((row) => [Number(row.lng), Number(row.lat)])
      .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));
    if (points.length) {
      liveDronePath = points;
      currentDronePoint = points[points.length - 1];
      return true;
    }
  } catch (error) {
    console.info("Telemetry path API unavailable", error);
  }
  return false;
}

async function loadTelemetryFromApi() {
  try {
    const pathLoaded = await loadDronePathFromApi();
    const rows = await fetchJson("/api/telemetry/latest");
    if (!Array.isArray(rows)) {
      return false;
    }

    let hasUavTelemetry = false;
    rows.forEach((row) => {
      if (row.device_type !== "uav") {
        return;
      }
      hasUavTelemetry = true;
      if (!pathLoaded && Number.isFinite(Number(row.last_lng)) && Number.isFinite(Number(row.last_lat))) {
        currentDronePoint = [Number(row.last_lng), Number(row.last_lat)];
        liveDronePath = [...displayDronePath().slice(-299), currentDronePoint];
      }
      updateDroneTelemetryDisplay(row);
      if (row.battery_level !== null && row.battery_level !== undefined) {
        updateDroneBattery(row.battery_level);
      }
    });

    refreshMapOverlays();
    if (!hasUavTelemetry) {
      updateDroneModel(null, null, null);
    }
    return hasUavTelemetry;
  } catch (error) {
    console.info("Telemetry unavailable", error);
    return false;
  }
}

function updateTelemetry() {}

function updateYieldByArea() {
  updateYieldCards();
}

function updateTaskLabels(task) {
  currentTaskLabel.textContent = `当前任务：${task.name}`;
  updateAreaTaskLabel(taskBoundary.length >= 3 ? "区域自动计算" : "等待区域计算");
  updateCollectionPointKpi(task);
}

function formatNumber(value, digits = 1) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(digits) : "--";
}

function formatTaskMinutes(value) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "0.0 分钟";
  }
  return `${minutes.toFixed(1)} 分钟`;
}

function modeText(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (!normalized) {
    return "等待数据";
  }
  if (normalized.includes("RTL") || normalized.includes("RETURN")) {
    return "返航";
  }
  if (normalized.includes("MISSION") || normalized.includes("OFFBOARD")) {
    return "自动";
  }
  if (
    [
      "MANUAL",
      "STABILIZED",
      "POSCTL",
      "ALTCTL",
      "LOITER",
      "HOLD",
      "BRAKE",
      "LAND",
      "TAKEOFF",
      "GUIDED",
    ].some((item) => normalized.includes(item))
  ) {
    return "手动";
  }
  if (normalized.startsWith("AUTO")) {
    return "手动";
  }
  return value;
}

function linkModeText(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (!normalized) {
    return "--";
  }
  if (["4G", "LTE", "CELLULAR", "MOBILE"].some((item) => normalized.includes(item))) {
    return "4G";
  }
  if (["DATA", "RADIO", "SIYI", "数传"].some((item) => normalized.includes(item))) {
    return "数传";
  }
  return value;
}

function positioningQualityText(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (!normalized) {
    return "--";
  }
  if (normalized.includes("RTK") || normalized.includes("FIXED") || normalized.includes("FLOAT")) {
    return normalized.includes("FLOAT") ? "RTK Float" : "RTK";
  }
  if (normalized.includes("GPS") || normalized.includes("3D") || normalized.includes("FIX")) {
    return "GPS";
  }
  return value;
}

function formatSignalStrength(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "--";
  }
  if (number < 0) {
    return `${number.toFixed(0)} dBm`;
  }
  const percent = number <= 1 ? number * 100 : number;
  return `${Math.max(0, Math.min(100, percent)).toFixed(0)}%`;
}

function formatSatelliteCount(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${Math.max(0, Math.round(number))} 颗` : "-- 颗";
}

function formatTelemetry(value, unit, digits = 2) {
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(digits)} ${unit}` : `-- ${unit}`;
}

function vectorMagnitude(x, y, z) {
  const values = [x, y, z].map(Number);
  if (!values.every(Number.isFinite)) {
    return null;
  }
  return Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
}

function updateDroneModel(roll = null, pitch = null, yaw = null, flightMode = null) {
  const values = [roll, pitch, yaw].map(Number);
  const hasAttitude = values.every(Number.isFinite);
  const displayMode = modeText(flightMode);
  if (lastDroneAttitudeMode !== displayMode) {
    droneAttitudeBaseline = null;
    lastDroneAttitudeMode = displayMode;
  }
  if (hasAttitude && !droneAttitudeBaseline) {
    droneAttitudeBaseline = {
      roll: values[0],
      pitch: values[1],
      yaw: values[2],
    };
  }
  if (!hasAttitude) {
    droneAttitudeBaseline = null;
  }
  const [rawRoll, rawPitch, rawYaw] = hasAttitude ? values : [0, 0, 0];
  const safeRoll = hasAttitude ? rawRoll - droneAttitudeBaseline.roll : 0;
  const safePitch = hasAttitude ? rawPitch - droneAttitudeBaseline.pitch : 0;
  const safeYaw = hasAttitude ? rawYaw - droneAttitudeBaseline.yaw : 0;
  const levelDeadband = 5;
  const visualRoll = Math.abs(safeRoll) < levelDeadband ? 0 : safeRoll;
  const visualPitch = Math.abs(safePitch) < levelDeadband ? 0 : Math.max(-18, Math.min(18, safePitch));
  const visualYaw = 0;
  const pitchScale = 1 - Math.abs(visualPitch) / 220;
  droneModel.style.transform = `rotate(${visualYaw + visualRoll * 0.18}deg) scaleY(${pitchScale})`;
  droneAttitudeStatus.textContent = hasAttitude
    ? `水平基准已校准 · R ${safeRoll.toFixed(1)}° / P ${safePitch.toFixed(1)}° / Y ${safeYaw.toFixed(1)}°`
    : "等待姿态数据";
}

function updateDroneTelemetryDisplay(data = {}) {
  const vx = data.vx ?? null;
  const vy = data.vy ?? null;
  const vz = data.vz ?? null;
  const speed = Number.isFinite(Number(data.speed)) ? Number(data.speed) : vectorMagnitude(vx, vy, vz);
  const status = modeText(data.flight_mode || data.status);

  droneFlightMode.textContent = status;
  droneModeValue.textContent = status;
  droneLinkMode.textContent = linkModeText(data.link_mode);
  droneSignalStrength.textContent = formatSignalStrength(data.signal_strength);
  dronePositioningQuality.textContent = positioningQualityText(data.positioning_quality);
  droneSatelliteCount.textContent = formatSatelliteCount(data.satellite_count);
  droneAltitude.textContent = formatTelemetry(data.altitude, "m", 1);
  droneVx.textContent = formatTelemetry(vx, "m/s", 2);
  droneVy.textContent = formatTelemetry(vy, "m/s", 2);
  droneVz.textContent = formatTelemetry(vz, "m/s", 2);
  droneAx.textContent = formatTelemetry(data.ax, "m/s²", 2);
  droneAy.textContent = formatTelemetry(data.ay, "m/s²", 2);
  droneAz.textContent = formatTelemetry(data.az, "m/s²", 2);
  updateDroneModel(data.roll, data.pitch, data.yaw, data.flight_mode || data.status);
}

function updateClock() {
  const now = new Date();
  currentTime.textContent = now.toLocaleTimeString("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  currentDate.textContent = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
}

function scalePointerEvent(event) {
  const rect = fieldMap.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / appScale,
    y: (event.clientY - rect.top) / appScale,
  };
}

function updateAppScale() {
  const widthScale = window.innerWidth / DESIGN_WIDTH;
  const heightScale = window.innerHeight / DESIGN_HEIGHT;
  appScale = Math.max(0.72, Math.min(widthScale, heightScale, 1));
  document.documentElement.style.setProperty("--app-scale", String(appScale));
  document.documentElement.style.setProperty("--app-scale-inverse", String(1 / appScale));
}

function loadWeatherLocation() {
  try {
    const saved = JSON.parse(localStorage.getItem(weatherLocationStorageKey) || "null");
    if (saved && Number.isFinite(Number(saved.lng)) && Number.isFinite(Number(saved.lat))) {
      weatherLocation = {
        lng: Number(saved.lng),
        lat: Number(saved.lat),
      };
    }
  } catch (error) {
    console.info("Weather location unavailable", error);
  }
}

function saveWeatherLocation(location) {
  weatherLocation = location;
  localStorage.setItem(weatherLocationStorageKey, JSON.stringify(location));
}

function currentWeatherLocation() {
  if (weatherLocation) {
    return weatherLocation;
  }
  return { lng: mapCenter[0], lat: mapCenter[1] };
}

function setWeatherLocation() {
  const current = currentWeatherLocation();
  const input = window.prompt(
    "请输入天气位置经纬度，格式：经度,纬度",
    `${current.lng.toFixed(6)}, ${current.lat.toFixed(6)}`,
  );
  if (input === null) {
    return;
  }

  const parts = input
    .split(/[,，\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number);
  const [lng, lat] = parts;
  if (!Number.isFinite(lng) || !Number.isFinite(lat) || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    weatherSummary.textContent = "位置格式错误";
    weatherDetail.textContent = "请按 经度,纬度 输入";
    setWeatherIcon("fog");
    return;
  }

  saveWeatherLocation({ lng, lat });
  weatherSummary.textContent = "正在更新";
  weatherDetail.textContent = "更新天气数据";
  setWeatherIcon("cloud");
  loadFieldWeather();
}

async function loadFieldWeather() {
  const { lng, lat } = currentWeatherLocation();
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FShanghai`;
  try {
    const data = await fetchJson(url);
    const current = data.current || {};
    const weatherText = weatherCodeText[current.weather_code] || "实时天气";
    weatherSummary.textContent = weatherText;
    weatherDetail.textContent = `${formatNumber(current.temperature_2m, 1)}℃ · 风 ${formatNumber(current.wind_speed_10m, 1)} km/h · 湿度 ${formatNumber(current.relative_humidity_2m, 0)}%`;
    setWeatherIcon(weatherIconType(current.weather_code));
  } catch (error) {
    console.info("Weather unavailable", error);
    weatherSummary.textContent = "天气不可用";
    weatherDetail.textContent = "网络恢复后自动更新";
    setWeatherIcon("cloud");
  }
}

async function applyTask(taskId) {
  const task = tasks[taskId] || tasks[taskIds()[0]];
  if (!task) {
    activeTaskId = "";
    currentTaskLabel.textContent = "当前任务：暂无任务";
    areaTaskLabel.textContent = "暂无任务 · 等待区域计算";
    fieldAreaInput.value = "";
    plannedPoints = [];
    missionRoutePoints = [];
    taskBoundary = [];
    isAreaConfirmed = false;
    captureImages = [];
    captureImagesSignature = "";
    imagePointGroups = [];
    imagePointGroupsSignature = "";
    updateCollectionPointKpi({ area: 0, plannedShotCount: 0, completedShotCount: 0, id: "" });
    renderTaskOptions();
    renderMap();
    return;
  }
  activeTaskId = task.id;
  selectedCaptureGroupKeys.clear();
  updateBatchManageControls();
  taskSelect.value = task.id;
  taskBoundary = [...(task.boundary || [])];
  isAreaConfirmed = taskBoundary.length >= 3;
  fieldAreaInput.value = Number.isFinite(Number(task.area)) && Number(task.area) > 0 ? Number(task.area).toFixed(1) : "";
  updateTaskLabels(task);
  updateYieldByArea();
  updateAreaDrawStatus();
  renderMap();
  await loadMissionAreaFromApi(task.id);
  await loadCaptureImagesFromApi(task.id);
  refreshMapOverlays();
}

async function createNewTask() {
  const id = nextTaskId();
  const task = upsertTask({
    id,
    name: `${id}`,
    area: 0,
    sampleBase: 0,
    completed: 0,
    boundary: [],
  });

  newTaskButton.textContent = "正在保存";
  try {
    await saveMissionToApi(task);
    newTaskButton.textContent = "已保存";
  } catch (error) {
    console.info("Mission create API unavailable", error);
    newTaskButton.textContent = "本地新建";
  }
  setTimeout(() => {
    newTaskButton.textContent = "新建任务";
  }, 1600);
  await applyTask(id);
}

async function renameActiveTask() {
  const task = tasks[activeTaskId];
  if (!task) {
    return;
  }

  const nextName = window.prompt("请输入新的任务名称", task.name);
  if (!nextName || !nextName.trim()) {
    return;
  }

  task.name = nextName.trim();
  renderTaskOptions();
  updateTaskLabels(task);
  renameTaskButton.textContent = "正在保存";
  try {
    await updateMissionNameToApi(task);
    renameTaskButton.textContent = "已保存";
  } catch (error) {
    console.info("Mission rename API unavailable", error);
    renameTaskButton.textContent = "本地修改";
  }
  setTimeout(() => {
    renameTaskButton.textContent = "修改任务名";
  }, 1600);
}

async function deleteActiveTask() {
  const task = tasks[activeTaskId];
  if (!task || taskIds().length <= 0) {
    window.alert("至少需要保留一个任务");
    return;
  }

  const confirmed = window.confirm(`确认删除任务“${task.name}”吗？删除后该任务的区域、采集点、轨迹和图像记录会从数据库移除。`);
  if (!confirmed) {
    return;
  }

  deleteTaskButton.textContent = "正在删除";
  try {
    await deleteMissionFromApi(task.id);
  } catch (error) {
    console.info("Mission delete API unavailable", error);
  }

  delete tasks[task.id];
  const fallbackTaskId = taskIds()[0] || "";
  activeTaskId = fallbackTaskId;
  renderTaskOptions();
  deleteTaskButton.textContent = "已删除";
  setTimeout(() => {
    deleteTaskButton.textContent = "删除任务";
  }, 1600);
  await applyTask(fallbackTaskId);
}

function startAreaDrawing() {
  isDrawingArea = true;
  isAreaConfirmed = false;
  markCaptureDataUnsynced();
  taskBoundary = [];
  plannedPoints = [];
  tasks[activeTaskId].boundary = [];
  fieldMap.classList.add("drawing-area");
  areaDrawButton.classList.add("active");
  updateAreaDrawStatus();
  renderMap();
}

async function clearTaskArea() {
  isDrawingArea = false;
  isAreaConfirmed = false;
  markCaptureDataUnsynced();
  taskBoundary = [];
  plannedPoints = [];
  missionRoutePoints = [];
  tasks[activeTaskId].sampleBase = 0;
  tasks[activeTaskId].plannedShotCount = 0;
  tasks[activeTaskId].completedShotCount = 0;
  tasks[activeTaskId].completed = 0;
  fieldAreaInput.value = tasks[activeTaskId].area.toFixed(1);
  updateAreaTaskLabel("等待区域计算");
  updateCollectionPointKpi();
  updateYieldByArea();
  fieldMap.classList.remove("drawing-area");
  areaDrawButton.classList.remove("active");
  updateAreaDrawStatus();
  renderMap();
  await saveMissionAreaToApi();
}

async function confirmTaskArea() {
  if (taskBoundary.length < 3) {
    return;
  }

  isDrawingArea = false;
  isAreaConfirmed = true;
  markCaptureDataUnsynced();
  fieldMap.classList.remove("drawing-area");
  areaDrawButton.classList.remove("active");
  planCollectionPoints();
  updateAreaDrawStatus();
  renderMap();
  const saved = await saveMissionAreaToApi();
  const syncHint = "，点击同步采集数据后显示热力图和采集点";
  areaDrawStatus.textContent = saved
    ? `已保存任务区域到数据库：${plannedPoints.length} 个采集点，面积 ${polygonAreaMu(taskBoundary).toFixed(1)} 亩${syncHint}`
    : `已确认任务区域：${plannedPoints.length} 个采集点，接口不可用时暂存本地${syncHint}`;
}

function addTaskBoundaryPoint(point) {
  if (!isDrawingArea) {
    return;
  }

  taskBoundary.push(point);
  isAreaConfirmed = false;
  markCaptureDataUnsynced();
  if (taskBoundary.length >= 3) {
    planCollectionPoints();
  }
  updateAreaDrawStatus();
  renderMap();
}

function mapClickToPoint(event) {
  const { x, y } = scalePointerEvent(event);
  if (mapMode === "amap" && amap) {
    const lngLat = amap.containerToLngLat(new AMap.Pixel(x, y));
    return amapPositionToWgs84([lngLat.lng, lngLat.lat]);
  }
  return screenToOfflinePoint(x, y);
}

function closeActionFeedback() {
  window.clearTimeout(actionFeedbackTimer);
  actionFeedbackTimer = null;
  const existing = document.querySelector(".action-feedback-overlay");
  if (!existing) {
    return;
  }
  existing.classList.remove("visible");
  window.setTimeout(() => existing.remove(), 180);
}

function showActionFeedback(title, message, type = "success") {
  closeActionFeedback();

  const overlay = document.createElement("div");
  overlay.className = "action-feedback-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  const panel = document.createElement("div");
  panel.className = `action-feedback-panel ${type}`;

  const badge = document.createElement("div");
  badge.className = "action-feedback-badge";
  badge.textContent = type === "warning" ? "!" : "✓";

  const content = document.createElement("div");
  content.className = "action-feedback-content";

  const heading = document.createElement("strong");
  heading.textContent = title;

  const detail = document.createElement("p");
  detail.textContent = message;

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "知道了";
  closeButton.addEventListener("click", closeActionFeedback);

  content.append(heading, detail, closeButton);
  panel.append(badge, content);
  overlay.append(panel);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeActionFeedback();
    }
  });
  document.body.appendChild(overlay);
  window.requestAnimationFrame(() => overlay.classList.add("visible"));
  actionFeedbackTimer = window.setTimeout(closeActionFeedback, 3200);
}

async function generateUavMission() {
  if (!isAreaConfirmed || plannedPoints.length === 0) {
    generateMissionButton.textContent = "请先确认任务区域";
    areaDrawStatus.textContent = "请先设置并确认任务区域，系统才能生成无人机采集任务";
    showActionFeedback(
      "无法生成无人机任务",
      "请先设置并确认任务区域，系统才能生成无人机采集任务。",
      "warning",
    );
    setTimeout(() => {
      generateMissionButton.textContent = "生成无人机任务";
      updateAreaDrawStatus();
    }, 1800);
    return;
  }

  const areaMu = polygonAreaMu(taskBoundary);
  await saveMissionAreaToApi();
  generateMissionButton.textContent = "任务已生成";
  areaDrawStatus.textContent = `已生成无人机任务：${plannedPoints.length} 个采集点，覆盖 ${areaMu.toFixed(1)} 亩，等待无人机执行`;
  showActionFeedback(
    "无人机任务已生成",
    `已生成 ${plannedPoints.length} 个采集点，覆盖 ${areaMu.toFixed(1)} 亩，等待加载到无人机。`,
  );
  setTimeout(() => {
    generateMissionButton.textContent = "生成无人机任务";
  }, 1800);
}

function loadMissionToDrone() {
  const routeCount = missionRoutePoints.length || plannedPoints.length;
  if (!isAreaConfirmed || routeCount === 0) {
    loadMissionButton.textContent = "请先生成任务";
    areaDrawStatus.textContent = "请先确认任务区域并生成无人机任务，再加载到无人机";
    showActionFeedback(
      "无法加载任务",
      "请先确认任务区域并生成无人机任务，再加载到无人机。",
      "warning",
    );
    setTimeout(() => {
      loadMissionButton.textContent = "加载任务到无人机";
      updateAreaDrawStatus();
    }, 1800);
    return;
  }

  const shotCount = missionPlannedShotCount(tasks[activeTaskId]) || routeCount;
  const missionUnit = missionRoutePoints.length ? "航线点" : "采集点";
  loadMissionButton.textContent = "正在加载";
  areaDrawStatus.textContent = `正在将 ${shotCount} 个拍摄点、${routeCount} 个${missionUnit}加载到 ${activeDroneDisplayName()}`;
  showActionFeedback(
    "正在加载任务",
    `正在将 ${shotCount} 个拍摄点、${routeCount} 个${missionUnit}加载到 ${activeDroneDisplayName()}。`,
  );
  setTimeout(() => {
    loadMissionButton.textContent = "已加载到无人机";
    areaDrawStatus.textContent = `任务已加载到 ${activeDroneDisplayName()}：${shotCount} 个拍摄点，${routeCount} 个${missionUnit}`;
    showActionFeedback(
      "任务已加载到无人机",
      `${activeDroneDisplayName()} 已接收当前任务，共 ${shotCount} 个拍摄点、${routeCount} 个${missionUnit}。`,
    );
    setTimeout(() => {
      loadMissionButton.textContent = "加载任务到无人机";
      updateAreaDrawStatus();
    }, 1800);
  }, 900);
}

function executeDroneMission() {
  droneCommandState[activeDroneId] = "mission";
  droneFlightMode.textContent = "自动";
  droneModeValue.textContent = "自动";
  startMissionExecution(activeTaskId);
  if (droneVideoStatus) {
    droneVideoStatus.textContent = "任务执行中";
  }
  areaDrawStatus.textContent = `${activeDroneDisplayName()} 已开始执行当前测产任务`;
  showActionFeedback(
    "执行任务指令已发送",
    `${activeDroneDisplayName()} 已开始执行当前测产任务。`,
  );
}

function returnDroneHome() {
  droneCommandState[activeDroneId] = "return";
  stopMissionExecution();
  droneFlightMode.textContent = "返航";
  droneModeValue.textContent = "返航";
  if (droneVideoStatus) {
    droneVideoStatus.textContent = "返航中";
  }
  areaDrawStatus.textContent = `${activeDroneDisplayName()} 已触发返航指令`;
  showActionFeedback(
    "返航指令已发送",
    `${activeDroneDisplayName()} 已触发返航指令。`,
    "warning",
  );
}

async function refreshTelemetry() {
  const loaded = await loadTelemetryFromApi();
  if (!loaded) {
    updateTelemetry();
  }
}

function parseLiveFrameTimestamp(value) {
  const timestamp = Date.parse(value || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
}

let liveFramePollInFlight = false;

async function refreshLiveFrame() {
  if (!droneLiveFrame || liveFramePollInFlight) {
    return false;
  }
  liveFramePollInFlight = true;
  const deviceCode = activeDroneDeviceCode();
  try {
    const frame = await fetchJson(`/api/live-frame/latest?device_code=${encodeURIComponent(deviceCode)}`);
    const updatedAtMs = parseLiveFrameTimestamp(frame.updatedAt || frame.capturedAt);
    if (!updatedAtMs || Date.now() - updatedAtMs > LIVE_FRAME_STALE_MS) {
      clearLiveFrameStatus();
      return false;
    }
    const src = `/api/live-frame/stream?device_code=${encodeURIComponent(deviceCode)}&fps=${LIVE_FRAME_FPS}`;
    if (liveFrameStreamSrc !== src || droneLiveFrame.getAttribute("src") !== src) {
      droneLiveFrame.src = src;
      liveFrameStreamSrc = src;
    }
    droneLiveFrame.hidden = false;
    droneLiveFrame.closest(".live-view-screen")?.classList.add("has-frame");
    setCurrentDroneConnected(true, "LiveView 在线");
    return true;
  } catch (error) {
    clearLiveFrameStatus();
    return false;
  } finally {
    liveFramePollInFlight = false;
  }
}

syncButton.addEventListener("click", async () => {
  syncButton.disabled = true;
  syncButton.textContent = "正在同步";
  try {
    markCaptureDataSynced(activeTaskId);
    await loadCaptureImagesFromApi(activeTaskId);
    await loadYieldResultFromApi(activeTaskId);
    applyCapturePointProgressFallback(activeTaskId);
    updateTelemetry();
    updateAreaDrawStatus();
    refreshMapOverlays();
    scheduleCaptureHeatVisible(3000, activeTaskId);
    syncButton.textContent = "已同步最新数据";
    showActionFeedback(
      "采集数据已同步",
      "当前任务的无人机采集点已显示。",
    );
  } catch (error) {
    console.info("Capture data sync failed", error);
    markCaptureDataUnsynced(activeTaskId);
    refreshMapOverlays();
    syncButton.textContent = "同步失败";
    showActionFeedback(
      "采集数据同步失败",
      "未能从服务器读取当前任务采集数据，请稍后重试。",
      "warning",
    );
  } finally {
    window.setTimeout(() => {
      syncButton.disabled = false;
      syncButton.textContent = "同步采集数据";
    }, 1600);
  }
});

fieldAreaInput.addEventListener("input", updateYieldByArea);
taskSelect.addEventListener("change", () => applyTask(taskSelect.value));
newTaskButton.addEventListener("click", createNewTask);
renameTaskButton.addEventListener("click", renameActiveTask);
deleteTaskButton.addEventListener("click", deleteActiveTask);
generateMissionButton.addEventListener("click", generateUavMission);
loadMissionButton.addEventListener("click", loadMissionToDrone);
executeMissionButton.addEventListener("click", executeDroneMission);
returnHomeButton.addEventListener("click", returnDroneHome);

viewerClose.addEventListener("click", closeViewer);
viewerExport.addEventListener("click", exportCurrentImage);
imageGroupClose.addEventListener("click", closeImageGroup);

imageViewer.addEventListener("click", (event) => {
  if (event.target === imageViewer) {
    closeViewer();
  }
});

imageGroupViewer.addEventListener("click", (event) => {
  if (event.target === imageGroupViewer) {
    closeImageGroup();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && imageViewer.classList.contains("open")) {
    closeViewer();
  }
  if (event.key === "Escape" && imageGroupViewer.classList.contains("open")) {
    closeImageGroup();
  }
});

window.addEventListener("resize", () => {
  updateAppScale();
  renderMap();
});
fieldMap.addEventListener("mousemove", handleCanvasPointerMove);
fieldMap.addEventListener("mouseleave", () => {
  fieldMap.classList.remove("has-canvas-hit");
  hidePointTooltip();
});
fieldMap.addEventListener("click", handleCanvasClick);
fieldMap.addEventListener("dblclick", preventBatchMapDoubleClick, true);
fieldMap.addEventListener("pointerdown", handleDjiPointerDown);
window.addEventListener("pointermove", handleDjiPointerMove);
window.addEventListener("pointerup", handleDjiPointerUp);

zoomInButton.addEventListener("click", () => setMapZoom(mapZoom + 1));
zoomOutButton.addEventListener("click", () => setMapZoom(mapZoom - 1));

heatmapButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeHeatLayer = button.dataset.layer;
    heatmapButtons.forEach((item) => item.classList.toggle("active", item === button));
    updateHeatLegend();
    refreshMapOverlays();
  });
});

if (droneSelect) {
  droneSelect.addEventListener("change", () => {
    activeDroneId = droneSelect.value;
    updateDroneIdentity();
    updateTelemetry();
    clearLiveFrameStatus();
    void refreshLiveFrame();
  });
}

areaDrawButton.addEventListener("click", startAreaDrawing);
areaConfirmButton.addEventListener("click", confirmTaskArea);
areaClearButton.addEventListener("click", clearTaskArea);
batchManageButton.addEventListener("click", toggleBatchManageCapturePoints);
batchMoveButton.addEventListener("click", moveSelectedCaptureGroupsToMission);
batchDeleteButton.addEventListener("click", deleteSelectedCaptureGroups);
weatherLocationButton.addEventListener("click", setWeatherLocation);

fieldMap.addEventListener("click", (event) => {
  if (!isDrawingArea) {
    return;
  }
  event.preventDefault();
  addTaskBoundaryPoint(mapClickToPoint(event));
});

fieldMap.addEventListener(
  "wheel",
  (event) => {
    if (["offline", "dji"].includes(mapMode)) {
      event.preventDefault();
      setMapZoom(mapZoom + (event.deltaY < 0 ? 1 : -1));
    }
  },
  { passive: false },
);

async function bootstrap() {
  if (appStarted) {
    updateAppScale();
    renderMap();
    return;
  }
  appStarted = true;
  updateAppScale();
  document.title = SYSTEM_TITLE;
  if (pageTitle) {
    pageTitle.textContent = SYSTEM_TITLE;
  }
  initMap();
  updateHeatLegend();
  updateClock();
  renderDroneOptions();
  await loadDevicesFromApi();
  updateDroneBattery(null);
  clearLiveFrameStatus();
  loadWeatherLocation();
  loadFieldWeather();
  clockTimer = setInterval(updateClock, 1000);
  weatherTimer = setInterval(loadFieldWeather, 10 * 60 * 1000);
  await loadMissionsFromApi();
  if (activeTaskId) {
    await applyTask(activeTaskId);
  } else {
    renderTaskOptions();
    updateAreaDrawStatus();
    renderMap();
  }
  refreshTelemetry();
  telemetryTimer = setInterval(refreshTelemetry, 250);
  refreshLiveFrame();
  liveFrameTimer = setInterval(() => {
    void refreshLiveFrame();
  }, 1000);
  capturePollTimer = setInterval(pollCaptureImages, 5000);
}

function showLogin() {
  document.body.classList.remove("authenticated");
  document.body.classList.add("auth-pending");
  loginView.hidden = false;
  appShell.hidden = true;
  loginPassword.value = "";
  refreshCaptcha();
  window.setTimeout(() => loginUsername.focus(), 80);
}

async function showApp() {
  loginView.hidden = true;
  appShell.hidden = false;
  document.body.classList.remove("auth-pending");
  document.body.classList.add("authenticated");
  await bootstrap();
  window.setTimeout(() => renderMap(), 80);
}

async function checkAuthSession() {
  if (window.location.protocol === "file:" && window.sessionStorage.getItem("yield-system-local-auth") === "true") {
    await showApp();
    return;
  }
  try {
    await fetchJson("/api/auth/me");
    await showApp();
  } catch (error) {
    showLogin();
  }
}

async function handleLogin(event) {
  event.preventDefault();
  loginError.textContent = "";
  const submitButton = loginForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "正在登录";
  try {
    if (window.location.protocol === "file:") {
      const expectedCaptcha = window.sessionStorage.getItem(LOCAL_CAPTCHA_KEY) || "";
      if (
        loginUsername.value.trim() !== "admin"
        || loginPassword.value !== "admin"
        || loginCaptcha.value.trim().toUpperCase() !== expectedCaptcha
      ) {
        throw new Error("local auth failed");
      }
      window.sessionStorage.setItem("yield-system-local-auth", "true");
    } else {
      await postJson("/api/auth/login", {
        username: loginUsername.value.trim(),
        password: loginPassword.value,
        captcha: loginCaptcha.value.trim(),
        captchaToken: captchaRefresh.dataset.token || "",
      });
    }
    await showApp();
  } catch (error) {
    loginError.textContent = "用户名、密码或验证码错误";
    refreshCaptcha();
    loginCaptcha.focus();
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "登录系统";
  }
}

async function handleLogout() {
  try {
    if (window.location.protocol === "file:") {
      window.sessionStorage.removeItem("yield-system-local-auth");
    } else {
      await postJson("/api/auth/logout");
    }
  } catch (error) {
    // The local UI should still return to the login screen if the network drops.
  }
  window.location.reload();
}

loginForm.addEventListener("submit", handleLogin);
captchaRefresh.addEventListener("click", refreshCaptcha);
logoutButton.addEventListener("click", handleLogout);
checkAuthSession();

