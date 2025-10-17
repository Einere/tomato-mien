import type { PropsWithChildren } from "react";

export function Badge(props: PropsWithChildren) {
  const { children } = props;

  return (
    <span className="px-2 py-1 bg-gray-200 text-secondary text-xs rounded">
      {children}
    </span>
  )
}