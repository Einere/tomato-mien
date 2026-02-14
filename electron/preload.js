const { contextBridge, ipcRenderer } = require("electron");

// 렌더러 프로세스에서 사용할 수 있는 API 노출
contextBridge.exposeInMainWorld("electronAPI", {
  // 메뉴 이벤트 리스너
  onMenuAction: callback => {
    const handler = (_event, action) => callback(_event, action);
    ipcRenderer.on("menu-new-rule", e => handler(e, "menu-new-rule"));
    ipcRenderer.on("menu-enable-all-alarms", e =>
      handler(e, "menu-enable-all-alarms"),
    );
    ipcRenderer.on("menu-disable-all-alarms", e =>
      handler(e, "menu-disable-all-alarms"),
    );
    ipcRenderer.on("menu-about", e => handler(e, "menu-about"));
  },

  // 메뉴 이벤트 리스너 제거
  removeMenuListeners: () => {
    ipcRenderer.removeAllListeners("menu-new-rule");
    ipcRenderer.removeAllListeners("menu-enable-all-alarms");
    ipcRenderer.removeAllListeners("menu-disable-all-alarms");
    ipcRenderer.removeAllListeners("menu-about");
  },

  // 플랫폼 정보
  platform: process.platform,

  // 알림
  showNotification: (title, options) =>
    ipcRenderer.invoke("show-notification", title, options),
  requestNotificationPermission: () =>
    ipcRenderer.invoke("request-notification-permission"),
});
