import { describe, it, expect } from "vitest";
import { describeCondition, validateCondition } from "@/utils/condition";
import type {
  RangeCondition,
  IntervalCondition,
  SpecificCondition,
  CompoundCondition,
} from "@/types/alarm";

describe("describeCondition", () => {
  describe("24h format (default)", () => {
    it("describes a range condition", () => {
      const cond: RangeCondition = {
        type: "range",
        startHour: 9,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
      };
      expect(describeCondition(cond)).toBe("from 09:00 to 17:00");
    });

    it("describes an interval condition", () => {
      const cond: IntervalCondition = { type: "interval", intervalMinutes: 30 };
      expect(describeCondition(cond)).toBe("every 30 minutes");
    });

    it("describes a specific condition", () => {
      const cond: SpecificCondition = {
        type: "specific",
        hour: 14,
        minute: 30,
      };
      expect(describeCondition(cond)).toBe("at 14:30");
    });

    it("describes a compound condition with AND", () => {
      const cond: CompoundCondition = {
        operator: "AND",
        conditions: [
          { type: "interval", intervalMinutes: 15 },
          { type: "specific", hour: 9, minute: 0 },
        ],
      };
      const result = describeCondition(cond);
      expect(result).toBe("(every 15 minutes AND at 09:00)");
    });

    it("describes a compound condition with OR", () => {
      const cond: CompoundCondition = {
        operator: "OR",
        conditions: [
          { type: "interval", intervalMinutes: 15 },
          { type: "specific", hour: 9, minute: 0 },
        ],
      };
      const result = describeCondition(cond);
      expect(result).toBe("(every 15 minutes OR at 09:00)");
    });
  });

  describe("12h format", () => {
    it("describes a range condition in 12h", () => {
      const cond: RangeCondition = {
        type: "range",
        startHour: 9,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
      };
      const result = describeCondition(cond, "12h");
      expect(result).toBe("from 9:00 AM to 5:00 PM");
    });

    it("describes a specific condition in 12h", () => {
      const cond: SpecificCondition = {
        type: "specific",
        hour: 14,
        minute: 30,
      };
      expect(describeCondition(cond, "12h")).toBe("at 2:30 PM");
    });

    it("describes midnight in 12h", () => {
      const cond: SpecificCondition = { type: "specific", hour: 0, minute: 0 };
      expect(describeCondition(cond, "12h")).toBe("at 12:00 AM");
    });

    it("describes noon in 12h", () => {
      const cond: SpecificCondition = { type: "specific", hour: 12, minute: 0 };
      expect(describeCondition(cond, "12h")).toBe("at 12:00 PM");
    });

    it("interval is the same in 12h", () => {
      const cond: IntervalCondition = { type: "interval", intervalMinutes: 15 };
      expect(describeCondition(cond, "12h")).toBe("every 15 minutes");
    });
  });

  describe("specific condition - three cases", () => {
    it("every hour at minute N: when hour is omitted", () => {
      const cond: SpecificCondition = { type: "specific", minute: 30 };
      expect(describeCondition(cond)).toBe("every hour at minute 30");
    });

    it("at HH:00: when minute is omitted (24h)", () => {
      const cond: SpecificCondition = { type: "specific", hour: 13 };
      expect(describeCondition(cond, "24h")).toBe("at 13:00");
    });

    it("at h:00 PM: when minute is omitted (12h)", () => {
      const cond: SpecificCondition = { type: "specific", hour: 13 };
      expect(describeCondition(cond, "12h")).toBe("at 1:00 PM");
    });

    it("at HH:mm: when both hour and minute are specified", () => {
      const cond: SpecificCondition = {
        type: "specific",
        hour: 14,
        minute: 30,
      };
      expect(describeCondition(cond, "24h")).toBe("at 14:30");
    });

    it("every hour at minute 0: when both are omitted", () => {
      const cond: SpecificCondition = { type: "specific" };
      expect(describeCondition(cond)).toBe("every hour at minute 0");
    });
  });
});

describe("validateCondition", () => {
  it("returns no issues for valid interval", () => {
    const cond: IntervalCondition = { type: "interval", intervalMinutes: 15 };
    expect(validateCondition(cond)).toEqual([]);
  });

  it("returns issue for zero interval", () => {
    const cond: IntervalCondition = { type: "interval", intervalMinutes: 0 };
    const issues = validateCondition(cond);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("returns issue for inverted range", () => {
    const cond: RangeCondition = {
      type: "range",
      startHour: 17,
      startMinute: 0,
      endHour: 9,
      endMinute: 0,
    };
    const issues = validateCondition(cond);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("returns issue for empty compound", () => {
    const cond: CompoundCondition = { operator: "AND", conditions: [] };
    const issues = validateCondition(cond);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("returns issue for invalid specific hour", () => {
    const cond: SpecificCondition = { type: "specific", hour: 25, minute: 0 };
    const issues = validateCondition(cond);
    expect(issues.length).toBeGreaterThan(0);
  });
});
