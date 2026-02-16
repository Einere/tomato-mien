import { cn } from "../cn";
import type { IconProps } from "./types";
import { sizeMap } from "./types";

export function CodeIcon({ className, size = "md" }: IconProps) {
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
      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
    </svg>
  );
}
