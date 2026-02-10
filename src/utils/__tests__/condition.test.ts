import { describe, it, expect } from 'vitest';
import { describeCondition, validateCondition } from '@/utils/condition';
import type {
  RangeCondition,
  IntervalCondition,
  SpecificCondition,
  CompoundCondition,
} from '@/types/alarm';

describe('describeCondition', () => {
  describe('24h format (default)', () => {
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
      expect(describeCondition(cond)).toBe('14:30');
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

  describe('12h format', () => {
    it('describes a range condition in 12h', () => {
      const cond: RangeCondition = {
        type: 'range',
        startHour: 9,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
      };
      const result = describeCondition(cond, '12h');
      expect(result).toContain('오전 9:00');
      expect(result).toContain('오후 5:00');
    });

    it('describes a specific condition in 12h', () => {
      const cond: SpecificCondition = { type: 'specific', hour: 14, minute: 30 };
      expect(describeCondition(cond, '12h')).toBe('오후 2:30');
    });

    it('describes midnight in 12h', () => {
      const cond: SpecificCondition = { type: 'specific', hour: 0, minute: 0 };
      expect(describeCondition(cond, '12h')).toBe('오전 12:00');
    });

    it('describes noon in 12h', () => {
      const cond: SpecificCondition = { type: 'specific', hour: 12, minute: 0 };
      expect(describeCondition(cond, '12h')).toBe('오후 12:00');
    });

    it('interval is the same in 12h', () => {
      const cond: IntervalCondition = { type: 'interval', intervalMinutes: 15 };
      expect(describeCondition(cond, '12h')).toBe('매 15분');
    });
  });

  describe('specific condition edge cases', () => {
    it('describes hour-only specific as time with 0 minute', () => {
      const cond: SpecificCondition = { type: 'specific', hour: 9 };
      expect(describeCondition(cond, '24h')).toBe('09:00');
    });

    it('describes no-hour specific as all time with minute', () => {
      const cond: SpecificCondition = { type: 'specific', minute: 30 };
      expect(describeCondition(cond)).toContain('모든 시간');
    });
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
