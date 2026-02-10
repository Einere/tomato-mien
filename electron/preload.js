const { contextBridge, ipcRenderer } = require('electron');

// 렌더러 프로세스에서 사용할 수 있는 API 노출
contextBridge.exposeInMainWorld('electronAPI', {
  // 메뉴 이벤트 리스너

  // 메뉴 이벤트 리스너 제거

  // 플랫폼 정보
  platform: process.platform,
});
