import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { z } from "zod";
import { AlarmRuleSchema, AppSettingsSchema } from "@/schemas/alarm";
import type { AlarmRule, AppSettings } from "@/types/alarm";
import { db } from "@/db/database";
import {
  createDexieArrayStorage,
  createDexieSingleRowStorage,
} from "@/db/storage";

const AlarmRulesArraySchema = z.array(AlarmRuleSchema);

export const rulesAtom = atomWithStorage<AlarmRule[]>(
  "tomato-mien-rules",
  [],
  createDexieArrayStorage(db.rules, AlarmRulesArraySchema),
);

export const settingsAtom = atomWithStorage<AppSettings>(
  "tomato-mien-settings",
  { timeFormat: "24h" },
  createDexieSingleRowStorage(db.settings, AppSettingsSchema),
);

export type ViewState = "dashboard" | "settings" | "editor";

export const viewAtom = atom<ViewState>("dashboard");

export const editorRuleIdAtom = atom<string | null>(null);

export const searchQueryAtom = atom("");

export type SortOrder = "name" | "recent";

export const sortOrderAtom = atom<SortOrder>("recent");
