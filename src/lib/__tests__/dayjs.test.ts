import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { timeToDate, getMinTimeValue, isTimeAfterNow } from "@/lib/dayjs";

describe("timeToDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("미래 시각이면 오늘 날짜로 Date를 생성한다", () => {
    vi.setSystemTime(new Date(2024, 5, 15, 10, 0)); // 2024-06-15 10:00
    const result = timeToDate("14:30");
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it("이미 지난 시각이면 내일 날짜로 Date를 생성한다", () => {
    vi.setSystemTime(new Date(2024, 5, 15, 16, 0)); // 2024-06-15 16:00
    const result = timeToDate("14:30");
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(16);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it("현재 시각과 동일하면 내일로 설정한다", () => {
    vi.setSystemTime(new Date(2024, 5, 15, 14, 30)); // 2024-06-15 14:30
    const result = timeToDate("14:30");
    expect(result.getDate()).toBe(16);
  });

  it("월말에 내일로 넘어가면 다음 달로 설정된다", () => {
    vi.setSystemTime(new Date(2024, 5, 30, 23, 0)); // 2024-06-30 23:00
    const result = timeToDate("09:00");
    expect(result.getMonth()).toBe(6); // July
    expect(result.getDate()).toBe(1);
  });

  it("잘못된 포맷이면 에러를 던진다", () => {
    expect(() => timeToDate("invalid")).toThrow(
      'Invalid time format: "invalid". Expected "HH:mm".',
    );
  });

  it("빈 문자열이면 에러를 던진다", () => {
    expect(() => timeToDate("")).toThrow(
      'Invalid time format: "". Expected "HH:mm".',
    );
  });

  it("숫자가 아닌 값이면 에러를 던진다", () => {
    expect(() => timeToDate("ab:cd")).toThrow(
      'Invalid time format: "ab:cd". Expected "HH:mm".',
    );
  });
});

describe("isTimeAfterNow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("미래 시각이면 true를 반환한다", () => {
    vi.setSystemTime(new Date(2024, 5, 15, 10, 0));
    expect(isTimeAfterNow("14:30")).toBe(true);
  });

  it("과거 시각이면 false를 반환한다", () => {
    vi.setSystemTime(new Date(2024, 5, 15, 16, 0));
    expect(isTimeAfterNow("14:30")).toBe(false);
  });

  it("현재 시각과 동일하면 false를 반환한다", () => {
    vi.setSystemTime(new Date(2024, 5, 15, 14, 30));
    expect(isTimeAfterNow("14:30")).toBe(false);
  });

  it("잘못된 포맷이면 false를 반환한다", () => {
    expect(isTimeAfterNow("invalid")).toBe(false);
    expect(isTimeAfterNow("")).toBe(false);
    expect(isTimeAfterNow("ab:cd")).toBe(false);
  });
});

describe("getMinTimeValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("현재 시각 +1분을 HH:mm 형식으로 반환한다", () => {
    vi.setSystemTime(new Date(2024, 5, 15, 10, 30));
    expect(getMinTimeValue()).toBe("10:31");
  });

  it("59분일 때 다음 시각의 00분을 반환한다", () => {
    vi.setSystemTime(new Date(2024, 5, 15, 10, 59));
    expect(getMinTimeValue()).toBe("11:00");
  });

  it("23:59일 때 00:00을 반환한다", () => {
    vi.setSystemTime(new Date(2024, 5, 15, 23, 59));
    expect(getMinTimeValue()).toBe("00:00");
  });
});
