import { describe, it, expect } from 'vitest';
import { describeCondition, validateCondition } from '@/utils/condition';
import type {
  RangeCondition,
  IntervalCondition,
  SpecificCondition,
  CompoundCondition,
} from '@/types/alarm';

describe('describeCondition', () => {
  it('describes a range condition', () => {
    const cond: RangeCondition = {
      type: 'range',
      startHour: 9,
      startMinute: 0,
      endHour: 17,
      endMinute: 0,
    };
    expect(describeCondition(cond)).toBe('09:00\u201317:00');
  });

  it('describes an interval condition', () => {
    const cond: IntervalCondition = { type: 'interval', intervalMinutes: 30 };
    expect(describeCondition(cond)).toBe('매 30분');
  });

  it('describes a specific condition', () => {
    const cond: SpecificCondition = { type: 'specific', hour: 14, minute: 30 };
    expect(describeCondition(cond)).toBe('14시 30분');
  });

  it('describes a compound condition with AND', () => {
    const cond: CompoundCondition = {
      operator: 'AND',
      conditions: [
        { type: 'interval', intervalMinutes: 15 },
        { type: 'specific', hour: 9, minute: 0 },
      ],
    };
    const result = describeCondition(cond);
    expect(result).toContain('AND');
    expect(result).toContain('매 15분');
  });
});

describe('validateCondition', () => {
  it('returns no issues for valid interval', () => {
    const cond: IntervalCondition = { type: 'interval', intervalMinutes: 15 };
    expect(validateCondition(cond)).toEqual([]);
  });

  it('returns issue for zero interval', () => {
    const cond: IntervalCondition = { type: 'interval', intervalMinutes: 0 };
    const issues = validateCondition(cond);
    expect(issues.length).toBeGreaterThan(0);
  });

  it('returns issue for inverted range', () => {
    const cond: RangeCondition = {
      type: 'range',
      startHour: 17,
      startMinute: 0,
      endHour: 9,
      endMinute: 0,
    };
    const issues = validateCondition(cond);
    expect(issues.length).toBeGreaterThan(0);
  });

  it('returns issue for empty compound', () => {
    const cond: CompoundCondition = { operator: 'AND', conditions: [] };
    const issues = validateCondition(cond);
    expect(issues.length).toBeGreaterThan(0);
  });

  it('returns issue for invalid specific hour', () => {
    const cond: SpecificCondition = { type: 'specific', hour: 25, minute: 0 };
    const issues = validateCondition(cond);
    expect(issues.length).toBeGreaterThan(0);
  });
});
