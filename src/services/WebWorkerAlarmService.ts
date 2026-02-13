import type { AlarmEvent } from "@/types/alarm";
import { db } from "@/db/database";
import { playAlarmSound } from "./alarmSound";

export class WebWorkerAlarmService {
  private static instance: WebWorkerAlarmService;
  private worker: Worker | null = null;
  private onAlarmTriggered?: (event: AlarmEvent) => void;
  private lastCheckTime: Date | null = null;

  private constructor() {
    this.initializeWorker();
  }

  public static getInstance(): WebWorkerAlarmService {
    if (!WebWorkerAlarmService.instance) {
      WebWorkerAlarmService.instance = new WebWorkerAlarmService();
    }
    return WebWorkerAlarmService.instance;
  }

  private initializeWorker() {
    try {
      this.worker = new Worker(
        new URL("../workers/alarmWorker.ts", import.meta.url),
        {
          type: "module",
        },
      );

      this.worker.onmessage = event => {
        const { type, data } = event.data;

        switch (type) {
          case "ALARM_TRIGGERED":
            this.handleAlarmTriggered(data);
            break;
          case "LAST_CHECK_TIME_UPDATE":
            this.lastCheckTime = new Date(data.lastCheckTime);
            break;
        }
      };

      this.worker.onerror = error => {
        console.error("Alarm Worker Error:", error);
      };
    } catch (error) {
      console.error("Failed to initialize alarm worker:", error);
      this.fallbackToMainThread();
    }
  }

  private fallbackToMainThread() {
    console.warn("Web Worker not supported, falling back to main thread");
  }

  private async handleAlarmTriggered(event: AlarmEvent) {
    try {
      const rule = await db.rules.get(event.ruleId);
      if (rule?.notificationEnabled) {
        this.showNotification(event);
      }
    } catch {
      this.showNotification(event);
    }
    playAlarmSound();
    this.onAlarmTriggered?.(event);
  }

  private showNotification(event: AlarmEvent): void {
    if (Notification.permission !== "granted") return;

    new Notification(event.ruleName, {
      body: event.message,
      icon: "/vite.svg",
      tag: event.ruleId,
    });
  }

  public start(): void {
    if (this.worker) {
      this.worker.postMessage({ type: "START_ALARM" });
    }
  }

  public stop(): void {
    if (this.worker) {
      this.worker.postMessage({ type: "STOP_ALARM" });
    }
  }

  public setAlarmCallback(callback: (event: AlarmEvent) => void): void {
    this.onAlarmTriggered = callback;
  }

  public async requestNotificationPermission(): Promise<boolean> {
    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  public destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  public getLastCheckTime(): Date | null {
    return this.lastCheckTime;
  }
}
