import type { TimeCondition } from "@/types/alarm";
import { Badge, Button, CloseIcon } from "@tomato-mien/ui";
import { TimeRangeInput } from "./ConditionInputs/TimeRangeInput";
import { IntervalInput } from "./ConditionInputs/IntervalInput";
import { SpecificTimeInput } from "./ConditionInputs/SpecificTimeInput";

interface ConditionRowProps {
  condition: TimeCondition;
  onChange: (updated: TimeCondition) => void;
  onDelete: () => void;
}

const typeLabels: Record<TimeCondition["type"], string> = {
  range: "Range",
  interval: "Interval",
  specific: "Specific",
};

const typeBadgeVariant: Record<
  TimeCondition["type"],
  "default" | "primary" | "success" | "warning" | "danger"
> = {
  range: "primary",
  interval: "success",
  specific: "warning",
};

export function ConditionRow({
  condition,
  onChange,
  onDelete,
}: ConditionRowProps) {
  return (
    <div className="bg-background squircle flex items-center gap-2 rounded-lg p-3">
      <Badge variant={typeBadgeVariant[condition.type]}>
        {typeLabels[condition.type]}
      </Badge>
      <div className="min-w-0 flex-1">
        {condition.type === "range" && (
          <TimeRangeInput condition={condition} onChange={c => onChange(c)} />
        )}
        {condition.type === "interval" && (
          <IntervalInput condition={condition} onChange={c => onChange(c)} />
        )}
        {condition.type === "specific" && (
          <SpecificTimeInput
            condition={condition}
            onChange={c => onChange(c)}
          />
        )}
      </div>
      <Button
        variant="ghost"
        onClick={onDelete}
        aria-label="Delete condition"
        className="h-7 w-7 shrink-0 p-0"
      >
        <CloseIcon size="sm" />
      </Button>
    </div>
  );
}
