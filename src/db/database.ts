import Dexie, { type Table } from "dexie";
import type {
  AlarmRule,
  AppSettings,
  TriggerCondition,
  FilterCondition,
} from "@/types/alarm";

interface MetadataRow {
  key: string;
  value: unknown;
}

interface SettingsRow extends AppSettings {
  id: string;
}

interface LegacyCondition {
  type?: string;
  operator?: string;
  conditions?: LegacyCondition[];
  [key: string]: unknown;
}

function migrateConditionToECA(condition: LegacyCondition): {
  triggers: TriggerCondition[];
  filters: FilterCondition[];
} {
  const triggers: TriggerCondition[] = [];
  const filters: FilterCondition[] = [];

  function walk(cond: LegacyCondition) {
    if (cond.operator && Array.isArray(cond.conditions)) {
      for (const child of cond.conditions) {
        walk(child);
      }
    } else if (cond.type === "range") {
      filters.push(cond as unknown as FilterCondition);
    } else if (cond.type === "interval" || cond.type === "specific") {
      triggers.push(cond as unknown as TriggerCondition);
    }
  }

  walk(condition);

  if (triggers.length === 0) {
    triggers.push({ type: "interval", intervalMinutes: 60 });
  }

  return { triggers, filters };
}

export class TomatoMienDB extends Dexie {
  rules!: Table<AlarmRule, string>;
  settings!: Table<SettingsRow, string>;
  metadata!: Table<MetadataRow, string>;

  constructor() {
    super("tomato-mien");

    this.version(1).stores({
      rules: "id, enabled, updatedAt",
      settings: "id",
      metadata: "key",
    });

    this.version(2)
      .stores({
        rules: "id, enabled, updatedAt",
        settings: "id",
        metadata: "key",
      })
      .upgrade(tx => {
        return tx
          .table("rules")
          .toCollection()
          .modify(rule => {
            if ("condition" in rule) {
              const { triggers, filters } = migrateConditionToECA(
                rule.condition as LegacyCondition,
              );
              rule.triggers = triggers;
              rule.filters = filters;
              delete rule.condition;
            }
          });
      });

    this.version(3)
      .stores({
        rules: "id, enabled, updatedAt",
        settings: "id",
        metadata: "key",
      })
      .upgrade(tx => {
        return tx
          .table("rules")
          .toCollection()
          .modify(rule => {
            if (!rule.activatedAt) {
              rule.activatedAt = rule.createdAt;
            }
          });
      });
  }
}

export const db = new TomatoMienDB();

// 모듈 로드 시 즉시 DB 연결 시작 (lazy open 대신 eager open)
// React mount + useEffect 스케줄링 동안 DB open이 병렬로 진행됨
export const dbReady = db.open().catch(err => {
  console.error("[DB] Failed to open:", err);
});
