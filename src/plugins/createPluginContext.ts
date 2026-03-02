import type { PluginContext } from "@tomato-mien/plugin-core";
import { playAlarmSound } from "@/services/alarmSound";

async function showNotification(title: string, body: string): Promise<void> {
  const options = { body, icon: "/vite.svg" };

  if (window.electronAPI?.showNotification) {
    try {
      const result = await window.electronAPI.showNotification(title, options);
      if (result.success) return;
    } catch {
      /* fallback to Web Notification */
    }
  }

  if (
    typeof Notification !== "undefined" &&
    Notification.permission === "granted"
  ) {
    new Notification(title, options);
  }
}

export function createPluginContext(): PluginContext {
  return {
    notifications: { show: showNotification },
    audio: { playAlarm: playAlarmSound },
  };
}
