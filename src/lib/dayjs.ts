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
  const d = dayjs().hour(hour).minute(minute);
  return format === "12h" ? d.format("A h:mm") : d.format("HH:mm");
}

export function formatTimeRange(
  startH: number,
  startM: number,
  endH: number,
  endM: number,
  format: TimeFormat,
): string {
  return `${formatTime(startH, startM, format)}\u2013${formatTime(endH, endM, format)}`;
}

export function formatTimeValue(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}
