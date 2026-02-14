import type { Table } from "dexie";
import { liveQuery } from "dexie";
import type { z } from "zod";

// In-memory cache populated during hydration, enabling sync reads
const caches = new Map<string, unknown>();

export async function hydrateArrayStorage<T>(
  key: string,
  table: Table<T>,
  zodSchema: z.ZodType<T[]>,
  initialValue: T[],
): Promise<void> {
  const rows = await table.toArray();
  const result = zodSchema.safeParse(rows);
  caches.set(key, result.success ? result.data : initialValue);
}

export async function hydrateSingleRowStorage<
  T extends Record<string, unknown>,
>(
  key: string,
  table: Table<T & { id: string }>,
  zodSchema: z.ZodType<T>,
  initialValue: T,
): Promise<void> {
  const row = await table.get("default");
  if (!row) {
    caches.set(key, initialValue);
    return;
  }
  const { id, ...data } = row;
  const result = zodSchema.safeParse(data);
  caches.set(key, result.success ? result.data : initialValue);
}

export function createDexieArrayStorage<T>(
  table: Table<T>,
  zodSchema: z.ZodType<T[]>,
) {
  return {
    getItem(key: string, initialValue: T[]): T[] {
      const cached = caches.get(key);
      if (cached !== undefined) return cached as T[];
      return initialValue;
    },

    setItem(key: string, newValue: T[]): void {
      caches.set(key, newValue);
      table.db
        .transaction("rw", table, async () => {
          await table.clear();
          if (newValue.length > 0) {
            await table.bulkAdd(newValue);
          }
        })
        .catch(err => console.error("[DexieArrayStorage] write error:", err));
    },

    removeItem(key: string): void {
      caches.delete(key);
      table
        .clear()
        .catch(err => console.error("[DexieArrayStorage] clear error:", err));
    },

    subscribe(
      key: string,
      callback: (value: T[]) => void,
      initialValue: T[],
    ): () => void {
      const observable = liveQuery(() => table.toArray());
      const subscription = observable.subscribe({
        next(rows) {
          const result = zodSchema.safeParse(rows);
          const value = result.success ? result.data : initialValue;
          caches.set(key, value);
          callback(value);
        },
        error(err) {
          console.error("[DexieArrayStorage] subscribe error:", err);
        },
      });
      return () => subscription.unsubscribe();
    },
  };
}

export function createDexieSingleRowStorage<T extends Record<string, unknown>>(
  table: Table<T & { id: string }>,
  zodSchema: z.ZodType<T>,
) {
  const ROW_ID = "default";

  return {
    getItem(key: string, initialValue: T): T {
      const cached = caches.get(key);
      if (cached !== undefined) return cached as T;
      return initialValue;
    },

    setItem(key: string, newValue: T): void {
      caches.set(key, newValue);
      table
        .put({ ...newValue, id: ROW_ID } as T & { id: string })
        .catch(err =>
          console.error("[DexieSingleRowStorage] write error:", err),
        );
    },

    removeItem(key: string): void {
      caches.delete(key);
      table
        .delete(ROW_ID)
        .catch(err =>
          console.error("[DexieSingleRowStorage] clear error:", err),
        );
    },

    subscribe(
      key: string,
      callback: (value: T) => void,
      initialValue: T,
    ): () => void {
      const observable = liveQuery(() => table.get(ROW_ID));
      const subscription = observable.subscribe({
        next(row) {
          if (!row) {
            caches.set(key, initialValue);
            callback(initialValue);
            return;
          }

          const { id, ...data } = row;
          const result = zodSchema.safeParse(data);
          const value = result.success ? result.data : initialValue;
          caches.set(key, value);
          callback(value);
        },
        error(err) {
          console.error("[DexieSingleRowStorage] subscribe error:", err);
        },
      });
      return () => subscription.unsubscribe();
    },
  };
}
