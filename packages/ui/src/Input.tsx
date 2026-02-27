import { cn } from "./cn";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "border-border bg-surface text-body text-foreground placeholder:text-subtle-foreground focus:border-primary-500 focus:ring-ring rounded-lg border px-3 py-2.5 focus:ring-1 focus:outline-none",
        className,
      )}
      style={{ cornerShape: "squircle" }}
      {...props}
    />
  );
}
