// Web Worker for background alarm checking
import { TomatoMienDB } from "@/db/database";
import { evaluateCondition } from "@/utils/evaluateCondition";

const CHECK_INTERVAL_MS = 60_000;

interface WorkerMessage {
  type: "START_ALARM" | "STOP_ALARM" | "CHECK_ALARM";
}

interface AlarmEvent {
  ruleId: string;
  ruleName: string;
  triggeredAt: Date;
  message: string;
}

class AlarmWorker {
  private db = new TomatoMienDB();
  private intervalId: number | null = null;
  private triggeredAlarms: Set<string> = new Set(); // "ruleId:hour:minute"
  private lastCheckMinute: number | null = null;

  constructor() {
    self.addEventListener("message", this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent<WorkerMessage>) {
    const { type } = event.data;

    switch (type) {
      case "START_ALARM":
        this.start();
        break;
      case "STOP_ALARM":
        this.stop();
        break;
      case "CHECK_ALARM":
        this.checkAlarms();
        break;
    }
  }

  private start() {
    if (this.intervalId) {
      this.stop();
    }

    this.intervalId = self.setInterval(() => {
      this.checkAlarms();
    }, CHECK_INTERVAL_MS);

    this.checkAlarms();
  }

  private stop() {
    if (this.intervalId) {
      self.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async checkAlarms() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (this.lastCheckMinute !== currentMinute) {
      this.triggeredAlarms.clear();
      this.lastCheckMinute = currentMinute;
    }

    try {
      const allRules = await this.db.rules.toArray();
      const enabledRules = allRules.filter(r => r.enabled);

      for (const rule of enabledRules) {
        const shouldTrigger = evaluateCondition(
          rule.condition,
          currentHour,
          currentMinute,
        );

        if (shouldTrigger) {
          const alarmKey = `${rule.id}:${currentHour}:${currentMinute}`;

          if (!this.triggeredAlarms.has(alarmKey)) {
            this.triggerAlarm(rule.id, rule.name);
            this.triggeredAlarms.add(alarmKey);
          }
        }
      }
    } catch (err) {
      console.error("[AlarmWorker] checkAlarms error:", err);
    }

    self.postMessage({
      type: "LAST_CHECK_TIME_UPDATE",
      data: { lastCheckTime: now.toISOString() },
    });
  }

  private triggerAlarm(ruleId: string, ruleName: string) {
    const event: AlarmEvent = {
      ruleId,
      ruleName,
      triggeredAt: new Date(),
      message: `${ruleName} alarm triggered!`,
    };

    self.postMessage({
      type: "ALARM_TRIGGERED",
      data: event,
    });
  }
}

new AlarmWorker();
