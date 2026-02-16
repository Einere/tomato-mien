import { cn } from "../cn";
import type { IconProps } from "./types";
import { sizeMap } from "./types";

export function AddIcon({ className, size = "md" }: IconProps) {
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
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}
