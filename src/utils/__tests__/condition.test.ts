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
      expect(describeCondition(cond)).toBe("09:00\u201317:00");
    });

    it("describes an interval condition", () => {
      const cond: IntervalCondition = { type: "interval", intervalMinutes: 30 };
      expect(describeCondition(cond)).toBe("매 30분");
    });

    it("describes a specific condition", () => {
      const cond: SpecificCondition = {
        type: "specific",
        hour: 14,
        minute: 30,
      };
      expect(describeCondition(cond)).toBe("14:30");
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
      expect(result).toContain("AND");
      expect(result).toContain("매 15분");
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
      expect(result).toContain("오전 9:00");
      expect(result).toContain("오후 5:00");
    });

    it("describes a specific condition in 12h", () => {
      const cond: SpecificCondition = {
        type: "specific",
        hour: 14,
        minute: 30,
      };
      expect(describeCondition(cond, "12h")).toBe("오후 2:30");
    });

    it("describes midnight in 12h", () => {
      const cond: SpecificCondition = { type: "specific", hour: 0, minute: 0 };
      expect(describeCondition(cond, "12h")).toBe("오전 12:00");
    });

    it("describes noon in 12h", () => {
      const cond: SpecificCondition = { type: "specific", hour: 12, minute: 0 };
      expect(describeCondition(cond, "12h")).toBe("오후 12:00");
    });

    it("interval is the same in 12h", () => {
      const cond: IntervalCondition = { type: "interval", intervalMinutes: 15 };
      expect(describeCondition(cond, "12h")).toBe("매 15분");
    });
  });

  describe("specific condition - 세 가지 케이스", () => {
    it("매 mm분: hour 생략 시 매시 해당 분에 트리거", () => {
      const cond: SpecificCondition = { type: "specific", minute: 30 };
      expect(describeCondition(cond)).toBe("매시 30분");
    });

    it("매 hh시: minute 생략 시 정각(hh:00)으로 표시", () => {
      const cond: SpecificCondition = { type: "specific", hour: 13 };
      expect(describeCondition(cond, "24h")).toBe("13:00");
    });

    it("매 hh시 (12h): minute 생략 시 정각으로 표시", () => {
      const cond: SpecificCondition = { type: "specific", hour: 13 };
      expect(describeCondition(cond, "12h")).toBe("오후 1:00");
    });

    it("hh:mm: hour와 minute 모두 지정 시 해당 시각으로 표시", () => {
      const cond: SpecificCondition = {
        type: "specific",
        hour: 14,
        minute: 30,
      };
      expect(describeCondition(cond, "24h")).toBe("14:30");
    });

    it("hour, minute 모두 생략 시 매시 정각으로 표시", () => {
      const cond: SpecificCondition = { type: "specific" };
      expect(describeCondition(cond)).toBe("매시 0분");
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
