// Web Worker for background alarm checking (Hybrid: Timer + Safety Net + Reactive)
import { TomatoMienDB } from "@/db/TomatoMienDB";
import { liveQuery, type Subscription } from "dexie";
import { evaluateRule } from "@/utils/evaluateCondition";
import {
  getNextAlarmTime,
  computeDelayMs,
  getEarliestNextAlarm,
} from "@/utils/nextAlarmTime";
import type { AlarmRule } from "@/types/alarm";

const SAFETY_INTERVAL_MS = 5 * 60_000; // 5분
const RESCHEDULE_DEBOUNCE_MS = 500;

interface WorkerMessage {
  type: "START_ALARM" | "STOP_ALARM" | "CHECK_ALARM" | "RULES_CHANGED";
}

interface AlarmEvent {
  ruleId: string;
  ruleName: string;
  triggeredAt: Date;
  message?: string;
  nextAlarmTime?: { hour: number; minute: number };
}

class AlarmWorker {
  private db = new TomatoMienDB();
  private primaryTimerId: number | null = null;
  private safetyIntervalId: number | null = null;
  private rulesSubscription: Subscription | null = null;
  private rescheduleDebounceId: number | null = null;
  private triggeredAlarms: Set<string> = new Set(); // "ruleId:hour:minute"
  private lastCheckKey: string | null = null; // "hour:minute"
  private running = false;
  private generation = 0;

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
      case "RULES_CHANGED":
        this.debouncedReschedule();
        break;
    }
  }

  private start() {
    if (this.running) {
      this.stop();
    }
    this.generation++;
    this.running = true;

    this.subscribeToRuleChanges();

    // Safety Net: 5분마다 보정 체크
    this.safetyIntervalId = self.setInterval(() => {
      console.debug("[AlarmWorker] Safety net check");
      this.checkAlarms();
    }, SAFETY_INTERVAL_MS);

    // 초기 체크 + 스케줄
    this.checkAlarms();
  }

  private stop() {
    this.running = false;
    this.generation++;

    if (this.primaryTimerId !== null) {
      self.clearTimeout(this.primaryTimerId);
      this.primaryTimerId = null;
    }
    if (this.safetyIntervalId !== null) {
      self.clearInterval(this.safetyIntervalId);
      this.safetyIntervalId = null;
    }
    if (this.rescheduleDebounceId !== null) {
      self.clearTimeout(this.rescheduleDebounceId);
      this.rescheduleDebounceId = null;
    }
    if (this.rulesSubscription) {
      this.rulesSubscription.unsubscribe();
      this.rulesSubscription = null;
    }
  }

  private subscribeToRuleChanges() {
    try {
      const observable = liveQuery(() => this.db.rules.toArray());
      this.rulesSubscription = observable.subscribe({
        next: () => {
          console.debug("[AlarmWorker] Rules changed via liveQuery");
          this.debouncedReschedule();
        },
        error: err => {
          console.warn(
            "[AlarmWorker] liveQuery subscription failed, relying on RULES_CHANGED messages:",
            err,
          );
        },
      });
    } catch (err) {
      console.warn(
        "[AlarmWorker] liveQuery not available, relying on RULES_CHANGED messages:",
        err,
      );
    }
  }

  private debouncedReschedule() {
    if (!this.running) return;
    if (this.rescheduleDebounceId !== null) {
      self.clearTimeout(this.rescheduleDebounceId);
    }
    this.rescheduleDebounceId = self.setTimeout(() => {
      this.rescheduleDebounceId = null;
      this.schedule();
    }, RESCHEDULE_DEBOUNCE_MS);
  }

  private async schedule(cachedRules?: AlarmRule[]) {
    const gen = this.generation;
    if (!this.running) return;

    // 기존 primary timer 클리어
    if (this.primaryTimerId !== null) {
      self.clearTimeout(this.primaryTimerId);
      this.primaryTimerId = null;
    }

    try {
      const allRules = cachedRules ?? (await this.db.rules.toArray());

      // stale 방지: await 복귀 후 generation 체크
      if (gen !== this.generation) return;

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      const earliest = getEarliestNextAlarm(
        allRules,
        currentHour,
        currentMinute,
      );

      if (!earliest) {
        console.debug("[AlarmWorker] No upcoming alarm, timer not set");
        return;
      }

      const delayMs = computeDelayMs(earliest.hour, earliest.minute, now);
      console.debug(
        `[AlarmWorker] Next alarm: ${String(earliest.hour).padStart(2, "0")}:${String(earliest.minute).padStart(2, "0")} (in ${Math.round(delayMs / 60_000)}min)`,
      );

      this.primaryTimerId = self.setTimeout(() => {
        this.primaryTimerId = null;
        this.checkAlarms();
      }, delayMs);
    } catch (err) {
      console.error("[AlarmWorker] schedule error:", err);
    }
  }

  private async checkAlarms() {
    const gen = this.generation;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // hour:minute 조합으로 추적하여 시간 변경 시에도 정확히 clear
    const currentTimeKey = `${currentHour}:${currentMinute}`;
    if (this.lastCheckKey !== currentTimeKey) {
      this.triggeredAlarms.clear();
      this.lastCheckKey = currentTimeKey;
    }

    let allRules: AlarmRule[] | undefined;
    try {
      allRules = await this.db.rules.toArray();

      // stale 방지: await 복귀 후 generation 체크
      if (gen !== this.generation) return;

      const enabledRules = allRules.filter(r => r.enabled);

      for (const rule of enabledRules) {
        const shouldTrigger = evaluateRule(
          rule.triggers,
          rule.filters,
          currentHour,
          currentMinute,
          rule.activatedAt ? new Date(rule.activatedAt) : undefined,
        );

        if (shouldTrigger) {
          const alarmKey = `${rule.id}:${currentHour}:${currentMinute}`;

          if (!this.triggeredAlarms.has(alarmKey)) {
            this.triggerAlarm(rule, currentHour, currentMinute);
            this.triggeredAlarms.add(alarmKey);
          }
        }
      }
    } catch (err) {
      console.error("[AlarmWorker] checkAlarms error:", err);
    }

    // stop() 이후 메시지/스케줄 방지
    if (!this.running) return;

    self.postMessage({
      type: "LAST_CHECK_TIME_UPDATE",
      data: { lastCheckTime: now.toISOString() },
    });

    // 평가 후 다음 알람 재스케줄 (이미 읽은 규칙을 전달하여 중복 DB 조회 방지)
    this.schedule(allRules);
  }

  private triggerAlarm(
    rule: AlarmRule,
    currentHour: number,
    currentMinute: number,
  ) {
    const nextTime = getNextAlarmTime(
      rule.triggers,
      rule.filters,
      currentHour,
      currentMinute,
      rule.activatedAt ? new Date(rule.activatedAt) : undefined,
    );

    const event: AlarmEvent = {
      ruleId: rule.id,
      ruleName: rule.name,
      triggeredAt: new Date(),
      nextAlarmTime: nextTime ?? undefined,
    };

    self.postMessage({
      type: "ALARM_TRIGGERED",
      data: event,
    });
  }
}

new AlarmWorker();
