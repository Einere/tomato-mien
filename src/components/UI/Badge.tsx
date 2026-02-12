import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type BadgeVariant = "default" | "primary" | "success";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary-100 text-primary-700",
  success: "bg-success-100 text-success-700",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "text-caption inline-flex items-center rounded-full px-2.5 py-0.5 font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
