import { describe, it, expect } from "vitest";
import { evaluateCondition, evaluateRule } from "@/utils/evaluateCondition";
import type {
  SpecificCondition,
  RangeCondition,
  IntervalCondition,
} from "@/types/alarm";

describe("evaluateCondition", () => {
  describe("SpecificCondition - 세 가지 케이스", () => {
    describe("매 mm분 (hour 생략)", () => {
      const cond: SpecificCondition = { type: "specific", minute: 30 };

      it("해당 분이면 트리거", () => {
        expect(evaluateCondition(cond, 0, 30)).toBe(true);
        expect(evaluateCondition(cond, 12, 30)).toBe(true);
        expect(evaluateCondition(cond, 23, 30)).toBe(true);
      });

      it("해당 분이 아니면 트리거하지 않음", () => {
        expect(evaluateCondition(cond, 0, 0)).toBe(false);
        expect(evaluateCondition(cond, 12, 29)).toBe(false);
        expect(evaluateCondition(cond, 23, 31)).toBe(false);
      });
    });

    describe("매 hh시 (minute 생략 → 정각)", () => {
      const cond: SpecificCondition = { type: "specific", hour: 13 };

      it("해당 시 정각(00분)에만 트리거", () => {
        expect(evaluateCondition(cond, 13, 0)).toBe(true);
      });

      it("해당 시의 다른 분에는 트리거하지 않음", () => {
        expect(evaluateCondition(cond, 13, 1)).toBe(false);
        expect(evaluateCondition(cond, 13, 30)).toBe(false);
        expect(evaluateCondition(cond, 13, 59)).toBe(false);
      });

      it("다른 시에는 트리거하지 않음", () => {
        expect(evaluateCondition(cond, 12, 0)).toBe(false);
        expect(evaluateCondition(cond, 14, 0)).toBe(false);
      });
    });

    describe("특정 hh:mm (hour, minute 모두 지정)", () => {
      const cond: SpecificCondition = {
        type: "specific",
        hour: 14,
        minute: 30,
      };

      it("정확히 해당 시각에만 트리거", () => {
        expect(evaluateCondition(cond, 14, 30)).toBe(true);
      });

      it("같은 시의 다른 분에는 트리거하지 않음", () => {
        expect(evaluateCondition(cond, 14, 0)).toBe(false);
        expect(evaluateCondition(cond, 14, 29)).toBe(false);
        expect(evaluateCondition(cond, 14, 31)).toBe(false);
      });

      it("같은 분의 다른 시에는 트리거하지 않음", () => {
        expect(evaluateCondition(cond, 13, 30)).toBe(false);
        expect(evaluateCondition(cond, 15, 30)).toBe(false);
      });
    });

    describe("hour, minute 모두 생략", () => {
      const cond: SpecificCondition = { type: "specific" };

      it("매시 정각(00분)에만 트리거", () => {
        expect(evaluateCondition(cond, 0, 0)).toBe(true);
        expect(evaluateCondition(cond, 12, 0)).toBe(true);
        expect(evaluateCondition(cond, 23, 0)).toBe(true);
      });

      it("정각이 아닌 분에는 트리거하지 않음", () => {
        expect(evaluateCondition(cond, 0, 1)).toBe(false);
        expect(evaluateCondition(cond, 12, 30)).toBe(false);
      });
    });
  });

  describe("RangeCondition", () => {
    it("범위 내 시간이면 트리거", () => {
      const cond: RangeCondition = {
        type: "range",
        startHour: 9,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
      };
      expect(evaluateCondition(cond, 9, 0)).toBe(true);
      expect(evaluateCondition(cond, 12, 30)).toBe(true);
      expect(evaluateCondition(cond, 17, 0)).toBe(true);
    });

    it("범위 밖 시간이면 트리거하지 않음", () => {
      const cond: RangeCondition = {
        type: "range",
        startHour: 9,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
      };
      expect(evaluateCondition(cond, 8, 59)).toBe(false);
      expect(evaluateCondition(cond, 17, 1)).toBe(false);
    });

    it("자정 넘나드는 범위를 처리", () => {
      const cond: RangeCondition = {
        type: "range",
        startHour: 23,
        startMinute: 0,
        endHour: 1,
        endMinute: 0,
      };
      expect(evaluateCondition(cond, 23, 30)).toBe(true);
      expect(evaluateCondition(cond, 0, 30)).toBe(true);
      expect(evaluateCondition(cond, 12, 0)).toBe(false);
    });
  });

  describe("IntervalCondition", () => {
    describe("activatedAt 기반 (상대 스케줄)", () => {
      it("활성화 시점 이후 interval마다 트리거", () => {
        const cond: IntervalCondition = {
          type: "interval",
          intervalMinutes: 15,
        };
        const activatedAt = new Date(2024, 0, 1, 10, 17); // 10:17
        expect(evaluateCondition(cond, 10, 32, activatedAt)).toBe(true); // +15
        expect(evaluateCondition(cond, 10, 47, activatedAt)).toBe(true); // +30
        expect(evaluateCondition(cond, 11, 2, activatedAt)).toBe(true); // +45
      });

      it("활성화 시점 자체에서는 발동하지 않음", () => {
        const cond: IntervalCondition = {
          type: "interval",
          intervalMinutes: 15,
        };
        const activatedAt = new Date(2024, 0, 1, 10, 17);
        expect(evaluateCondition(cond, 10, 17, activatedAt)).toBe(false);
      });

      it("interval 사이 시간에는 발동하지 않음", () => {
        const cond: IntervalCondition = {
          type: "interval",
          intervalMinutes: 15,
        };
        const activatedAt = new Date(2024, 0, 1, 10, 17);
        expect(evaluateCondition(cond, 10, 20, activatedAt)).toBe(false);
        expect(evaluateCondition(cond, 10, 31, activatedAt)).toBe(false);
      });

      it("자정 교차 처리", () => {
        const cond: IntervalCondition = {
          type: "interval",
          intervalMinutes: 30,
        };
        const activatedAt = new Date(2024, 0, 1, 23, 40); // 23:40
        expect(evaluateCondition(cond, 0, 10, activatedAt)).toBe(true); // +30
        expect(evaluateCondition(cond, 0, 40, activatedAt)).toBe(true); // +60
      });

      it("1분 interval", () => {
        const cond: IntervalCondition = {
          type: "interval",
          intervalMinutes: 1,
        };
        const activatedAt = new Date(2024, 0, 1, 10, 0);
        expect(evaluateCondition(cond, 10, 0, activatedAt)).toBe(false); // 활성화 시점
        expect(evaluateCondition(cond, 10, 1, activatedAt)).toBe(true); // +1
        expect(evaluateCondition(cond, 10, 2, activatedAt)).toBe(true); // +2
      });
    });

    describe("activatedAt 없음 (폴백: 자정 기준)", () => {
      it("자정 기준 간격에 맞는 시간이면 트리거", () => {
        const cond: IntervalCondition = {
          type: "interval",
          intervalMinutes: 30,
        };
        expect(evaluateCondition(cond, 0, 0)).toBe(true);
        expect(evaluateCondition(cond, 0, 30)).toBe(true);
        expect(evaluateCondition(cond, 1, 0)).toBe(true);
      });

      it("간격에 맞지 않으면 트리거하지 않음", () => {
        const cond: IntervalCondition = {
          type: "interval",
          intervalMinutes: 30,
        };
        expect(evaluateCondition(cond, 0, 15)).toBe(false);
      });
    });
  });
});

