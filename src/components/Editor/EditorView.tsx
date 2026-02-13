import { useState, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { rulesAtom, viewAtom, updateRuleAtom, deleteRuleAtom } from "@/store";
import type {
  AlarmRule,
  TimeCondition,
  CompoundCondition,
} from "@/types/alarm";
import { createDefaultCompound } from "@/utils/alarmRules";
import { validateCondition } from "@/utils/condition";
import { EditorHeader } from "./EditorHeader";
import { RuleNameInput } from "./RuleNameInput";
import { LogicTree } from "./LogicTree";
import { EditorSettings } from "./EditorSettings";
import { EditorSummary } from "./EditorSummary";
import { EditorFooter } from "./EditorFooter";
import { Button } from "@/components/UI/Button";
import { Icon } from "@/components/UI/Icon";

export function EditorView() {
  const view = useAtomValue(viewAtom);
  const rules = useAtomValue(rulesAtom);
  const updateRule = useSetAtom(updateRuleAtom);
  const deleteRule = useSetAtom(deleteRuleAtom);
  const setView = useSetAtom(viewAtom);

  const ruleId =
    typeof view === "object" && view.view === "editor" ? view.ruleId : null;
  const existingRule = ruleId ? rules.find(r => r.id === ruleId) : undefined;
  const isNew = !existingRule;

  const [name, setName] = useState("");
  const [condition, setCondition] = useState<TimeCondition | CompoundCondition>(
    createDefaultCompound("AND"),
  );
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [dirty, setDirty] = useState(false);

  const issues = validateCondition(condition);
  const isValid = issues.length === 0;

  useEffect(() => {
    if (existingRule) {
      setName(existingRule.name);
      setCondition(existingRule.condition);
      setNotificationEnabled(existingRule.notificationEnabled);
      setDirty(false);
    }
  }, [existingRule]);

  const handleNameChange = (v: string) => {
    setName(v);
    setDirty(true);
  };

  const handleConditionChange = (c: TimeCondition | CompoundCondition) => {
    setCondition(c);
    setDirty(true);
  };

  const handleNotificationEnabledChange = (v: boolean) => {
    setNotificationEnabled(v);
    setDirty(true);
  };

  const handleSave = () => {
    if (!ruleId) return;
    const now = new Date();
    const updated: AlarmRule = {
      id: ruleId,
      name: name || "Untitled Rule",
      enabled: existingRule?.enabled ?? true,
      condition,
      createdAt: existingRule?.createdAt ?? now,
      updatedAt: now,
      notificationEnabled,
    };
    updateRule(updated);
    setView("dashboard");
  };

  const handleCancel = () => {
    setView("dashboard");
  };

  const handleDelete = () => {
    if (ruleId && window.confirm("Delete this rule?")) {
      deleteRule(ruleId);
    }
  };

  return (
    <div className="pb-4">
      <EditorHeader isNew={isNew} />
      <RuleNameInput value={name} onChange={handleNameChange} />
      <LogicTree condition={condition} onChange={handleConditionChange} />
      <EditorSummary condition={condition} issues={issues} />
      <EditorSettings
        notificationEnabled={notificationEnabled}
        onNotificationEnabledChange={handleNotificationEnabledChange}
      />
      <EditorFooter
        onCancel={handleCancel}
        onSave={handleSave}
        hasChanges={dirty}
        isValid={isValid}
      />
      {!isNew && (
        <div className="px-5 pb-2">
          <Button color="danger" className="w-full" onClick={handleDelete}>
            <Icon name="delete_outline" size="sm" />
            Delete Rule
          </Button>
        </div>
      )}
    </div>
  );
}
