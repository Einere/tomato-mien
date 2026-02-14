export interface NotificationOptions {
  body?: string;
  icon?: string;
  silent?: boolean;
}

export interface NotificationResult {
  success: boolean;
  error?: string;
}

export interface ElectronAPI {
  onMenuAction: (callback: (event: unknown, action: string) => void) => void;
  removeMenuListeners: () => void;
  platform: string;
  showNotification: (
    title: string,
    options: NotificationOptions,
  ) => Promise<NotificationResult>;
  requestNotificationPermission: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
