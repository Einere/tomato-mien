import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import type { AlarmRule } from '@/types/alarm';

const DATE_FIELDS = ['createdAt', 'updatedAt'] as const;

function reviveDate(_key: string, value: unknown): unknown {
  if (
    typeof value === 'string' &&
    DATE_FIELDS.some((f) => _key === f) &&
    /^\d{4}-\d{2}-\d{2}T/.test(value)
  ) {
    return new Date(value);
  }
  return value;
}

const storage = createJSONStorage<AlarmRule[]>(() => localStorage, {
  reviver: reviveDate,
});

export const rulesAtom = atomWithStorage<AlarmRule[]>(
  'tomato-mien-rules',
  [],
  storage,
);

export type ViewState =
  | 'dashboard'
  | { view: 'editor'; ruleId: string | null };

export const viewAtom = atom<ViewState>('dashboard');

export const searchQueryAtom = atom('');

export type SortOrder = 'recent' | 'name' | 'active';

export const sortOrderAtom = atom<SortOrder>('recent');
