import { atom } from "jotai";
import { rulesAtom, viewAtom, editorRuleIdAtom } from "./atoms";
import type { AlarmRule } from "@/types/alarm";
import { createDefaultInterval } from "@/utils/alarmRules";

export const addRuleAtom = atom(null, (get, set) => {
  const now = new Date();
  const newRule: AlarmRule = {
    id: crypto.randomUUID(),
    name: "New Rule",
    enabled: true,
    triggers: [createDefaultInterval()],
    filters: [],
    createdAt: now,
    updatedAt: now,
    notificationEnabled: true,
    activatedAt: now,
  };
  set(rulesAtom, [...get(rulesAtom), newRule]);
  set(editorRuleIdAtom, newRule.id);
  set(viewAtom, "editor");
});

export const updateRuleAtom = atom(null, (get, set, updatedRule: AlarmRule) => {
  set(
    rulesAtom,
    get(rulesAtom).map(r =>
      r.id === updatedRule.id ? { ...updatedRule, updatedAt: new Date() } : r,
    ),
  );
});

export const deleteRuleAtom = atom(null, (get, set, ruleId: string) => {
  set(
    rulesAtom,
    get(rulesAtom).filter(r => r.id !== ruleId),
  );
  set(editorRuleIdAtom, null);
  set(viewAtom, "dashboard");
});

export const toggleRuleAtom = atom(null, (get, set, ruleId: string) => {
  const now = new Date();
  set(
    rulesAtom,
    get(rulesAtom).map(r =>
      r.id === ruleId
        ? {
            ...r,
            enabled: !r.enabled,
            ...(!r.enabled && { activatedAt: now }),
          }
        : r,
    ),
  );
});

export const enableAllRulesAtom = atom(null, (get, set) => {
  const now = new Date();
  set(
    rulesAtom,
    get(rulesAtom).map(r => ({
      ...r,
      enabled: true,
      ...(!r.enabled && { activatedAt: now }),
    })),
  );
});

export const disableAllRulesAtom = atom(null, (get, set) => {
  set(
    rulesAtom,
    get(rulesAtom).map(r => ({ ...r, enabled: false })),
  );
});
