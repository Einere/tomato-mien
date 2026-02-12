import { describe, it, expect } from "vitest";
import { cn } from "../cn";

describe("cn", () => {
  it("단일 클래스를 그대로 반환한다", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("여러 클래스를 병합한다", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("Tailwind 충돌 시 후자가 우선한다", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("색상 클래스 충돌을 해결한다", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("falsy 값을 필터링한다", () => {
    expect(cn("px-2", false, null, undefined, "py-1")).toBe("px-2 py-1");
  });

  it("조건부 클래스를 처리한다", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
  });

  it("조건부 false 클래스를 무시한다", () => {
    const isActive = false;
    expect(cn("base", isActive && "active")).toBe("base");
  });

  it("빈 입력 시 빈 문자열을 반환한다", () => {
    expect(cn()).toBe("");
  });

  it("객체 구문을 지원한다", () => {
    expect(cn({ "px-2": true, "py-1": false, "mx-4": true })).toBe("px-2 mx-4");
  });

  it("배열 구문을 지원한다", () => {
    expect(cn(["px-2", "py-1"])).toBe("px-2 py-1");
  });

  it("복합 충돌을 해결한다 (bg-color 계열)", () => {
    expect(cn("bg-primary-600", "bg-danger-600")).toBe("bg-danger-600");
  });
});
