import { clsx } from 'clsx';
import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-600',
  primary: 'bg-tomato-100 text-tomato-700',
  success: 'bg-emerald-100 text-emerald-700',
};

export function Badge({
  children,
  variant = 'default',
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
