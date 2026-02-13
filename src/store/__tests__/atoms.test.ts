import { describe, it, expect, beforeEach } from "vitest";
import { createStore } from "jotai";
import {
  rulesAtom,
  addRuleAtom,
  updateRuleAtom,
  deleteRuleAtom,
  toggleRuleAtom,
  enableAllRulesAtom,
  disableAllRulesAtom,
  viewAtom,
  editorRuleIdAtom,
} from "@/store";
import type { AlarmRule } from "@/types/alarm";
import { db } from "@/db/database";

function createTestRule(overrides?: Partial<AlarmRule>): AlarmRule {
  return {
    id: crypto.randomUUID(),
    name: "Test Rule",
    enabled: true,
    condition: { type: "interval", intervalMinutes: 15 },
    createdAt: new Date(),
    updatedAt: new Date(),
    notificationEnabled: true,
    ...overrides,
  };
}

beforeEach(async () => {
  await db.rules.clear();
  await db.settings.clear();
  await db.metadata.clear();
});

describe("rulesAtom CRUD", () => {
  it("starts with empty rules", () => {
    const store = createStore();
    expect(store.get(rulesAtom)).toEqual([]);
  });

  it("addRuleAtom creates a new rule and navigates to editor", () => {
    const store = createStore();
    store.set(addRuleAtom);

    const rules = store.get(rulesAtom);
    expect(rules).toHaveLength(1);
    expect(rules[0].name).toBe("New Rule");
    expect(rules[0].enabled).toBe(true);
    expect(rules[0].notificationEnabled).toBe(true);

    expect(store.get(viewAtom)).toBe("editor");
    expect(store.get(editorRuleIdAtom)).toBe(rules[0].id);
  });

  it("updateRuleAtom updates an existing rule", () => {
    const store = createStore();
    const rule = createTestRule({ name: "Original" });
    store.set(rulesAtom, [rule]);

    store.set(updateRuleAtom, { ...rule, name: "Updated" });

    const rules = store.get(rulesAtom);
    expect(rules[0].name).toBe("Updated");
  });

  it("deleteRuleAtom removes the rule and navigates to dashboard", () => {
    const store = createStore();
    const rule = createTestRule();
    store.set(rulesAtom, [rule]);
    store.set(editorRuleIdAtom, rule.id);
    store.set(viewAtom, "editor");

    store.set(deleteRuleAtom, rule.id);

    expect(store.get(rulesAtom)).toHaveLength(0);
    expect(store.get(editorRuleIdAtom)).toBeNull();
    expect(store.get(viewAtom)).toBe("dashboard");
  });

  it("toggleRuleAtom flips enabled state", () => {
    const store = createStore();
    const rule = createTestRule({ enabled: true });
    store.set(rulesAtom, [rule]);

    store.set(toggleRuleAtom, rule.id);
    expect(store.get(rulesAtom)[0].enabled).toBe(false);

    store.set(toggleRuleAtom, rule.id);
    expect(store.get(rulesAtom)[0].enabled).toBe(true);
  });

  it("toggleRuleAtom does not update updatedAt", () => {
    const store = createStore();
    const fixedDate = new Date("2024-01-01T00:00:00Z");
    const rule = createTestRule({ enabled: true, updatedAt: fixedDate });
    store.set(rulesAtom, [rule]);

    store.set(toggleRuleAtom, rule.id);
    expect(store.get(rulesAtom)[0].updatedAt).toEqual(fixedDate);
  });

  it("enableAllRulesAtom enables all rules", () => {
    const store = createStore();
    store.set(rulesAtom, [
      createTestRule({ enabled: false }),
      createTestRule({ enabled: false }),
    ]);

    store.set(enableAllRulesAtom);
    const rules = store.get(rulesAtom);
    expect(rules.every(r => r.enabled)).toBe(true);
  });

  it("disableAllRulesAtom disables all rules", () => {
    const store = createStore();
    store.set(rulesAtom, [
      createTestRule({ enabled: true }),
      createTestRule({ enabled: true }),
    ]);

    store.set(disableAllRulesAtom);
    const rules = store.get(rulesAtom);
    expect(rules.every(r => !r.enabled)).toBe(true);
  });
});
