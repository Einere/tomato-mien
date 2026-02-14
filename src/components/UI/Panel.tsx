import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card } from "./Card";

interface PanelRootProps {
  children: ReactNode;
  className?: string;
}

function PanelRoot({ children, className }: PanelRootProps) {
  return <div className={className}>{children}</div>;
}

function PanelHeader({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">{children}</div>
  );
}

function PanelLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>{children}</div>
  );
}

function PanelActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-1">{children}</div>;
}

function PanelBody({ children }: { children: ReactNode }) {
  return <Card padding="sm">{children}</Card>;
}

export const Panel = Object.assign(PanelRoot, {
  Header: PanelHeader,
  Label: PanelLabel,
  Actions: PanelActions,
  Body: PanelBody,
});
