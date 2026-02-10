import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md';
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
} as const;

export function Card({
  className,
  padding = 'md',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl bg-white shadow-sm',
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
