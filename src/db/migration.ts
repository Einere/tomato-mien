import { z } from "zod";
import { db, dbReady } from "./database";
import { AlarmRuleSchema, AppSettingsSchema } from "@/schemas/alarm";
import { hydrateArrayStorage, hydrateSingleRowStorage } from "./storage";
import type { AlarmRule, AppSettings } from "@/types/alarm";

const AlarmRulesArraySchema = z.array(AlarmRuleSchema);

const RULES_KEY = "tomato-mien-rules";
const SETTINGS_KEY = "tomato-mien-settings";

export async function runMigration(): Promise<void> {
  await dbReady;
  await Promise.all([
    hydrateArrayStorage<AlarmRule>(
      RULES_KEY,
      db.rules,
      AlarmRulesArraySchema,
      [],
    ),
    hydrateSingleRowStorage<AppSettings>(
      SETTINGS_KEY,
      db.settings,
      AppSettingsSchema,
      { timeFormat: "24h" },
    ),
  ]);
}
