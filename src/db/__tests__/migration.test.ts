import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/db/database";
import { runMigration, processExpiredSchedules } from "@/db/migration";

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

describe("processExpiredSchedules", () => {
  it("activates rules with expired scheduledEnableAt", async () => {
    const pastDate = new Date(Date.now() - 60_000); // 1분 전
    await db.rules.add({
      id: "rule-1",
      name: "Expired Schedule",
      enabled: false,
      triggers: [{ type: "interval", intervalMinutes: 15 }],
      filters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      notificationEnabled: true,
      scheduledEnableAt: pastDate,
    });

    await processExpiredSchedules();

    const rule = await db.rules.get("rule-1");
    expect(rule!.enabled).toBe(true);
    expect(rule!.activatedAt).toBeInstanceOf(Date);
    expect(rule!.scheduledEnableAt).toBeUndefined();
  });

  it("preserves rules with future scheduledEnableAt", async () => {
    const futureDate = new Date(Date.now() + 3_600_000); // 1시간 후
    await db.rules.add({
      id: "rule-2",
      name: "Future Schedule",
      enabled: false,
      triggers: [{ type: "interval", intervalMinutes: 15 }],
      filters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      notificationEnabled: true,
      scheduledEnableAt: futureDate,
    });

    await processExpiredSchedules();

    const rule = await db.rules.get("rule-2");
    expect(rule!.enabled).toBe(false);
    expect(rule!.scheduledEnableAt).toEqual(futureDate);
  });

  it("ignores already enabled rules", async () => {
    const pastDate = new Date(Date.now() - 60_000);
    const originalActivatedAt = new Date("2024-01-01T00:00:00Z");
    await db.rules.add({
      id: "rule-3",
      name: "Already Enabled",
      enabled: true,
      triggers: [{ type: "interval", intervalMinutes: 15 }],
      filters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      notificationEnabled: true,
      scheduledEnableAt: pastDate,
      activatedAt: originalActivatedAt,
    });

    await processExpiredSchedules();

    const rule = await db.rules.get("rule-3");
    expect(rule!.enabled).toBe(true);
    // 이미 활성이므로 activatedAt 변경 안 됨
    expect(rule!.activatedAt).toEqual(originalActivatedAt);
    // scheduledEnableAt은 필터 조건(enabled=false)에 걸리지 않으므로 그대로 유지
    expect(rule!.scheduledEnableAt).toEqual(pastDate);
  });
});
