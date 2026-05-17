const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopPet", {
  getSettings: () => ipcRenderer.invoke("settings:get"),
  updateSettings: (settings) => ipcRenderer.invoke("settings:update", settings),
  showControl: () => ipcRenderer.invoke("control:show"),
  showPetMenu: () => ipcRenderer.invoke("pet:show-menu"),
  resetPosition: () => ipcRenderer.invoke("pet:reset-position"),
  dragStart: (point) => ipcRenderer.send("pet:drag-start", point),
  dragTo: (point) => ipcRenderer.send("pet:drag-to", point),
  dragEnd: () => ipcRenderer.send("pet:drag-end"),
  performAction: (action) => ipcRenderer.send("pet:action", action),
  onSettingsChanged: (callback) => {
    const listener = (_event, settings) => callback(settings);
    ipcRenderer.on("settings:changed", listener);
    return () => ipcRenderer.removeListener("settings:changed", listener);
  },
  onPetAction: (callback) => {
    const listener = (_event, action) => callback(action);
    ipcRenderer.on("pet:action", listener);
    return () => ipcRenderer.removeListener("pet:action", listener);
  }
});
