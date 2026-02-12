import { describe, it, expect } from "vitest";
import { evaluateCondition } from "@/utils/evaluateCondition";
import type {
  SpecificCondition,
  RangeCondition,
  IntervalCondition,
  CompoundCondition,
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
    it("간격에 맞는 시간이면 트리거", () => {
      const cond: IntervalCondition = {
        type: "interval",
        intervalMinutes: 30,
      };
      expect(evaluateCondition(cond, 0, 0)).toBe(true);
      expect(evaluateCondition(cond, 0, 30)).toBe(true);
      expect(evaluateCondition(cond, 1, 0)).toBe(true);
    });

    it("간격에 맞지 않는 시간이면 트리거하지 않음", () => {
      const cond: IntervalCondition = {
        type: "interval",
        intervalMinutes: 30,
      };
      expect(evaluateCondition(cond, 0, 15)).toBe(false);
      expect(evaluateCondition(cond, 1, 29)).toBe(false);
    });
  });

  describe("CompoundCondition", () => {
    it("AND: 모든 조건이 참이면 트리거", () => {
      const cond: CompoundCondition = {
        operator: "AND",
        conditions: [
          {
            type: "range",
            startHour: 9,
            startMinute: 0,
            endHour: 17,
            endMinute: 0,
          },
          { type: "interval", intervalMinutes: 15 },
        ],
      };
      expect(evaluateCondition(cond, 9, 0)).toBe(true);
      expect(evaluateCondition(cond, 9, 15)).toBe(true);
      expect(evaluateCondition(cond, 9, 10)).toBe(false);
      expect(evaluateCondition(cond, 8, 0)).toBe(false);
    });

    it("OR: 하나라도 참이면 트리거", () => {
      const cond: CompoundCondition = {
        operator: "OR",
        conditions: [
          { type: "specific", hour: 9, minute: 0 },
          { type: "specific", hour: 17, minute: 0 },
        ],
      };
      expect(evaluateCondition(cond, 9, 0)).toBe(true);
      expect(evaluateCondition(cond, 17, 0)).toBe(true);
      expect(evaluateCondition(cond, 12, 0)).toBe(false);
    });
  });
});
