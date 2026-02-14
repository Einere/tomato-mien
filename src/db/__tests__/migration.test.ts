import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/db/database";
import { runMigration } from "@/db/migration";

const RULES_KEY = "tomato-mien-rules";
const SETTINGS_KEY = "tomato-mien-settings";

function createLocalStorageRule() {
  return {
    id: crypto.randomUUID(),
    name: "LS Rule",
    enabled: true,
    triggers: [{ type: "interval", intervalMinutes: 30 }],
    filters: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notificationEnabled: true,
  };
}

beforeEach(async () => {
  await db.rules.clear();
  await db.settings.clear();
  await db.metadata.clear();
  localStorage.clear();
});

describe("runMigration", () => {
  it("migrates rules from localStorage to IndexedDB", async () => {
    const rule = createLocalStorageRule();
    localStorage.setItem(RULES_KEY, JSON.stringify([rule]));

    await runMigration();

    const rules = await db.rules.toArray();
    expect(rules).toHaveLength(1);
    expect(rules[0].name).toBe("LS Rule");
    expect(rules[0].createdAt).toBeInstanceOf(Date);
  });

  it("migrates settings from localStorage to IndexedDB", async () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ timeFormat: "12h" }));

    await runMigration();

    const settings = await db.settings.get("default");
    expect(settings).toBeDefined();
    expect(settings!.timeFormat).toBe("12h");
  });

  it("removes localStorage keys after migration", async () => {
    localStorage.setItem(RULES_KEY, JSON.stringify([createLocalStorageRule()]));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ timeFormat: "24h" }));

    await runMigration();

    expect(localStorage.getItem(RULES_KEY)).toBeNull();
    expect(localStorage.getItem(SETTINGS_KEY)).toBeNull();
  });

  it("is idempotent - second run does not duplicate data", async () => {
    const rule = createLocalStorageRule();
    localStorage.setItem(RULES_KEY, JSON.stringify([rule]));

    await runMigration();

    // Re-add to localStorage to simulate a scenario
    localStorage.setItem(RULES_KEY, JSON.stringify([createLocalStorageRule()]));

    await runMigration();

    const rules = await db.rules.toArray();
    expect(rules).toHaveLength(1);
  });

  it("handles empty localStorage gracefully", async () => {
    await runMigration();

    const rules = await db.rules.toArray();
    expect(rules).toHaveLength(0);

    const migrated = await db.metadata.get("migrated");
    expect(migrated?.value).toBe(true);
  });

  it("handles invalid JSON in localStorage gracefully", async () => {
    localStorage.setItem(RULES_KEY, "not valid json{{{");

    await runMigration();

    const rules = await db.rules.toArray();
    expect(rules).toHaveLength(0);

    const migrated = await db.metadata.get("migrated");
    expect(migrated?.value).toBe(true);
  });

  it("handles invalid rule data in localStorage gracefully", async () => {
    localStorage.setItem(RULES_KEY, JSON.stringify([{ id: "bad" }]));

    await runMigration();

    const rules = await db.rules.toArray();
    expect(rules).toHaveLength(0);
  });
});
