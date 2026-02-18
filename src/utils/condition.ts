import type {
  TimeCondition,
  TimeFormat,
  TriggerCondition,
  FilterCondition,
} from "@/types/alarm";
import { TimeConditionSchema } from "@/schemas/alarm";
import { formatTime, formatTimeRange } from "@/lib/dayjs";

export interface ValidationIssue {
  path: string; // e.g., triggers[0].intervalMinutes
  message: string;
}

function zodPathToString(zodPath: PropertyKey[], basePath: string): string {
  let result = basePath;
  for (const segment of zodPath) {
    if (typeof segment === "number") {
      result += `[${segment}]`;
    } else {
      result += `.${String(segment)}`;
    }
  }
  return result;
}

export function describeCondition(
  cond: TimeCondition,
  timeFormat: TimeFormat = "24h",
): string {
  switch (cond.type) {
    case "range":
      return formatTimeRange(
        cond.startHour,
        cond.startMinute,
        cond.endHour,
        cond.endMinute,
        timeFormat,
      );
    case "interval":
      return `every ${cond.intervalMinutes} minutes`;
    case "specific": {
      if (cond.hour !== undefined) {
        return `at ${formatTime(cond.hour, cond.minute ?? 0, timeFormat)}`;
      }
      return `every hour at minute ${cond.minute ?? 0}`;
    }
  }
}

export function describeRule(
  triggers: TriggerCondition[],
  filters: FilterCondition[],
  timeFormat: TimeFormat = "24h",
): string {
  const triggerTexts = triggers.map(t => describeCondition(t, timeFormat));
  const triggerPart =
    triggerTexts.length > 1
      ? triggerTexts.join(" or ")
      : (triggerTexts[0] ?? "");

  if (filters.length === 0) return triggerPart;

  const filterTexts = filters.map(f => describeCondition(f, timeFormat));
  const filterPart = filterTexts.join(", ");

  return `${triggerPart} (${filterPart})`;
}

export function formatExampleTimes(intervalMinutes: number): string {
  if (intervalMinutes <= 0) return "...";
  const times: string[] = [];
  const maxExamples = 4;
  for (
    let m = 0;
    m < 1440 && times.length < maxExamples;
    m += intervalMinutes
  ) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    times.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
  return times.join(", ") + ", ...";
}

export function validateCondition(
  cond: TimeCondition,
  basePath = "condition",
): ValidationIssue[] {
  const result = TimeConditionSchema.safeParse(cond);
  if (result.success) return [];

  return result.error.issues.map(issue => ({
    path: zodPathToString(issue.path, basePath),
    message: issue.message,
  }));
}

export function validateRule(
  triggers: TriggerCondition[],
  filters: FilterCondition[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (triggers.length === 0) {
    issues.push({
      path: "triggers",
      message: "At least one trigger is required.",
    });
  }

  triggers.forEach((t, i) => {
    issues.push(...validateCondition(t, `triggers[${i}]`));
  });

  filters.forEach((f, i) => {
    issues.push(...validateCondition(f, `filters[${i}]`));
  });

  return issues;
}
