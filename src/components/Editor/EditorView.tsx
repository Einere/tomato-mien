import { useState, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  rulesAtom,
  viewAtom,
  editorRuleIdAtom,
  updateRuleAtom,
  deleteRuleAtom,
} from "@/store";
import type {
  AlarmRule,
  TriggerCondition,
  FilterCondition,
} from "@/types/alarm";
import { createDefaultInterval } from "@/utils/alarmRules";
import { validateRule } from "@/utils/condition";
import { EditorHeader } from "./EditorHeader";
import { RuleNameInput } from "./RuleNameInput";
import { LogicTree } from "./LogicTree";
import { EditorSettings } from "./EditorSettings";
import { EditorSummary } from "./EditorSummary";
import { EditorFooter } from "./EditorFooter";
import { Button, DeleteOutlineIcon } from "@tomato-mien/ui";

export function EditorView() {
  const ruleId = useAtomValue(editorRuleIdAtom);
  const rules = useAtomValue(rulesAtom);
  const updateRule = useSetAtom(updateRuleAtom);
  const deleteRule = useSetAtom(deleteRuleAtom);
  const setView = useSetAtom(viewAtom);
  const setEditorRuleId = useSetAtom(editorRuleIdAtom);
  const existingRule = ruleId ? rules.find(r => r.id === ruleId) : undefined;
  const isNew = !existingRule;

  const [name, setName] = useState("");
  const [triggers, setTriggers] = useState<TriggerCondition[]>([
    createDefaultInterval(),
  ]);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [dirty, setDirty] = useState(false);

  const issues = validateRule(triggers, filters);
  const isValid = issues.length === 0;

  useEffect(() => {
    if (existingRule) {
      setName(existingRule.name);
      setTriggers(existingRule.triggers);
      setFilters(existingRule.filters);
      setNotificationEnabled(existingRule.notificationEnabled);
      setDirty(false);
    }
  }, [existingRule]);

  const handleNameChange = (v: string) => {
    setName(v);
    setDirty(true);
  };

  const handleTriggersChange = (t: TriggerCondition[]) => {
    setTriggers(t);
    setDirty(true);
  };

  const handleFiltersChange = (f: FilterCondition[]) => {
    setFilters(f);
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
      triggers,
      filters,
      createdAt: existingRule?.createdAt ?? now,
      updatedAt: now,
      notificationEnabled,
      activatedAt: existingRule?.activatedAt ?? now,
    };
    updateRule(updated);
    setEditorRuleId(null);
    setView("dashboard");
  };

  const handleCancel = () => {
    setEditorRuleId(null);
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
      <LogicTree
        triggers={triggers}
        filters={filters}
        onTriggersChange={handleTriggersChange}
        onFiltersChange={handleFiltersChange}
      />
      <EditorSummary triggers={triggers} filters={filters} issues={issues} />
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
            <DeleteOutlineIcon size="sm" />
            Delete Rule
          </Button>
        </div>
      )}
    </div>
  );
}
