import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";
import type { TimeFormat } from "@/types/alarm";

dayjs.extend(relativeTime);
dayjs.locale("ko");

export function formatTime(
  hour: number,
  minute: number,
  format: TimeFormat,
): string {
  if (format === "12h") {
    const period = hour < 12 ? "AM" : "PM";
    const h = hour % 12 || 12;
    const m = minute.toString().padStart(2, "0");
    return `${h}:${m} ${period}`;
  }
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

export function formatTimeRange(
  startH: number,
  startM: number,
  endH: number,
  endM: number,
  format: TimeFormat,
): string {
  return `from ${formatTime(startH, startM, format)} to ${formatTime(endH, endM, format)}`;
}

export function formatTimeValue(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

export function timeToDate(timeStr: string): Date {
  const parts = timeStr.split(":");
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new Error(`Invalid time format: "${timeStr}". Expected "HH:mm".`);
  }
  const now = dayjs();
  let target = now.hour(hours).minute(minutes).second(0).millisecond(0);
  if (!target.isAfter(now)) {
    target = target.add(1, "day");
  }
  return target.toDate();
}

export function getMinTimeValue(): string {
  const min = dayjs().add(1, "minute");
  return formatTimeValue(min.hour(), min.minute());
}

export function isTimeAfterNow(timeStr: string): boolean {
  const parts = timeStr.split(":");
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return false;
  const now = dayjs();
  const target = now.hour(hours).minute(minutes).second(0).millisecond(0);
  return target.isAfter(now);
}
