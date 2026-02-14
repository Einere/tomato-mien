import type { TriggerCondition } from "@/types/alarm";
import {
  createDefaultInterval,
  createDefaultSpecific,
} from "@/utils/alarmRules";
import { Badge, Button, Icon, Panel } from "@tomato-mien/ui";
import { ConditionRow } from "./ConditionRow";

interface TriggerSectionProps {
  triggers: TriggerCondition[];
  onChange: (triggers: TriggerCondition[]) => void;
}

export function TriggerSection({ triggers, onChange }: TriggerSectionProps) {
  const updateTrigger = (index: number, updated: TriggerCondition) => {
    onChange(triggers.map((t, i) => (i === index ? updated : t)));
  };

  const deleteTrigger = (index: number) => {
    onChange(triggers.filter((_, i) => i !== index));
  };

  return (
    <Panel>
      <Panel.Header>
        <Panel.Label>
          <span className="text-overline text-subtle-foreground">
            Triggers (or)
          </span>
          <Badge>{triggers.length}</Badge>
        </Panel.Label>
        <Panel.Actions>
          <Button
            variant="ghost"
            className="text-xs"
            onClick={() => onChange([...triggers, createDefaultInterval()])}
          >
            <Icon name="add" size="sm" /> Interval
          </Button>
          <Button
            variant="ghost"
            className="text-xs"
            onClick={() => onChange([...triggers, createDefaultSpecific()])}
          >
            <Icon name="add" size="sm" /> Time
          </Button>
        </Panel.Actions>
      </Panel.Header>
      <Panel.Body>
        <div className="flex flex-col gap-2">
          {triggers.map((trigger, idx) => (
            <ConditionRow
              key={idx}
              condition={trigger}
              onChange={updated =>
                updateTrigger(idx, updated as TriggerCondition)
              }
              onDelete={() => deleteTrigger(idx)}
            />
          ))}
          {triggers.length === 0 && (
            <p className="text-caption text-muted-foreground py-2 text-center">
              At least one trigger is required.
            </p>
          )}
        </div>
      </Panel.Body>
    </Panel>
  );
}
