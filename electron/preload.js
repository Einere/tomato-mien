const { contextBridge, ipcRenderer } = require('electron');

// 렌더러 프로세스에서 사용할 수 있는 API 노출
contextBridge.exposeInMainWorld('electronAPI', {
  // 메뉴 이벤트 리스너
  onMenuAction: callback => {
    ipcRenderer.on('menu-new-rule', callback);
    ipcRenderer.on('menu-enable-all-alarms', callback);
    ipcRenderer.on('menu-disable-all-alarms', callback);
    ipcRenderer.on('menu-about', callback);
  },

  // 메뉴 이벤트 리스너 제거
  removeMenuListeners: () => {
    ipcRenderer.removeAllListeners('menu-new-rule');
    ipcRenderer.removeAllListeners('menu-enable-all-alarms');
    ipcRenderer.removeAllListeners('menu-disable-all-alarms');
    ipcRenderer.removeAllListeners('menu-about');
  },

  // 플랫폼 정보
  platform: process.platform,
});
