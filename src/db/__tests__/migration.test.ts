import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/db/database";
import { runMigration } from "@/db/migration";

beforeEach(async () => {
  await db.rules.clear();
  await db.settings.clear();
  await db.metadata.clear();
});

describe("runMigration", () => {
  it("hydrates rules cache from Dexie", async () => {
    await db.rules.add({
      id: crypto.randomUUID(),
      name: "DB Rule",
      enabled: true,
      triggers: [{ type: "interval", intervalMinutes: 30 }],
      filters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      notificationEnabled: true,
    });

    await runMigration();

    const rules = await db.rules.toArray();
    expect(rules).toHaveLength(1);
    expect(rules[0].name).toBe("DB Rule");
  });

  it("hydrates settings cache from Dexie", async () => {
    await db.settings.put({ id: "default", timeFormat: "12h" });

    await runMigration();

    const settings = await db.settings.get("default");
    expect(settings).toBeDefined();
    expect(settings!.timeFormat).toBe("12h");
  });

  it("handles empty database gracefully", async () => {
    await runMigration();

    const rules = await db.rules.toArray();
    expect(rules).toHaveLength(0);
  });

  it("is idempotent - multiple runs do not cause errors", async () => {
    await db.rules.add({
      id: crypto.randomUUID(),
      name: "Rule A",
      enabled: true,
      triggers: [{ type: "interval", intervalMinutes: 15 }],
      filters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      notificationEnabled: true,
    });

    await runMigration();
    await runMigration();

    const rules = await db.rules.toArray();
    expect(rules).toHaveLength(1);
  });
});
