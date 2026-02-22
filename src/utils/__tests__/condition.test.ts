import { describe, it, expect } from "vitest";
import {
  describeCondition,
  describeRule,
  describeSchedule,
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

  it("returns no issues for midnight-crossing range", () => {
    const cond: RangeCondition = {
      type: "range",
      startHour: 22,
      startMinute: 0,
      endHour: 2,
      endMinute: 0,
    };
    expect(validateCondition(cond)).toEqual([]);
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
          startHour: 25,
          startMinute: 0,
          endHour: 9,
          endMinute: 0,
        },
      ],
    );
    expect(issues.length).toBeGreaterThan(0);
  });
});

describe("describeSchedule", () => {
  it("24h 포맷으로 예약 설명 반환", () => {
    const date = new Date(2024, 5, 15, 9, 30); // 2024-06-15 09:30
    expect(describeSchedule(date, "24h")).toBe("06/15 09:30에 활성화 예약됨");
  });

  it("12h 포맷으로 예약 설명 반환", () => {
    const date = new Date(2024, 5, 15, 14, 30); // 2024-06-15 14:30
    expect(describeSchedule(date, "12h")).toBe("06/15 2:30 PM에 활성화 예약됨");
  });

  it("undefined이면 빈 문자열 반환", () => {
    expect(describeSchedule(undefined)).toBe("");
  });

  it("기본 timeFormat은 24h", () => {
    const date = new Date(2024, 0, 1, 0, 0); // 2024-01-01 00:00
    expect(describeSchedule(date)).toBe("01/01 00:00에 활성화 예약됨");
  });
});
