import Dexie, { type Table } from "dexie";
import type { AlarmRule, AppSettings } from "@/types/alarm";

interface MetadataRow {
  key: string;
  value: unknown;
}

interface SettingsRow extends AppSettings {
  id: string;
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
  }
}

export const db = new TomatoMienDB();
