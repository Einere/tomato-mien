import { describe, it, expect } from "vitest";
import {
  describeCondition,
  describeRule,
  formatExampleTimes,
  validateCondition,
  validateRule,
} from "@/utils/condition";
import type {
  RangeCondition,
  IntervalCondition,
  SpecificCondition,
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

describe("describeRule", () => {
  it("triggers만 있으면 트리거 설명만 반환", () => {
    expect(describeRule([{ type: "interval", intervalMinutes: 15 }], [])).toBe(
      "every 15 minutes",
    );
  });

  it("여러 triggers를 or로 연결", () => {
    expect(
      describeRule(
        [
          { type: "interval", intervalMinutes: 15 },
          { type: "specific", hour: 14, minute: 30 },
        ],
        [],
      ),
    ).toBe("every 15 minutes or at 14:30");
  });

  it("triggers + filters", () => {
    expect(
      describeRule(
        [{ type: "interval", intervalMinutes: 15 }],
        [
          {
            type: "range",
            startHour: 9,
            startMinute: 0,
            endHour: 17,
            endMinute: 0,
          },
        ],
      ),
    ).toBe("every 15 minutes (from 09:00 to 17:00)");
  });

  it("여러 triggers + 여러 filters", () => {
    expect(
      describeRule(
        [
          { type: "interval", intervalMinutes: 15 },
          { type: "specific", hour: 14, minute: 30 },
        ],
        [
          {
            type: "range",
            startHour: 9,
            startMinute: 0,
            endHour: 17,
            endMinute: 0,
          },
        ],
      ),
    ).toBe("every 15 minutes or at 14:30 (from 09:00 to 17:00)");
  });
});

describe("formatExampleTimes", () => {
  it("shows first 4 example times for 15-minute interval", () => {
    expect(formatExampleTimes(15)).toBe("00:00, 00:15, 00:30, 00:45, ...");
  });

  it("shows first 4 example times for 30-minute interval", () => {
    expect(formatExampleTimes(30)).toBe("00:00, 00:30, 01:00, 01:30, ...");
  });

  it("shows first 4 example times for 60-minute interval", () => {
    expect(formatExampleTimes(60)).toBe("00:00, 01:00, 02:00, 03:00, ...");
  });

  it("shows fewer than 4 examples when interval is very large", () => {
    expect(formatExampleTimes(720)).toBe("00:00, 12:00, ...");
  });

  it("handles 1-minute interval", () => {
    expect(formatExampleTimes(1)).toBe("00:00, 00:01, 00:02, 00:03, ...");
  });

  it("returns safe fallback for 0 interval", () => {
    expect(formatExampleTimes(0)).toBe("...");
  });

  it("returns safe fallback for negative interval", () => {
    expect(formatExampleTimes(-5)).toBe("...");
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

  it("returns issue for invalid specific hour", () => {
    const cond: SpecificCondition = { type: "specific", hour: 25, minute: 0 };
    const issues = validateCondition(cond);
    expect(issues.length).toBeGreaterThan(0);
  });
});

describe("validateRule", () => {
  it("triggers가 비어 있으면 이슈 반환", () => {
    const issues = validateRule([], []);
    expect(issues.some(i => i.path === "triggers")).toBe(true);
  });

  it("유효한 triggers + filters면 이슈 없음", () => {
    const issues = validateRule(
      [{ type: "interval", intervalMinutes: 15 }],
      [
        {
          type: "range",
          startHour: 9,
          startMinute: 0,
          endHour: 17,
          endMinute: 0,
        },
      ],
    );
    expect(issues).toEqual([]);
  });

  it("잘못된 trigger가 있으면 이슈 반환", () => {
    const issues = validateRule([{ type: "interval", intervalMinutes: 0 }], []);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("잘못된 filter가 있으면 이슈 반환", () => {
    const issues = validateRule(
      [{ type: "interval", intervalMinutes: 15 }],
      [
        {
          type: "range",
          startHour: 17,
          startMinute: 0,
          endHour: 9,
          endMinute: 0,
        },
      ],
    );
    expect(issues.length).toBeGreaterThan(0);
  });
});