describe("evaluateRule", () => {
  it("triggers OR: 하나라도 발동하면 true", () => {
    const triggers = [
      { type: "specific" as const, hour: 9, minute: 0 },
      { type: "specific" as const, hour: 17, minute: 0 },
    ];
    expect(evaluateRule(triggers, [], 9, 0)).toBe(true);
    expect(evaluateRule(triggers, [], 17, 0)).toBe(true);
    expect(evaluateRule(triggers, [], 12, 0)).toBe(false);
  });

  it("filters AND: 하나라도 실패하면 false", () => {
    const triggers = [{ type: "interval" as const, intervalMinutes: 15 }];
    const filters = [
      {
        type: "range" as const,
        startHour: 9,
        startMinute: 0,
        endHour: 12,
        endMinute: 0,
      },
      {
        type: "range" as const,
        startHour: 8,
        startMinute: 0,
        endHour: 10,
        endMinute: 0,
      },
    ];
    // 9:00 — 두 필터 모두 통과, 트리거(15분 간격) 발동 (activatedAt 없으므로 자정 기준)
    expect(evaluateRule(triggers, filters, 9, 0)).toBe(true);
    // 11:00 — 두 번째 필터(8~10) 불통과
    expect(evaluateRule(triggers, filters, 11, 0)).toBe(false);
  });

  it("filters 빈 배열이면 트리거만으로 평가", () => {
    const triggers = [{ type: "interval" as const, intervalMinutes: 30 }];
    expect(evaluateRule(triggers, [], 0, 0)).toBe(true);
    expect(evaluateRule(triggers, [], 0, 30)).toBe(true);
    expect(evaluateRule(triggers, [], 0, 15)).toBe(false);
  });

  it("복합: 여러 triggers + 여러 filters + activatedAt", () => {
    const triggers = [
      { type: "interval" as const, intervalMinutes: 15 },
      { type: "specific" as const, hour: 14, minute: 30 },
    ];
    const filters = [
      {
        type: "range" as const,
        startHour: 9,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
      },
    ];
    const activatedAt = new Date(2024, 0, 1, 9, 0); // 09:00 활성화

    // 9:15 — 필터 통과 + interval 발동 (09:00 기준 +15)
    expect(evaluateRule(triggers, filters, 9, 15, activatedAt)).toBe(true);
    // 14:30 — 필터 통과 + specific 발동
    expect(evaluateRule(triggers, filters, 14, 30, activatedAt)).toBe(true);
    // 8:00 — 필터 불통과
    expect(evaluateRule(triggers, filters, 8, 0, activatedAt)).toBe(false);
    // 9:10 — 필터 통과, 트리거 모두 불발 (interval: 9:00 기준 +10은 배수 아님)
    expect(evaluateRule(triggers, filters, 9, 10, activatedAt)).toBe(false);
  });

  it("filter가 불통과하면 트리거 평가하지 않고 false", () => {
    const triggers = [{ type: "interval" as const, intervalMinutes: 1 }];
    const filters = [
      {
        type: "range" as const,
        startHour: 9,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
      },
    ];
    // 범위 밖이면 매분 interval이어도 false
    expect(evaluateRule(triggers, filters, 8, 0)).toBe(false);
  });

  it("activatedAt을 trigger에만 전달 (filter에는 영향 없음)", () => {
    const triggers = [{ type: "interval" as const, intervalMinutes: 30 }];
    const filters = [
      {
        type: "range" as const,
        startHour: 9,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
      },
    ];
    const activatedAt = new Date(2024, 0, 1, 9, 10);

    // 9:40 — 필터 통과 + interval 발동 (9:10 기준 +30)
    expect(evaluateRule(triggers, filters, 9, 40, activatedAt)).toBe(true);
    // 9:30 — 필터 통과 + interval 불발 (9:10 기준 +20은 배수 아님)
    expect(evaluateRule(triggers, filters, 9, 30, activatedAt)).toBe(false);
  });
});
