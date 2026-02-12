import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "jotai";
import { EditorSummary } from "@/components/Editor/EditorSummary";
import type { IntervalCondition } from "@/types/alarm";
import type { ValidationIssue } from "@/utils/condition";

const validCondition: IntervalCondition = {
  type: "interval",
  intervalMinutes: 15,
};

describe("EditorSummary", () => {
  it("issues가 비어 있으면 경고를 표시하지 않는다", () => {
    render(
      <Provider>
        <EditorSummary condition={validCondition} issues={[]} />
      </Provider>,
    );
    expect(screen.queryByText(/warning/i)).not.toBeInTheDocument();
  });

  it("issues가 있으면 경고 메시지를 표시한다", () => {
    const issues: ValidationIssue[] = [
      {
        path: "condition.intervalMinutes",
        message: "간격은 720분 이하여야 합니다",
      },
    ];
    render(
      <Provider>
        <EditorSummary condition={validCondition} issues={issues} />
      </Provider>,
    );
    expect(
      screen.getByText("간격은 720분 이하여야 합니다"),
    ).toBeInTheDocument();
  });

  it("여러 issues를 모두 표시한다", () => {
    const issues: ValidationIssue[] = [
      { path: "condition.startHour", message: "시작 시간 오류" },
      { path: "condition.endHour", message: "종료 시간 오류" },
    ];
    render(
      <Provider>
        <EditorSummary condition={validCondition} issues={issues} />
      </Provider>,
    );
    expect(screen.getByText("시작 시간 오류")).toBeInTheDocument();
    expect(screen.getByText("종료 시간 오류")).toBeInTheDocument();
  });

  it("조건 설명을 표시한다", () => {
    render(
      <Provider>
        <EditorSummary condition={validCondition} issues={[]} />
      </Provider>,
    );
    expect(screen.getByText("매 15분")).toBeInTheDocument();
  });
});
