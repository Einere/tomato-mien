import { z } from "zod";
import { db } from "./database";
import { AlarmRuleSchema, AppSettingsSchema } from "@/schemas/alarm";
import { hydrateArrayStorage, hydrateSingleRowStorage } from "./storage";
import type { AlarmRule, AppSettings } from "@/types/alarm";

const AlarmRulesArraySchema = z.array(AlarmRuleSchema);

const RULES_KEY = "tomato-mien-rules";
const SETTINGS_KEY = "tomato-mien-settings";
const MIGRATION_KEY = "migrated";

async function migrateFromLocalStorage(): Promise<void> {
  const existing = await db.metadata.get(MIGRATION_KEY);
  if (existing?.value === true) return;

  await db.transaction("rw", [db.rules, db.settings, db.metadata], async () => {
    const rawRules = localStorage.getItem(RULES_KEY);
    if (rawRules) {
      try {
        const parsed = JSON.parse(rawRules);
        const result = AlarmRulesArraySchema.safeParse(parsed);
        if (result.success && result.data.length > 0) {
          await db.rules.bulkAdd(result.data);
        }
      } catch {
        console.warn("[Migration] Failed to parse localStorage rules");
      }
    }

    const rawSettings = localStorage.getItem(SETTINGS_KEY);
    if (rawSettings) {
      try {
        const parsed = JSON.parse(rawSettings);
        const result = AppSettingsSchema.safeParse(parsed);
        if (result.success) {
          await db.settings.put({ ...result.data, id: "default" });
        }
      } catch {
        console.warn("[Migration] Failed to parse localStorage settings");
      }
    }

    await db.metadata.put({ key: MIGRATION_KEY, value: true });
  });

  localStorage.removeItem(RULES_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}

async function hydrateStores(): Promise<void> {
  await hydrateArrayStorage<AlarmRule>(
    RULES_KEY,
    db.rules,
    AlarmRulesArraySchema,
    [],
  );
  await hydrateSingleRowStorage<AppSettings>(
    SETTINGS_KEY,
    db.settings,
    AppSettingsSchema,
    { timeFormat: "24h" },
  );
}

export async function runMigration(): Promise<void> {
  await migrateFromLocalStorage();
  await hydrateStores();
}
