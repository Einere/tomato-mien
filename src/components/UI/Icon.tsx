import { cn } from "@/lib/cn";

interface IconProps {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "text-[18px]",
  md: "text-[24px]",
  lg: "text-[32px]",
} as const;

export function Icon({ name, className, size = "md" }: IconProps) {
  return (
    <span
      className={cn(
        "material-icons-outlined leading-none select-none",
        sizeMap[size],
        className,
      )}
    >
      {name}
    </span>
  );
}
