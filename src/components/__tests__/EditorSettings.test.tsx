import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorSettings, timeToDate } from "@/components/Editor/EditorSettings";

const defaultProps = {
  notificationEnabled: true,
  onNotificationEnabledChange: () => {},
  scheduledEnableAt: undefined,
  onScheduledEnableAtChange: () => {},
  ruleEnabled: true,
};

describe("EditorSettings", () => {
  it("Notification 토글을 렌더링한다", () => {
    render(<EditorSettings {...defaultProps} />);
    expect(screen.getByText("Notification")).toBeInTheDocument();
    expect(screen.getByText("Show in notification center")).toBeInTheDocument();
  });

  it("notificationEnabled=true이면 Notification 토글이 체크된 상태", () => {
    render(<EditorSettings {...defaultProps} notificationEnabled={true} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("notificationEnabled=false이면 Notification 토글이 해제된 상태", () => {
    render(<EditorSettings {...defaultProps} notificationEnabled={false} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("Notification 토글 클릭 시 onNotificationEnabledChange를 호출한다", () => {
    const onNotificationEnabledChange = vi.fn();
    render(
      <EditorSettings
        {...defaultProps}
        notificationEnabled={true}
        onNotificationEnabledChange={onNotificationEnabledChange}
      />,
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(onNotificationEnabledChange).toHaveBeenCalledWith(false);
  });

  it("ruleEnabled=true이면 time input이 disabled 상태", () => {
    render(<EditorSettings {...defaultProps} ruleEnabled={true} />);
    expect(screen.getByLabelText("Scheduled activation time")).toBeDisabled();
  });

  it("ruleEnabled=false이면 time input이 enabled 상태", () => {
    render(<EditorSettings {...defaultProps} ruleEnabled={false} />);
    expect(screen.getByLabelText("Scheduled activation time")).toBeEnabled();
  });

  it("scheduledEnableAt이 있고 ruleEnabled=false이면 Clear 버튼 표시", () => {
    render(
      <EditorSettings
        {...defaultProps}
        ruleEnabled={false}
        scheduledEnableAt={new Date(2024, 5, 15, 14, 30)}
      />,
    );
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
  });

  it("scheduledEnableAt이 있어도 ruleEnabled=true이면 Clear 버튼 숨김", () => {
    render(
      <EditorSettings
        {...defaultProps}
        ruleEnabled={true}
        scheduledEnableAt={new Date(2024, 5, 15, 14, 30)}
      />,
    );
    expect(
      screen.queryByRole("button", { name: /clear/i }),
    ).not.toBeInTheDocument();
  });

  it("Clear 버튼 클릭 시 onScheduledEnableAtChange(undefined) 호출", () => {
    const onScheduledEnableAtChange = vi.fn();
    render(
      <EditorSettings
        {...defaultProps}
        ruleEnabled={false}
        scheduledEnableAt={new Date(2024, 5, 15, 14, 30)}
        onScheduledEnableAtChange={onScheduledEnableAtChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(onScheduledEnableAtChange).toHaveBeenCalledWith(undefined);
  });
});

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
});
