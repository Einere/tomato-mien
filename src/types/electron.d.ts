export interface ElectronAPI {
  onMenuAction: (callback: (event: unknown, action: string) => void) => void;
  removeMenuListeners: () => void;
  platform: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
