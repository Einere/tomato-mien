import { describe, it, expect } from 'vitest';
import { createStore } from 'jotai';
import {
  rulesAtom,
  searchQueryAtom,
  sortOrderAtom,
  activeRuleCountAtom,
  totalRuleCountAtom,
  filteredRulesAtom,
} from '@/store';
import type { AlarmRule } from '@/types/alarm';

function createTestRule(overrides?: Partial<AlarmRule>): AlarmRule {
  return {
    id: crypto.randomUUID(),
    name: 'Test Rule',
    enabled: true,
    condition: { type: 'interval', intervalMinutes: 15 },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('derived atoms', () => {
  it('activeRuleCountAtom counts enabled rules', () => {
    const store = createStore();
    store.set(rulesAtom, [
      createTestRule({ enabled: true }),
      createTestRule({ enabled: false }),
      createTestRule({ enabled: true }),
    ]);

    expect(store.get(activeRuleCountAtom)).toBe(2);
  });

  it('totalRuleCountAtom counts all rules', () => {
    const store = createStore();
    store.set(rulesAtom, [
      createTestRule(),
      createTestRule(),
      createTestRule(),
    ]);

    expect(store.get(totalRuleCountAtom)).toBe(3);
  });

  it('filteredRulesAtom filters by search query', () => {
    const store = createStore();
    store.set(rulesAtom, [
      createTestRule({ name: 'Morning Alarm' }),
      createTestRule({ name: 'Work Timer' }),
      createTestRule({ name: 'Evening Alarm' }),
    ]);

    store.set(searchQueryAtom, 'alarm');
    const filtered = store.get(filteredRulesAtom);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((r) => r.name.toLowerCase().includes('alarm'))).toBe(
      true,
    );
  });

  it('filteredRulesAtom sorts by name', () => {
    const store = createStore();
    store.set(rulesAtom, [
      createTestRule({ name: 'Charlie' }),
      createTestRule({ name: 'Alpha' }),
      createTestRule({ name: 'Bravo' }),
    ]);

    store.set(sortOrderAtom, 'name');
    const sorted = store.get(filteredRulesAtom);
    expect(sorted.map((r) => r.name)).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('filteredRulesAtom sorts active first', () => {
    const store = createStore();
    store.set(rulesAtom, [
      createTestRule({ name: 'Disabled', enabled: false }),
      createTestRule({ name: 'Enabled', enabled: true }),
    ]);

    store.set(sortOrderAtom, 'active');
    const sorted = store.get(filteredRulesAtom);
    expect(sorted[0].name).toBe('Enabled');
    expect(sorted[1].name).toBe('Disabled');
  });
});
