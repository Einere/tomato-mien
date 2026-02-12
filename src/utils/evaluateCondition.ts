import type { TimeCondition, CompoundCondition } from "@/types/alarm";
import { isCompoundCondition } from "./typeGuards";

export function evaluateCondition(
  condition: TimeCondition | CompoundCondition,
  currentHour: number,
  currentMinute: number,
): boolean {
  if (isCompoundCondition(condition)) {
    return evaluateCompoundCondition(condition, currentHour, currentMinute);
  } else {
    return evaluateTimeCondition(condition, currentHour, currentMinute);
  }
}

function evaluateCompoundCondition(
  condition: CompoundCondition,
  currentHour: number,
  currentMinute: number,
): boolean {
  const results = condition.conditions.map(c =>
    evaluateCondition(c, currentHour, currentMinute),
  );

  if (condition.operator === "AND") {
    return results.every(result => result);
  } else {
    return results.some(result => result);
  }
}

function evaluateTimeCondition(
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
  const currentTime = currentHour * 60 + currentMinute;
  const startTime = condition.startHour * 60 + condition.startMinute;
  const endTime = condition.endHour * 60 + condition.endMinute;

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
  const currentTime = currentHour * 60 + currentMinute;
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
