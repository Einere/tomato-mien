import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "shadow-sm",
        secondary: "border shadow-sm",
        ghost: "",
      },
      color: {
        default: "",
        danger: "",
      },
    },
    compoundVariants: [
      // primary
      {
        variant: "primary",
        color: "default",
        class:
          "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
      },
      {
        variant: "primary",
        color: "danger",
        class:
          "bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800",
      },
      // secondary
      {
        variant: "secondary",
        color: "default",
        class:
          "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:bg-slate-100",
      },
      {
        variant: "secondary",
        color: "danger",
        class:
          "bg-white text-danger-600 border-danger-200 hover:bg-danger-50 active:bg-danger-100",
      },
      // ghost
      {
        variant: "ghost",
        color: "default",
        class: "text-slate-600 hover:bg-slate-100 active:bg-slate-200",
      },
      {
        variant: "ghost",
        color: "danger",
        class: "text-danger-500 hover:bg-danger-50 active:bg-danger-100",
      },
    ],
    defaultVariants: {
      variant: "primary",
      color: "default",
    },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

interface ButtonProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    ButtonVariants {
  loading?: boolean;
}

export function Button({
  variant,
  color,
  className,
  children,
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={clsx(buttonVariants({ variant, color }), className)}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
