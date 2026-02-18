import { describe, it, expect } from "vitest";
import { getNextAlarmTime } from "../nextAlarmTime";
import type { TriggerCondition, FilterCondition } from "@/types/alarm";

function interval(minutes: number): TriggerCondition {
  return { type: "interval", intervalMinutes: minutes };
}

function specific(
  hour?: number,
  minute?: number,
): TriggerCondition & { type: "specific" } {
  return { type: "specific", hour, minute };
}

function range(
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
): FilterCondition {
  return {
    type: "range",
    startHour,
    startMinute,
    endHour,
    endMinute,
  } as FilterCondition;
}

describe("getNextAlarmTime", () => {
  describe("IntervalCondition (activatedAt 없음)", () => {
    it("매 15분 간격, 현재 14:30 → 다음 14:45", () => {
      const result = getNextAlarmTime([interval(15)], [], 14, 30);
      expect(result).toEqual({ hour: 14, minute: 45 });
    });

    it("매 30분 간격, 현재 23:30 → 다음 00:00 (자정 래핑)", () => {
      const result = getNextAlarmTime([interval(30)], [], 23, 30);
      expect(result).toEqual({ hour: 0, minute: 0 });
    });

    it("매 60분 간격, 현재 23:00 → 다음 00:00", () => {
      const result = getNextAlarmTime([interval(60)], [], 23, 0);
      expect(result).toEqual({ hour: 0, minute: 0 });
    });

    it("매 15분 간격, 현재 00:00 → 다음 00:15", () => {
      const result = getNextAlarmTime([interval(15)], [], 0, 0);
      expect(result).toEqual({ hour: 0, minute: 15 });
    });
  });

  describe("IntervalCondition (activatedAt 있음)", () => {
    it("활성화 14:20, 매 15분, 현재 14:35 → 다음 14:50", () => {
      const activatedAt = new Date(2024, 0, 1, 14, 20);
      const result = getNextAlarmTime([interval(15)], [], 14, 35, activatedAt);
      expect(result).toEqual({ hour: 14, minute: 50 });
    });

    it("활성화 23:50, 매 30분, 현재 00:20 → 다음 00:50 (자정 교차)", () => {
      const activatedAt = new Date(2024, 0, 1, 23, 50);
      const result = getNextAlarmTime([interval(30)], [], 0, 20, activatedAt);
      expect(result).toEqual({ hour: 0, minute: 50 });
    });

    it("활성화 시각과 현재 시각이 같으면 다음 interval로", () => {
      const activatedAt = new Date(2024, 0, 1, 10, 0);
      const result = getNextAlarmTime([interval(30)], [], 10, 0, activatedAt);
      expect(result).toEqual({ hour: 10, minute: 30 });
    });
  });

  describe("SpecificCondition", () => {
    it("14:30 특정 시각, 현재 14:30 → 다음 14:30 (내일)", () => {
      const result = getNextAlarmTime([specific(14, 30)], [], 14, 30);
      expect(result).toEqual({ hour: 14, minute: 30 });
    });

    it("매시 25분, 현재 14:20 → 다음 14:25 (같은 시간대 아직 안 지남)", () => {
      const result = getNextAlarmTime([specific(undefined, 25)], [], 14, 20);
      expect(result).toEqual({ hour: 14, minute: 25 });
    });

    it("매시 25분, 현재 14:25 → 다음 15:25", () => {
      const result = getNextAlarmTime([specific(undefined, 25)], [], 14, 25);
      expect(result).toEqual({ hour: 15, minute: 25 });
    });

    it("매시 25분, 현재 23:25 → 다음 00:25", () => {
      const result = getNextAlarmTime([specific(undefined, 25)], [], 23, 25);
      expect(result).toEqual({ hour: 0, minute: 25 });
    });

    it("16시 정각, 현재 16:00 → 다음 16:00 (내일)", () => {
      const result = getNextAlarmTime([specific(16, undefined)], [], 16, 0);
      expect(result).toEqual({ hour: 16, minute: 0 });
    });
  });

  describe("필터 상호작용", () => {
    it("매 15분 + 필터 09:00~17:00, 현재 16:45 → 다음 17:00", () => {
      const result = getNextAlarmTime(
        [interval(15)],
        [range(9, 0, 17, 0)],
        16,
        45,
      );
      expect(result).toEqual({ hour: 17, minute: 0 });
    });

    it("매시 30분 + 필터 09:00~10:00, 현재 09:30 → 다음 09:30 (다음날)", () => {
      // 10:30은 범위 밖 → 다음 유효한 시각은 09:30
      const result = getNextAlarmTime(
        [specific(undefined, 30)],
        [range(9, 0, 10, 0)],
        9,
        30,
      );
      expect(result).toEqual({ hour: 9, minute: 30 });
    });

    it("특정 시각 20:00 + 필터 09:00~17:00 → null (불가능)", () => {
      const result = getNextAlarmTime(
        [specific(20, 0)],
        [range(9, 0, 17, 0)],
        20,
        0,
      );
      expect(result).toBeNull();
    });

    it("매 60분 + 필터 09:00~11:00, 현재 10:00 → 다음 11:00", () => {
      const result = getNextAlarmTime(
        [interval(60)],
        [range(9, 0, 11, 0)],
        10,
        0,
      );
      expect(result).toEqual({ hour: 11, minute: 0 });
    });
  });

  describe("다중 트리거", () => {
    it("가장 빠른 다음 시각을 반환", () => {
      // 매 60분 (현재 14:30 → 다음 15:00, 거리 30분)
      // 14:30 특정 (현재 14:30 → 내일 14:30, 거리 1440분)
      // → 15:00이 더 가까움
      const result = getNextAlarmTime(
        [interval(60), specific(14, 30)],
        [],
        14,
        30,
      );
      expect(result).toEqual({ hour: 15, minute: 0 });
    });

    it("하나의 트리거가 null이어도 나머지에서 계산", () => {
      const result = getNextAlarmTime(
        [specific(20, 0), interval(15)],
        [range(9, 0, 17, 0)],
        16,
        45,
      );
      // specific(20, 0)은 필터 때문에 null
      // interval(15)는 17:00
      expect(result).toEqual({ hour: 17, minute: 0 });
    });
  });

  describe("엣지 케이스", () => {
    it("빈 필터 배열 → 필터 무조건 통과", () => {
      const result = getNextAlarmTime([interval(30)], [], 12, 0);
      expect(result).toEqual({ hour: 12, minute: 30 });
    });

    it("트리거 1개일 때 정상 동작", () => {
      const result = getNextAlarmTime([specific(9, 0)], [], 9, 0);
      expect(result).toEqual({ hour: 9, minute: 0 });
    });

    it("자정 교차 필터 (22:00~02:00)와 매시 30분", () => {
      const result = getNextAlarmTime(
        [specific(undefined, 30)],
        [range(22, 0, 2, 0)],
        23,
        30,
      );
      expect(result).toEqual({ hour: 0, minute: 30 });
    });
  });
});
