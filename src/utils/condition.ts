import type { TimeFormat } from "@/types/alarm";
import type { AnyCondition } from "@/schemas/alarm";
import { AnyConditionSchema } from "@/schemas/alarm";
import { isCompoundCondition } from "./typeGuards";
import { formatTime, formatTimeRange } from "@/lib/dayjs";

export type { AnyCondition } from "@/schemas/alarm";

export interface ValidationIssue {
  path: string; // e.g., conditions[1].startHour
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
  cond: AnyCondition,
  timeFormat: TimeFormat = "24h",
): string {
  if (isCompoundCondition(cond)) {
    const childTexts = cond.conditions.map(c =>
      describeCondition(c, timeFormat),
    );
    const joined = childTexts.join(` ${cond.operator} `);
    return childTexts.length > 1 ? `(${joined})` : joined;
  }

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
      return `매 ${cond.intervalMinutes}분`;
    case "specific": {
      const h =
        cond.hour !== undefined
          ? formatTime(cond.hour, cond.minute ?? 0, timeFormat)
          : "모든 시간";
      if (cond.hour !== undefined) return h;
      const m = cond.minute !== undefined ? `${cond.minute}분` : "모든 분";
      return `${h} ${m}`;
    }
  }
}

export function validateCondition(
  cond: AnyCondition,
  basePath = "condition",
): ValidationIssue[] {
  const result = AnyConditionSchema.safeParse(cond);
  if (result.success) return [];

  return result.error.issues.map(issue => ({
    path: zodPathToString(issue.path, basePath),
    message: issue.message,
  }));
}
