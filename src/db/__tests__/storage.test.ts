import { describe, it, expect, beforeEach } from "vitest";
import { z } from "zod";
import { db } from "@/db/database";
import { AlarmRuleSchema } from "@/schemas/alarm";
import {
  createDexieArrayStorage,
  createDexieSingleRowStorage,
  hydrateArrayStorage,
  hydrateSingleRowStorage,
} from "@/db/storage";
import type { AlarmRule, AppSettings } from "@/types/alarm";

const AlarmRulesArraySchema = z.array(AlarmRuleSchema);

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
    ...overrides,
  };
}

beforeEach(async () => {
  await db.rules.clear();
  await db.settings.clear();
  await db.metadata.clear();
});

describe("createDexieArrayStorage", () => {
  const RULES_KEY = "test-rules";
  const storage = createDexieArrayStorage(db.rules, AlarmRulesArraySchema);

  it("getItem returns initialValue when cache is not hydrated", () => {
    const result = storage.getItem(RULES_KEY, []);
    expect(result).toEqual([]);
  });

  it("hydrateArrayStorage populates cache from DB", async () => {
    const rule = createTestRule({ name: "DB Rule" });
    await db.rules.add(rule);

    await hydrateArrayStorage(RULES_KEY, db.rules, AlarmRulesArraySchema, []);

    const result = storage.getItem(RULES_KEY, []);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("DB Rule");
  });

  it("setItem updates cache synchronously and persists to DB", async () => {
    const rules = [createTestRule({ name: "Rule A" })];
    storage.setItem(RULES_KEY, rules);

    // Cache is updated synchronously
    const cached = storage.getItem(RULES_KEY, []);
    expect(cached).toHaveLength(1);
    expect(cached[0].name).toBe("Rule A");

    // Wait for async DB write
    await new Promise(resolve => setTimeout(resolve, 100));
    const dbRules = await db.rules.toArray();
    expect(dbRules).toHaveLength(1);
    expect(dbRules[0].name).toBe("Rule A");
  });

  it("setItem replaces all existing data", async () => {
    storage.setItem(RULES_KEY, [createTestRule({ name: "A" })]);
    storage.setItem(RULES_KEY, [
      createTestRule({ name: "B" }),
      createTestRule({ name: "C" }),
    ]);

    const result = storage.getItem(RULES_KEY, []);
    expect(result).toHaveLength(2);
    expect(result.map(r => r.name).sort()).toEqual(["B", "C"]);
  });

  it("removeItem clears cache", () => {
    storage.setItem(RULES_KEY, [createTestRule()]);
    storage.removeItem(RULES_KEY);

    const result = storage.getItem(RULES_KEY, []);
    expect(result).toEqual([]);
  });

  it("hydrateArrayStorage falls back to initialValue on Zod validation failure", async () => {
    await db.rules.add({ id: "bad", name: 123 } as unknown as AlarmRule);

    const fallback = [createTestRule({ name: "Fallback" })];
    await hydrateArrayStorage(
      RULES_KEY,
      db.rules,
      AlarmRulesArraySchema,
      fallback,
    );

    const result = storage.getItem(RULES_KEY, []);
    expect(result[0].name).toBe("Fallback");
  });
});

describe("createDexieSingleRowStorage", () => {
  const SETTINGS_KEY = "test-settings";
  const schema = z.object({
    timeFormat: z.enum(["12h", "24h"]),
    theme: z.enum(["system", "light", "dark"]).optional(),
  });
  const storage = createDexieSingleRowStorage(db.settings, schema);
  const initialValue: AppSettings = { timeFormat: "24h" };

  it("getItem returns initialValue when cache is not hydrated", () => {
    const result = storage.getItem(SETTINGS_KEY, initialValue);
    expect(result).toEqual({ timeFormat: "24h" });
  });

  it("hydrateSingleRowStorage populates cache from DB", async () => {
    await db.settings.put({ id: "default", timeFormat: "12h" });

    await hydrateSingleRowStorage(
      SETTINGS_KEY,
      db.settings,
      schema,
      initialValue,
    );

    const result = storage.getItem(SETTINGS_KEY, initialValue);
    expect(result).toEqual({ timeFormat: "12h" });
  });

  it("setItem updates cache synchronously", () => {
    storage.setItem(SETTINGS_KEY, { timeFormat: "12h" });

    const result = storage.getItem(SETTINGS_KEY, initialValue);
    expect(result).toEqual({ timeFormat: "12h" });
  });

  it("removeItem clears cache and falls back to initialValue", () => {
    storage.setItem(SETTINGS_KEY, { timeFormat: "12h" });
    storage.removeItem(SETTINGS_KEY);

    const result = storage.getItem(SETTINGS_KEY, initialValue);
    expect(result).toEqual({ timeFormat: "24h" });
  });
});
