import type {
  ComponentPropsWithoutRef,
  ComponentType,
  ElementType,
  ReactNode,
} from "react";
import { cn } from "./cn";
import type { IconProps } from "./icons";

type MenuRowProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

function MenuRowRoot<T extends ElementType = "div">({
  as,
  children,
  className,
  ...rest
}: MenuRowProps<T>) {
  const Component = as ?? "div";
  return (
    <Component
      className={cn("flex items-center gap-3 p-4", className)}
      {...rest}
    >
      {children}
    </Component>
  );
}

function MenuRowIcon({
  icon: IconComponent,
  className,
}: {
  icon: ComponentType<IconProps>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-accent text-accent-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
        className,
      )}
      style={{ cornerShape: "squircle" }}
    >
      <IconComponent />
    </div>
  );
}

function MenuRowLabel({
  title,
  description,
  truncate = false,
  className,
}: {
  title: string;
  description?: string;
  truncate?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 flex-1", className)}>
      <p
        className={cn(
          "text-body text-foreground font-semibold",
          truncate && "truncate",
        )}
      >
        {title}
      </p>
      {description && (
        <p
          className={cn(
            "text-caption text-muted-foreground",
            truncate && "truncate",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export const MenuRow = Object.assign(MenuRowRoot, {
  Icon: MenuRowIcon,
  Label: MenuRowLabel,
});
