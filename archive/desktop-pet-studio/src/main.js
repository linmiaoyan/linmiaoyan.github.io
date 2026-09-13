const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen } = require("electron");
const fs = require("fs");
const path = require("path");

const DEFAULT_SETTINGS = {
  petSize: 230,
  opacity: 1,
  alwaysOnTop: true,
  launchAtLogin: false,
  startInBackground: true,
  showControlOnStart: false,
  movementEnabled: true,
  wanderEnabled: true,
  wanderSpeed: 1,
  snapToEdges: false,
  clickThroughWhenIdle: false,
  catchModeEnabled: true,
  action: "idle"
};

let settings = { ...DEFAULT_SETTINGS };
let petWindow;
let controlWindow;
let tray;
let wanderTimer;
let isDragging = false;
let lastWanderActionAt = 0;
let dragOffset;
let dynamicMousePassthrough = false;
let velocity = { x: 1.4, y: 0.8 };

const settingsPath = () => path.join(app.getPath("userData"), "settings.json");
const assetPath = (...parts) => path.join(__dirname, "..", ...parts);

function readSettings() {
  try {
    const saved = JSON.parse(fs.readFileSync(settingsPath(), "utf8"));
    settings = { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    settings = { ...DEFAULT_SETTINGS };
  }
}

function saveSettings() {
  fs.mkdirSync(app.getPath("userData"), { recursive: true });
  fs.writeFileSync(settingsPath(), JSON.stringify(settings, null, 2));
}

function createPetWindow() {
  const { width, height } = petWindowSize(settings.petSize);
  const { workArea } = screen.getPrimaryDisplay();

  petWindow = new BrowserWindow({
    width,
    height,
    x: workArea.x + workArea.width - width - 48,
    y: workArea.y + workArea.height - height - 72,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    fullscreenable: false,
    hasShadow: false,
    skipTaskbar: true,
    alwaysOnTop: settings.alwaysOnTop,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  petWindow.loadFile(path.join(__dirname, "pet.html"));
  petWindow.on("closed", () => {
    petWindow = undefined;
  });
}

function createControlWindow() {
  controlWindow = new BrowserWindow({
    width: 460,
    height: 720,
    minWidth: 420,
    minHeight: 620,
    show: !settings.startInBackground && settings.showControlOnStart,
    title: "桌宠控制台",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  controlWindow.loadFile(path.join(__dirname, "control.html"));
  controlWindow.on("show", () => {
    if (petWindow) applySettingsToPet();
    controlWindow.setAlwaysOnTop(true, "screen-saver");
    controlWindow.moveTop();
  });
  controlWindow.on("hide", () => {
    controlWindow.setAlwaysOnTop(false);
    applySettingsToPet();
  });
  controlWindow.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      controlWindow.hide();
    }
  });
  controlWindow.on("closed", () => {
    controlWindow = undefined;
  });
}

function createTray() {
  const icon = nativeImage.createFromPath(assetPath("assets", "pet-cartoon-idle.png")).resize({
    width: 18,
    height: 18
  });

  tray = new Tray(icon);
  tray.setToolTip("桌宠控制台");
  tray.setContextMenu(buildTrayMenu());
  tray.on("click", toggleControlWindow);
}

function buildTrayMenu() {
  return Menu.buildFromTemplate([
    { label: "打开控制台", click: showControlWindow },
    { label: "隐藏/显示桌宠", click: togglePetVisibility },
    { type: "separator" },
    {
      label: settings.alwaysOnTop ? "取消置顶" : "保持置顶",
      click: () => updateSettings({ alwaysOnTop: !settings.alwaysOnTop })
    },
    {
      label: settings.movementEnabled ? "暂停自动活动" : "启用自动活动",
      click: () => updateSettings({ movementEnabled: !settings.movementEnabled })
    },
    {
      label: "恢复可拖拽",
      click: () => restorePetInteraction()
    },
    {
      label: settings.clickThroughWhenIdle ? "关闭鼠标穿透" : "开启鼠标穿透",
      click: () => updateSettings({ clickThroughWhenIdle: !settings.clickThroughWhenIdle })
    },
    { type: "separator" },
    { label: "退出", click: quitApp }
  ]);
}

function showControlWindow() {
  if (!controlWindow) createControlWindow();
  if (settings.clickThroughWhenIdle) updateSettings({ clickThroughWhenIdle: false });
  if (petWindow) applySettingsToPet();
  controlWindow.show();
  controlWindow.setAlwaysOnTop(true, "screen-saver");
  controlWindow.moveTop();
  controlWindow.focus();
}

function toggleControlWindow() {
  if (!controlWindow) {
    createControlWindow();
    showControlWindow();
    return;
  }
  if (controlWindow.isVisible()) {
    controlWindow.hide();
  } else {
    showControlWindow();
  }
}

function togglePetVisibility() {
  if (!petWindow) {
    createPetWindow();
    applySettingsToPet();
    return;
  }
  if (petWindow.isVisible()) petWindow.hide();
  else {
    restorePetInteraction();
    petWindow.showInactive();
  }
}

function quitApp() {
  app.isQuitting = true;
  app.quit();
}

function petWindowSize(size) {
  return {
    width: Math.round(size + 36),
    height: Math.round(size * 1.45 + 82)
  };
}

function updateSettings(partial = {}) {
  settings = {
    ...settings,
    ...partial,
    petSize: clamp(Number(partial.petSize ?? settings.petSize), 120, 520),
    opacity: clamp(Number(partial.opacity ?? settings.opacity), 0.35, 1),
    wanderSpeed: clamp(Number(partial.wanderSpeed ?? settings.wanderSpeed), 0.2, 3)
  };
  saveSettings();
  applySettingsToPet();
  applyLoginItemSettings();
  startWanderLoop();
  broadcastSettings();
  if (tray) tray.setContextMenu(buildTrayMenu());
  return settings;
}

function applySettingsToPet() {
  if (!petWindow) return;

  const bounds = petWindow.getBounds();
  const nextSize = petWindowSize(settings.petSize);
  petWindow.setSize(nextSize.width, nextSize.height);
  const nextPosition = clampWindowPosition(
    { ...bounds, width: nextSize.width, height: nextSize.height },
    bounds.x,
    bounds.y
  );
  petWindow.setPosition(nextPosition.x, nextPosition.y);
  petWindow.setOpacity(settings.opacity);
  const controlIsVisible = Boolean(controlWindow && controlWindow.isVisible());
  petWindow.setAlwaysOnTop(settings.alwaysOnTop && !controlIsVisible, "screen-saver");
  petWindow.setSkipTaskbar(true);
  applyMousePassthrough();
  petWindow.webContents.send("settings:changed", settings);
}

function applyMousePassthrough() {
  if (!petWindow) return;
  petWindow.setIgnoreMouseEvents(Boolean(settings.clickThroughWhenIdle || dynamicMousePassthrough), {
    forward: true
  });
}

function restorePetInteraction() {
  dynamicMousePassthrough = false;
  updateSettings({
    catchModeEnabled: true,
    clickThroughWhenIdle: false
  });
  if (petWindow && !petWindow.isVisible()) petWindow.showInactive();
  if (petWindow) applyMousePassthrough();
}

function applyLoginItemSettings() {
  app.setLoginItemSettings({
    openAtLogin: Boolean(settings.launchAtLogin),
    openAsHidden: Boolean(settings.startInBackground)
  });
}

function broadcastSettings() {
  const windows = [petWindow, controlWindow].filter(Boolean);
  windows.forEach((win) => win.webContents.send("settings:changed", settings));
}

function startWanderLoop() {
  if (wanderTimer) clearInterval(wanderTimer);
  if (!settings.movementEnabled || !settings.wanderEnabled) return;

  lastWanderActionAt = 0;
  wanderTimer = setInterval(() => {
    if (!petWindow || isDragging || settings.clickThroughWhenIdle || controlWindow?.isVisible()) return;
    const bounds = petWindow.getBounds();
    const display = screen.getDisplayMatching(bounds);
    const area = display.workArea;
    const speed = settings.wanderSpeed;

    let nextX = bounds.x + velocity.x * speed;
    let nextY = bounds.y + velocity.y * speed;

    if (nextX <= area.x || nextX + bounds.width >= area.x + area.width) {
      velocity.x *= -1;
      nextX = clamp(nextX, area.x, area.x + area.width - bounds.width);
    }
    if (nextY <= area.y || nextY + bounds.height >= area.y + area.height) {
      velocity.y *= -1;
      nextY = clamp(nextY, area.y, area.y + area.height - bounds.height);
    }

    petWindow.setPosition(Math.round(nextX), Math.round(nextY));

    const now = Date.now();
    if (now - lastWanderActionAt > 1400) {
      petWindow.webContents.send("pet:action", { id: "walk", auto: true });
      lastWanderActionAt = now;
    }
  }, 32);
}

function snapPetToEdge() {
  if (!settings.snapToEdges || !petWindow) return;

  const bounds = petWindow.getBounds();
  const area = screen.getDisplayMatching(bounds).workArea;
  const leftDistance = Math.abs(bounds.x - area.x);
  const rightX = area.x + area.width - bounds.width;
  const rightDistance = Math.abs(bounds.x - rightX);
  const nextX = leftDistance < rightDistance ? area.x : rightX;
  const nextY = clamp(bounds.y, area.y, area.y + area.height - bounds.height);

  petWindow.setPosition(nextX, nextY);
}

function clampWindowPosition(bounds, x, y) {
  const area = screen.getDisplayMatching(bounds).workArea;
  return {
    x: clamp(Math.round(x), area.x, area.x + area.width - bounds.width),
    y: clamp(Math.round(y), area.y, area.y + area.height - bounds.height)
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

app.whenReady().then(() => {
  readSettings();
  createPetWindow();
  createControlWindow();
  createTray();
  applyLoginItemSettings();
  applySettingsToPet();
  startWanderLoop();

  if (settings.showControlOnStart && !settings.startInBackground) {
    showControlWindow();
  }
});

app.on("window-all-closed", () => {
  // Keeping a listener here makes the app stay alive in the tray.
});

app.on("activate", () => {
  if (!petWindow) createPetWindow();
});

ipcMain.handle("settings:get", () => settings);
ipcMain.handle("settings:update", (_event, partial) => updateSettings(partial));
ipcMain.handle("control:show", () => showControlWindow());
ipcMain.handle("pet:show-menu", () => {
  if (!petWindow) return;

  Menu.buildFromTemplate([
    { label: "打开设置", click: showControlWindow },
    { type: "separator" },
    { label: "挥手", click: () => petWindow.webContents.send("pet:action", "wave") },
    { label: "开心", click: () => petWindow.webContents.send("pet:action", "happy") },
    { label: "思考", click: () => petWindow.webContents.send("pet:action", "thinking") },
    { label: "休息", click: () => petWindow.webContents.send("pet:action", "sleep") },
    { type: "separator" },
    { label: "恢复可拖拽", click: () => restorePetInteraction() },
    { label: "回到右下角", click: () => resetPetPosition() }
  ]).popup({ window: petWindow });
});
ipcMain.handle("pet:reset-position", () => {
  resetPetPosition();
});
ipcMain.on("pet:mouse-passthrough", (_event, enabled) => {
  dynamicMousePassthrough = Boolean(enabled) && !isDragging;
  applyMousePassthrough();
});

function resetPetPosition() {
  if (!petWindow) return;
  const { workArea } = screen.getPrimaryDisplay();
  const bounds = petWindow.getBounds();
  petWindow.setPosition(
    workArea.x + workArea.width - bounds.width - 48,
    workArea.y + workArea.height - bounds.height - 72
  );
}

ipcMain.on("pet:drag-start", (_event, point) => {
  if (!petWindow || !settings.catchModeEnabled) return;
  const bounds = petWindow.getBounds();
  isDragging = true;
  dynamicMousePassthrough = false;
  applyMousePassthrough();
  dragOffset = {
    x: point.screenX - bounds.x,
    y: point.screenY - bounds.y
  };
});

ipcMain.on("pet:drag-to", (_event, point) => {
  if (!petWindow || !settings.catchModeEnabled || !dragOffset) return;
  const bounds = petWindow.getBounds();
  const next = clampWindowPosition(bounds, point.screenX - dragOffset.x, point.screenY - dragOffset.y);
  petWindow.setPosition(next.x, next.y);
});

ipcMain.on("pet:drag-end", () => {
  isDragging = false;
  dragOffset = undefined;
  dynamicMousePassthrough = false;
  applyMousePassthrough();
  snapPetToEdge();
});

ipcMain.on("pet:action", (_event, action) => {
  if (petWindow) petWindow.webContents.send("pet:action", action);
});
