import { cn } from "../cn";
import type { IconProps } from "./types";
import { sizeMap } from "./types";

export function WarningIcon({ className, size = "md" }: IconProps) {
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
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  );
}
