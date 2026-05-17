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
    { type: "separator" },
    { label: "退出", click: quitApp }
  ]);
}

function showControlWindow() {
  if (!controlWindow) createControlWindow();
  controlWindow.show();
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
  else petWindow.showInactive();
}

function quitApp() {
  app.isQuitting = true;
  app.quit();
}

function petWindowSize(size) {
  return {
    width: Math.round(size * 1.45),
    height: Math.round(size * 1.72)
  };
}

function updateSettings(partial) {
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
  petWindow.setPosition(bounds.x, bounds.y);
  petWindow.setOpacity(settings.opacity);
  petWindow.setAlwaysOnTop(settings.alwaysOnTop, "screen-saver");
  petWindow.setSkipTaskbar(true);
  petWindow.setIgnoreMouseEvents(Boolean(settings.clickThroughWhenIdle), { forward: true });
  petWindow.webContents.send("settings:changed", settings);
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

  wanderTimer = setInterval(() => {
    if (!petWindow || isDragging || settings.clickThroughWhenIdle) return;
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

app.on("window-all-closed", (event) => {
  event.preventDefault();
});

app.on("activate", () => {
  if (!petWindow) createPetWindow();
});

ipcMain.handle("settings:get", () => settings);
ipcMain.handle("settings:update", (_event, partial) => updateSettings(partial));
ipcMain.handle("control:show", () => showControlWindow());
ipcMain.handle("pet:reset-position", () => {
  if (!petWindow) return;
  const { workArea } = screen.getPrimaryDisplay();
  const bounds = petWindow.getBounds();
  petWindow.setPosition(
    workArea.x + workArea.width - bounds.width - 48,
    workArea.y + workArea.height - bounds.height - 72
  );
});

ipcMain.on("pet:drag-start", () => {
  isDragging = true;
});

ipcMain.on("pet:drag-to", (_event, point) => {
  if (!petWindow || !settings.catchModeEnabled) return;
  const nextX = Math.round(point.screenX - point.offsetX);
  const nextY = Math.round(point.screenY - point.offsetY);
  petWindow.setPosition(nextX, nextY);
});

ipcMain.on("pet:drag-end", () => {
  isDragging = false;
  snapPetToEdge();
});

ipcMain.on("pet:action", (_event, action) => {
  if (petWindow) petWindow.webContents.send("pet:action", action);
});
