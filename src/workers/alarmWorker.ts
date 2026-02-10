// Web Worker for background alarm checking
import type {
  AlarmRule,
  TimeCondition,
  CompoundCondition,
} from "@/types/alarm";
import { isCompoundCondition } from "@/utils/typeGuards";

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
      case "UPDATE_RULES":
        this.rules.clear();
        if (data.rules && Array.isArray(data.rules)) {
          data.rules.forEach((rule: AlarmRule) => {
            this.rules.set(rule.id, rule);
          });
        }
        break;
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

    // 매 분마다 체크
    this.intervalId = self.setInterval(() => {
      this.checkAlarms();
    }, 60000); // 1분 = 60초 = 60000ms

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

      const shouldTrigger = this.evaluateCondition(
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

  // 조건 평가
  private evaluateCondition(
    condition: TimeCondition | CompoundCondition,
    currentHour: number,
    currentMinute: number,
  ): boolean {
    if (isCompoundCondition(condition)) {
      return this.evaluateCompoundCondition(
        condition,
        currentHour,
        currentMinute,
      );
    } else {
      return this.evaluateTimeCondition(condition, currentHour, currentMinute);
    }
  }

  // 복합 조건 평가
  private evaluateCompoundCondition(
    condition: CompoundCondition,
    currentHour: number,
    currentMinute: number,
  ): boolean {
    const results = condition.conditions.map(c =>
      this.evaluateCondition(c, currentHour, currentMinute),
    );

    if (condition.operator === "AND") {
      return results.every(result => result);
    } else {
      return results.some(result => result);
    }
  }

  // 시간 조건 평가
  private evaluateTimeCondition(
    condition: TimeCondition,
    currentHour: number,
    currentMinute: number,
  ): boolean {
    switch (condition.type) {
      case "range":
        return this.evaluateRangeCondition(
          condition,
          currentHour,
          currentMinute,
        );
      case "interval":
        return this.evaluateIntervalCondition(
          condition,
          currentHour,
          currentMinute,
        );
      case "specific":
        return this.evaluateSpecificCondition(
          condition,
          currentHour,
          currentMinute,
        );
    }
  }

  // 범위 조건 평가
  private evaluateRangeCondition(
    condition: any,
    currentHour: number,
    currentMinute: number,
  ): boolean {
    const currentTime = currentHour * 60 + currentMinute;
    const startTime = condition.startHour * 60 + condition.startMinute;
    const endTime = condition.endHour * 60 + condition.endMinute;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // 자정을 넘나드는 경우 (예: 23:00 - 01:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // 간격 조건 평가
  private evaluateIntervalCondition(
    condition: any,
    currentHour: number,
    currentMinute: number,
  ): boolean {
    const currentTime = currentHour * 60 + currentMinute;
    return currentTime % condition.intervalMinutes === 0;
  }

  // 특정 값 조건 평가
  private evaluateSpecificCondition(
    condition: any,
    currentHour: number,
    currentMinute: number,
  ): boolean {
    const hourMatch =
      condition.hour === undefined || condition.hour === currentHour;
    const minuteMatch =
      condition.minute === undefined || condition.minute === currentMinute;
    return hourMatch && minuteMatch;
  }

  // 알람 트리거
  private triggerAlarm(rule: AlarmRule) {
    const event: AlarmEvent = {
      ruleId: rule.id,
      ruleName: rule.name,
      triggeredAt: new Date(),
      message: `${rule.name} 알람이 울렸습니다!`,
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
