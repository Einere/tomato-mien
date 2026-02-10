import { clsx } from "clsx";

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
      className={clsx(
        "material-icons-outlined select-none leading-none",
        sizeMap[size],
        className,
      )}
    >
      {name}
    </span>
  );
}
