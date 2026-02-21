import { cn } from "../cn";
import type { IconProps } from "./types";
import { sizeMap } from "./types";

export function WindowsIcon({ className, size = "md" }: IconProps) {
  const px = sizeMap[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("inline-block shrink-0 leading-none", className)}
      aria-hidden="true"
    >
      <path d="M3 12V6.75l8-1.25V12H3zm0 .5h8v6.5l-8-1.25V12.5zM11.5 5.35l9.5-1.6V12h-9.5V5.35zM11.5 12.5H21v7.75l-9.5-1.6V12.5z" />
    </svg>
  );
}
