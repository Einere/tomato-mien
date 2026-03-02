interface CycleIndicatorProps {
  completed: number;
  total: number;
}

export function CycleIndicator({ completed, total }: CycleIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            data-testid="cycle-dot"
            data-completed={i < completed}
            className={`inline-block h-3 w-3 rounded-full ${
              i < completed ? "bg-primary-600" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {completed} / {total}
      </span>
    </div>
  );
}
