import type {
  RangeCondition,
  IntervalCondition,
  SpecificCondition,
} from "@/types/alarm";

// 기본 조건 생성 함수들
export const createDefaultRange = (): RangeCondition => ({
  type: "range",
  startHour: 9,
  startMinute: 0,
  endHour: 17,
  endMinute: 0,
});

export const createDefaultInterval = (): IntervalCondition => ({
  type: "interval",
  intervalMinutes: 15,
});

export const createDefaultSpecific = (): SpecificCondition => ({
  type: "specific",
  hour: 14,
  minute: 30,
});

// 조건 타입 변경 함수
export const createConditionByType = (
  type: "range" | "interval" | "specific",
): RangeCondition | IntervalCondition | SpecificCondition => {
  switch (type) {
    case "range":
      return createDefaultRange();
    case "interval":
      return createDefaultInterval();
    case "specific":
      return createDefaultSpecific();
  }
};
