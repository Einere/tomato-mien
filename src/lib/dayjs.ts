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
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0,
  );
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}
