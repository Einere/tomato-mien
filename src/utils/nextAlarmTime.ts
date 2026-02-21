import type {
  TriggerCondition,
  FilterCondition,
  AlarmRule,
} from "@/types/alarm";
import { evaluateCondition } from "./evaluateCondition";

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;
const MS_PER_MINUTE = 60_000;

export function getNextAlarmTime(
  triggers: TriggerCondition[],
  filters: FilterCondition[],
  currentHour: number,
  currentMinute: number,
  activatedAt?: Date,
): { hour: number; minute: number } | null {
  const currentTime = currentHour * MINUTES_PER_HOUR + currentMinute;
  let bestCandidate: { hour: number; minute: number; distance: number } | null =
    null;

  for (const trigger of triggers) {
    const candidate = getNextForTrigger(
      trigger,
      filters,
      currentTime,
      activatedAt,
    );
    if (!candidate) continue;

    let distance =
      (candidate.hour * MINUTES_PER_HOUR +
        candidate.minute -
        currentTime +
        MINUTES_PER_DAY) %
      MINUTES_PER_DAY;
    if (distance === 0) distance = MINUTES_PER_DAY;

    if (!bestCandidate || distance < bestCandidate.distance) {
      bestCandidate = {
        hour: candidate.hour,
        minute: candidate.minute,
        distance,
      };
    }
  }

  return bestCandidate
    ? { hour: bestCandidate.hour, minute: bestCandidate.minute }
    : null;
}

function passesFilters(
  filters: FilterCondition[],
  hour: number,
  minute: number,
): boolean {
  return filters.every(f => evaluateCondition(f, hour, minute));
}

function getNextForTrigger(
  trigger: TriggerCondition,
  filters: FilterCondition[],
  currentTime: number,
  activatedAt?: Date,
): { hour: number; minute: number } | null {
  switch (trigger.type) {
    case "interval":
      return getNextInterval(trigger, filters, currentTime, activatedAt);
    case "specific":
      return getNextSpecific(trigger, filters, currentTime);
  }
}

function getNextInterval(
  trigger: TriggerCondition & { type: "interval" },
  filters: FilterCondition[],
  currentTime: number,
  activatedAt?: Date,
): { hour: number; minute: number } | null {
  const interval = trigger.intervalMinutes;
  const maxAttempts = Math.ceil(MINUTES_PER_DAY / interval);

  if (!activatedAt) {
    let nextTime = currentTime + interval - (currentTime % interval);
    for (let i = 0; i < maxAttempts; i++) {
      const t = nextTime % MINUTES_PER_DAY;
      const h = Math.floor(t / MINUTES_PER_HOUR);
      const m = t % MINUTES_PER_HOUR;
      if (passesFilters(filters, h, m)) {
        return { hour: h, minute: m };
      }
      nextTime += interval;
    }
    return null;
  }

  const activatedTime =
    activatedAt.getHours() * MINUTES_PER_HOUR + activatedAt.getMinutes();
  const diff =
    (currentTime - activatedTime + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const nextDiff =
    diff === 0 ? interval : (Math.floor(diff / interval) + 1) * interval;
  let candidateDiff = nextDiff;

  for (let i = 0; i < maxAttempts; i++) {
    const t = (activatedTime + candidateDiff) % MINUTES_PER_DAY;
    const h = Math.floor(t / MINUTES_PER_HOUR);
    const m = t % MINUTES_PER_HOUR;
    if (passesFilters(filters, h, m)) {
      return { hour: h, minute: m };
    }
    candidateDiff += interval;
  }
  return null;
}

function getNextSpecific(
  trigger: TriggerCondition & { type: "specific" },
  filters: FilterCondition[],
  currentTime: number,
): { hour: number; minute: number } | null {
  const { hour, minute } = trigger;

  if (hour !== undefined && minute !== undefined) {
    // 특정 시각 (매일 1회) → 다음 = 같은 시각
    return passesFilters(filters, hour, minute) ? { hour, minute } : null;
  }

  if (hour === undefined && minute !== undefined) {
    // 매시 N분
    const currentHour = Math.floor(currentTime / MINUTES_PER_HOUR);
    const currentMin = currentTime % MINUTES_PER_HOUR;
    const startOffset = currentMin < minute ? 0 : 1;
    for (let i = startOffset; i < startOffset + 24; i++) {
      const nextHour = (currentHour + i) % 24;
      if (passesFilters(filters, nextHour, minute)) {
        return { hour: nextHour, minute };
      }
    }
    return null;
  }

  if (hour !== undefined && minute === undefined) {
    // 매일 N시 정각
    return passesFilters(filters, hour, 0) ? { hour, minute: 0 } : null;
  }

  return null;
}

/**
 * target {hour, minute}까지의 setTimeout용 밀리초를 계산한다.
 * target이 현재보다 과거이면 다음 날로 래핑한다.
 */
export function computeDelayMs(
  targetHour: number,
  targetMinute: number,
  now: Date = new Date(),
): number {
  const nowMinutes = now.getHours() * MINUTES_PER_HOUR + now.getMinutes();
  const targetMinutes = targetHour * MINUTES_PER_HOUR + targetMinute;

  let diffMinutes =
    (targetMinutes - nowMinutes + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  if (diffMinutes === 0) diffMinutes = MINUTES_PER_DAY;

  const nowSeconds = now.getSeconds();
  const nowMs = now.getMilliseconds();
  return diffMinutes * MS_PER_MINUTE - nowSeconds * 1000 - nowMs;
}

/**
 * 전체 규칙 중 가장 가까운 다음 알람을 반환한다.
 * 활성 규칙이 없거나 다음 알람이 없으면 null을 반환한다.
 */
export function getEarliestNextAlarm(
  rules: AlarmRule[],
  currentHour: number,
  currentMinute: number,
): { ruleId: string; hour: number; minute: number } | null {
  const currentTime = currentHour * MINUTES_PER_HOUR + currentMinute;
  let best: {
    ruleId: string;
    hour: number;
    minute: number;
    distance: number;
  } | null = null;

  for (const rule of rules) {
    if (!rule.enabled) continue;

    const next = getNextAlarmTime(
      rule.triggers,
      rule.filters,
      currentHour,
      currentMinute,
      rule.activatedAt ? new Date(rule.activatedAt) : undefined,
    );
    if (!next) continue;

    let distance =
      (next.hour * MINUTES_PER_HOUR +
        next.minute -
        currentTime +
        MINUTES_PER_DAY) %
      MINUTES_PER_DAY;
    if (distance === 0) distance = MINUTES_PER_DAY;

    if (!best || distance < best.distance) {
      best = {
        ruleId: rule.id,
        hour: next.hour,
        minute: next.minute,
        distance,
      };
    }
  }

  return best
    ? { ruleId: best.ruleId, hour: best.hour, minute: best.minute }
    : null;
}
