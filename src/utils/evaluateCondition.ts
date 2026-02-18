import type {
  TimeCondition,
  TriggerCondition,
  FilterCondition,
} from "@/types/alarm";

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;

export function evaluateRule(
  triggers: TriggerCondition[],
  filters: FilterCondition[],
  currentHour: number,
  currentMinute: number,
  activatedAt?: Date,
): boolean {
  const filtersPass = filters.every(f =>
    evaluateCondition(f, currentHour, currentMinute),
  );
  if (!filtersPass) return false;
  return triggers.some(t =>
    evaluateCondition(t, currentHour, currentMinute, activatedAt),
  );
}

export function evaluateCondition(
  condition: TimeCondition,
  currentHour: number,
  currentMinute: number,
  activatedAt?: Date,
): boolean {
  switch (condition.type) {
    case "range":
      return evaluateRangeCondition(condition, currentHour, currentMinute);
    case "interval":
      return evaluateIntervalCondition(
        condition,
        currentHour,
        currentMinute,
        activatedAt,
      );
    case "specific":
      return evaluateSpecificCondition(condition, currentHour, currentMinute);
  }
}

function evaluateRangeCondition(
  condition: TimeCondition & { type: "range" },
  currentHour: number,
  currentMinute: number,
): boolean {
  const currentTime = currentHour * MINUTES_PER_HOUR + currentMinute;
  const startTime =
    condition.startHour * MINUTES_PER_HOUR + condition.startMinute;
  const endTime = condition.endHour * MINUTES_PER_HOUR + condition.endMinute;

  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    return currentTime >= startTime || currentTime <= endTime;
  }
}

function evaluateIntervalCondition(
  condition: TimeCondition & { type: "interval" },
  currentHour: number,
  currentMinute: number,
  activatedAt?: Date,
): boolean {
  const currentTime = currentHour * MINUTES_PER_HOUR + currentMinute;

  if (!activatedAt) {
    return currentTime % condition.intervalMinutes === 0;
  }

  const activatedTime =
    activatedAt.getHours() * MINUTES_PER_HOUR + activatedAt.getMinutes();
  const diff =
    (currentTime - activatedTime + MINUTES_PER_DAY) % MINUTES_PER_DAY;

  return diff > 0 && diff % condition.intervalMinutes === 0;
}

function evaluateSpecificCondition(
  condition: TimeCondition & { type: "specific" },
  currentHour: number,
  currentMinute: number,
): boolean {
  const hourMatch =
    condition.hour === undefined || condition.hour === currentHour;
  const effectiveMinute = condition.minute ?? 0;
  const minuteMatch = effectiveMinute === currentMinute;
  return hourMatch && minuteMatch;
}
