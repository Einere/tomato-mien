import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { z } from "zod";
import { AlarmRuleSchema } from "@/schemas/alarm";
import type { AlarmRule, AppSettings } from "@/types/alarm";

const AlarmRulesArraySchema = z.array(AlarmRuleSchema);

const baseStorage = createJSONStorage<AlarmRule[]>(() => localStorage);

const zodStorage: typeof baseStorage = {
  ...baseStorage,
  getItem(key, initialValue) {
    const raw = baseStorage.getItem(key, initialValue);
    if (raw === null || raw === undefined) return initialValue;
    const result = AlarmRulesArraySchema.safeParse(raw);
    return result.success ? result.data : initialValue;
  },
};

export const rulesAtom = atomWithStorage<AlarmRule[]>(
  "tomato-mien-rules",
  [],
  zodStorage,
);

export const settingsAtom = atomWithStorage<AppSettings>(
  "tomato-mien-settings",
  { timeFormat: "24h" },
);

export type ViewState =
  | "dashboard"
  | "settings"
  | { view: "editor"; ruleId: string | null };

export const viewAtom = atom<ViewState>("dashboard");

export const searchQueryAtom = atom("");

export type SortOrder = "recent" | "name" | "active";

export const sortOrderAtom = atom<SortOrder>("recent");
