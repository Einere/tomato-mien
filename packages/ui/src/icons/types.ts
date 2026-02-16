export interface IconProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const sizeMap = {
  sm: 18,
  md: 24,
  lg: 32,
} as const;
