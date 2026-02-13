import { atom } from "jotai";
import { rulesAtom, viewAtom } from "./atoms";
import type { AlarmRule } from "@/types/alarm";
import { createDefaultCompound } from "@/utils/alarmRules";

export const addRuleAtom = atom(null, (get, set) => {
  const now = new Date();
  const newRule: AlarmRule = {
    id: crypto.randomUUID(),
    name: "New Rule",
    enabled: true,
    condition: createDefaultCompound("AND"),
    createdAt: now,
    updatedAt: now,
    notificationEnabled: true,
  };
  set(rulesAtom, [...get(rulesAtom), newRule]);
  set(viewAtom, { view: "editor", ruleId: newRule.id });
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
  set(viewAtom, "dashboard");
});

export const toggleRuleAtom = atom(null, (get, set, ruleId: string) => {
  set(
    rulesAtom,
    get(rulesAtom).map(r =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r,
    ),
  );
});

export const enableAllRulesAtom = atom(null, (get, set) => {
  set(
    rulesAtom,
    get(rulesAtom).map(r => ({ ...r, enabled: true })),
  );
});

export const disableAllRulesAtom = atom(null, (get, set) => {
  set(
    rulesAtom,
    get(rulesAtom).map(r => ({ ...r, enabled: false })),
  );
});
