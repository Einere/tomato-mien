import type {
  TimeCondition,
  TriggerCondition,
  FilterCondition,
} from "@/types/alarm";

const MINUTES_PER_HOUR = 60;

export function evaluateRule(
  triggers: TriggerCondition[],
  filters: FilterCondition[],
  currentHour: number,
  currentMinute: number,
): boolean {
  const filtersPass = filters.every(f =>
    evaluateCondition(f, currentHour, currentMinute),
  );
  if (!filtersPass) return false;
  return triggers.some(t => evaluateCondition(t, currentHour, currentMinute));
}

export function evaluateCondition(
  condition: TimeCondition,
  currentHour: number,
  currentMinute: number,
): boolean {
  switch (condition.type) {
    case "range":
      return evaluateRangeCondition(condition, currentHour, currentMinute);
    case "interval":
      return evaluateIntervalCondition(condition, currentHour, currentMinute);
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
): boolean {
  const currentTime = currentHour * MINUTES_PER_HOUR + currentMinute;
  return currentTime % condition.intervalMinutes === 0;
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
