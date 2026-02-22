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

export function describeSchedule(
  scheduledEnableAt: Date | undefined,
  timeFormat: TimeFormat = "24h",
): string {
  if (!scheduledEnableAt) return "";
  const d = new Date(scheduledEnableAt);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const time = formatTime(d.getHours(), d.getMinutes(), timeFormat);
  return `Scheduled at ${month}/${day} ${time}`;
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
