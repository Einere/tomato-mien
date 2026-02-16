import { cn } from "../cn";
import type { IconProps } from "./types";
import { sizeMap } from "./types";

export function ChevronRightIcon({ className, size = "md" }: IconProps) {
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
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
    </svg>
  );
}
