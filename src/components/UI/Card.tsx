import clsx from "clsx";
import type { PropsWithChildren } from "react";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={clsx("bg-white rounded-lg shadow-sm border border-gray-200", className)}>
      {children}
    </div>
  )
}