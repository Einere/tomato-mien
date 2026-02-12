// Web Worker for background alarm checking
import type { AlarmRule } from "@/types/alarm";
import { z } from "zod";
import { AlarmRuleSchema } from "@/schemas/alarm";
import { evaluateCondition } from "@/utils/evaluateCondition";

const AlarmRulesArraySchema = z.array(AlarmRuleSchema);

const CHECK_INTERVAL_MS = 60_000;

interface WorkerMessage {
  type:
    | "START_ALARM"
    | "STOP_ALARM"
    | "UPDATE_RULES"
    | "UPDATE_RULE"
    | "CHECK_ALARM";
  data?: any;
}

interface AlarmEvent {
  ruleId: string;
  ruleName: string;
  triggeredAt: Date;
  message: string;
}

class AlarmWorker {
  private rules: Map<string, AlarmRule> = new Map(); // ruleId -> AlarmRule
  private intervalId: number | null = null;
  private triggeredAlarms: Set<string> = new Set(); // "ruleId:hour:minute" 형태로 저장
  private lastCheckMinute: number | null = null;

  constructor() {
    self.addEventListener("message", this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent<WorkerMessage>) {
    const { type, data } = event.data;

    switch (type) {
      case "START_ALARM":
        this.start();
        break;
      case "STOP_ALARM":
        this.stop();
        break;
      case "UPDATE_RULES": {
        this.rules.clear();
        const parsed = AlarmRulesArraySchema.safeParse(data?.rules);
        if (parsed.success) {
          parsed.data.forEach(rule => {
            this.rules.set(rule.id, rule);
          });
        } else {
          console.error(
            "[AlarmWorker] UPDATE_RULES 검증 실패:",
            parsed.error.issues,
          );
        }
        break;
      }
      case "UPDATE_RULE":
        if (data.rule) {
          this.rules.set(data.rule.id, data.rule);
        }
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

    // 즉시 한 번 체크
    this.checkAlarms();
  }

  private stop() {
    if (this.intervalId) {
      self.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private checkAlarms() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 매분마다 triggeredAlarms Set을 초기화 (새로운 분이 시작될 때)
    if (this.lastCheckMinute !== currentMinute) {
      this.triggeredAlarms.clear();
      this.lastCheckMinute = currentMinute;
    }

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      const shouldTrigger = evaluateCondition(
        rule.condition,
        currentHour,
        currentMinute,
      );

      if (shouldTrigger) {
        // 중복 알람 방지: 같은 분에 같은 규칙이 이미 알람을 울렸는지 확인
        const alarmKey = `${rule.id}:${currentHour}:${currentMinute}`;

        if (!this.triggeredAlarms.has(alarmKey)) {
          this.triggerAlarm(rule);
          this.triggeredAlarms.add(alarmKey);
        }
      }
    }

    // 마지막 체크 시간을 메인 스레드에 전송
    self.postMessage({
      type: "LAST_CHECK_TIME_UPDATE",
      data: { lastCheckTime: now.toISOString() },
    });
  }

  // 알람 트리거
  private triggerAlarm(rule: AlarmRule) {
    const event: AlarmEvent = {
      ruleId: rule.id,
      ruleName: rule.name,
      triggeredAt: new Date(),
      message: `${rule.name} alarm triggered!`,
    };

    // 메인 스레드에 알람 이벤트 전송
    self.postMessage({
      type: "ALARM_TRIGGERED",
      data: event,
    });
  }
}

// 워커 시작
new AlarmWorker();
