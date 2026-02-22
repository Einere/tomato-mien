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
  scheduleRuleEnableAtom,
  activateScheduledRulesAtom,
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
    triggers: [{ type: "interval", intervalMinutes: 15 }],
    filters: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    notificationEnabled: true,
    activatedAt: new Date(),
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
    expect(rules[0].activatedAt).toBeInstanceOf(Date);

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

  it("toggleRuleAtom sets activatedAt when enabling", () => {
    const store = createStore();
    const oldDate = new Date("2024-01-01T00:00:00Z");
    const rule = createTestRule({ enabled: false, activatedAt: oldDate });
    store.set(rulesAtom, [rule]);

    store.set(toggleRuleAtom, rule.id);
    const updatedRule = store.get(rulesAtom)[0];
    expect(updatedRule.enabled).toBe(true);
    expect(updatedRule.activatedAt!.getTime()).toBeGreaterThan(
      oldDate.getTime(),
    );
  });

  it("toggleRuleAtom preserves activatedAt when disabling", () => {
    const store = createStore();
    const activatedDate = new Date("2024-06-15T10:30:00Z");
    const rule = createTestRule({
      enabled: true,
      activatedAt: activatedDate,
    });
    store.set(rulesAtom, [rule]);

    store.set(toggleRuleAtom, rule.id);
    const updatedRule = store.get(rulesAtom)[0];
    expect(updatedRule.enabled).toBe(false);
    expect(updatedRule.activatedAt).toEqual(activatedDate);
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

  it("enableAllRulesAtom sets activatedAt for disabled rules only", () => {
    const store = createStore();
    const oldDate = new Date("2024-01-01T00:00:00Z");
    const alreadyEnabled = createTestRule({
      enabled: true,
      activatedAt: oldDate,
    });
    const disabled = createTestRule({
      enabled: false,
      activatedAt: oldDate,
    });
    store.set(rulesAtom, [alreadyEnabled, disabled]);

    store.set(enableAllRulesAtom);
    const rules = store.get(rulesAtom);

    // 이미 활성이었던 규칙: activatedAt 유지
    expect(rules[0].activatedAt).toEqual(oldDate);
    // 비활성이었던 규칙: activatedAt 갱신
    expect(rules[1].activatedAt!.getTime()).toBeGreaterThan(oldDate.getTime());
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

  it("toggleRuleAtom clears scheduledEnableAt when enabling", () => {
    const store = createStore();
    const futureDate = new Date("2024-12-01T09:00:00Z");
    const rule = createTestRule({
      enabled: false,
      scheduledEnableAt: futureDate,
    });
    store.set(rulesAtom, [rule]);

    store.set(toggleRuleAtom, rule.id);
    const updated = store.get(rulesAtom)[0];
    expect(updated.enabled).toBe(true);
    expect(updated.scheduledEnableAt).toBeUndefined();
  });

  it("enableAllRulesAtom clears scheduledEnableAt for disabled rules", () => {
    const store = createStore();
    const futureDate = new Date("2024-12-01T09:00:00Z");
    const rule = createTestRule({
      enabled: false,
      scheduledEnableAt: futureDate,
    });
    store.set(rulesAtom, [rule]);

    store.set(enableAllRulesAtom);
    const updated = store.get(rulesAtom)[0];
    expect(updated.enabled).toBe(true);
    expect(updated.scheduledEnableAt).toBeUndefined();
  });

  it("scheduleRuleEnableAtom sets scheduledEnableAt", () => {
    const store = createStore();
    const rule = createTestRule({ enabled: false });
    store.set(rulesAtom, [rule]);

    const futureDate = new Date("2024-12-01T09:00:00Z");
    store.set(scheduleRuleEnableAtom, {
      ruleId: rule.id,
      scheduledEnableAt: futureDate,
    });
    const updated = store.get(rulesAtom)[0];
    expect(updated.scheduledEnableAt).toEqual(futureDate);
  });

  it("scheduleRuleEnableAtom clears scheduledEnableAt with undefined", () => {
    const store = createStore();
    const futureDate = new Date("2024-12-01T09:00:00Z");
    const rule = createTestRule({
      enabled: false,
      scheduledEnableAt: futureDate,
    });
    store.set(rulesAtom, [rule]);

    store.set(scheduleRuleEnableAtom, {
      ruleId: rule.id,
      scheduledEnableAt: undefined,
    });
    const updated = store.get(rulesAtom)[0];
    expect(updated.scheduledEnableAt).toBeUndefined();
  });
});

describe("activateScheduledRulesAtom", () => {
  it("activates target rules and clears scheduledEnableAt", () => {
    const store = createStore();
    const rule = createTestRule({
      enabled: false,
      scheduledEnableAt: new Date("2024-12-01T09:00:00Z"),
    });
    store.set(rulesAtom, [rule]);

    store.set(activateScheduledRulesAtom, [rule.id]);
    const updated = store.get(rulesAtom)[0];
    expect(updated.enabled).toBe(true);
    expect(updated.activatedAt).toBeInstanceOf(Date);
    expect(updated.scheduledEnableAt).toBeUndefined();
    expect(updated.updatedAt).toBeInstanceOf(Date);
  });

  it("does not modify rules not in the target list", () => {
    const store = createStore();
    const target = createTestRule({
      enabled: false,
      scheduledEnableAt: new Date("2024-12-01T09:00:00Z"),
    });
    const other = createTestRule({
      enabled: false,
      scheduledEnableAt: new Date("2024-12-01T10:00:00Z"),
    });
    store.set(rulesAtom, [target, other]);

    store.set(activateScheduledRulesAtom, [target.id]);
    const rules = store.get(rulesAtom);
    expect(rules[0].enabled).toBe(true);
    expect(rules[1].enabled).toBe(false);
    expect(rules[1].scheduledEnableAt).toEqual(
      new Date("2024-12-01T10:00:00Z"),
    );
  });

  it("is idempotent — calling twice does not cause errors", () => {
    const store = createStore();
    const rule = createTestRule({
      enabled: false,
      scheduledEnableAt: new Date("2024-12-01T09:00:00Z"),
    });
    store.set(rulesAtom, [rule]);

    store.set(activateScheduledRulesAtom, [rule.id]);
    store.set(activateScheduledRulesAtom, [rule.id]);
    const updated = store.get(rulesAtom)[0];
    expect(updated.enabled).toBe(true);
    expect(updated.scheduledEnableAt).toBeUndefined();
  });
});
