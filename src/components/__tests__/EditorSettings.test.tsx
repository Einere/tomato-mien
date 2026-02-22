import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorSettings } from "@/components/Editor/EditorSettings";

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

  it("scheduledEnableAt=undefined이면 Clear 버튼이 표시되지 않는다", () => {
    render(
      <EditorSettings
        {...defaultProps}
        ruleEnabled={false}
        scheduledEnableAt={undefined}
      />,
    );
    expect(
      screen.queryByRole("button", { name: /clear/i }),
    ).not.toBeInTheDocument();
  });

  it("time input 변경 시 onScheduledEnableAtChange(Date)를 호출한다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 15, 10, 0));
    const onScheduledEnableAtChange = vi.fn();
    render(
      <EditorSettings
        {...defaultProps}
        ruleEnabled={false}
        onScheduledEnableAtChange={onScheduledEnableAtChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Scheduled activation time"), {
      target: { value: "14:30" },
    });
    expect(onScheduledEnableAtChange).toHaveBeenCalledTimes(1);
    const arg = onScheduledEnableAtChange.mock.calls[0][0];
    expect(arg).toBeInstanceOf(Date);
    expect(arg.getHours()).toBe(14);
    expect(arg.getMinutes()).toBe(30);
    vi.useRealTimers();
  });

  it("과거 시간 입력 시 onScheduledEnableAtChange를 호출하지 않고 에러 메시지를 표시한다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 15, 16, 0));
    const onScheduledEnableAtChange = vi.fn();
    render(
      <EditorSettings
        {...defaultProps}
        ruleEnabled={false}
        onScheduledEnableAtChange={onScheduledEnableAtChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Scheduled activation time"), {
      target: { value: "14:30" },
    });
    expect(onScheduledEnableAtChange).not.toHaveBeenCalled();
    expect(
      screen.getByText("Cannot schedule in the past. Choose a future time."),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("미래 시간 입력 시 에러 메시지가 사라진다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 15, 12, 0));
    const onScheduledEnableAtChange = vi.fn();
    render(
      <EditorSettings
        {...defaultProps}
        ruleEnabled={false}
        onScheduledEnableAtChange={onScheduledEnableAtChange}
      />,
    );
    // 과거 시간 → 에러 발생
    fireEvent.change(screen.getByLabelText("Scheduled activation time"), {
      target: { value: "10:00" },
    });
    expect(
      screen.getByText("Cannot schedule in the past. Choose a future time."),
    ).toBeInTheDocument();
    // 미래 시간 → 에러 해제
    fireEvent.change(screen.getByLabelText("Scheduled activation time"), {
      target: { value: "14:00" },
    });
    expect(
      screen.queryByText("Cannot schedule in the past. Choose a future time."),
    ).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("input 비우기 시 에러 메시지가 사라진다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 15, 12, 0));
    const onScheduledEnableAtChange = vi.fn();
    render(
      <EditorSettings
        {...defaultProps}
        ruleEnabled={false}
        scheduledEnableAt={new Date(2024, 5, 15, 14, 30)}
        onScheduledEnableAtChange={onScheduledEnableAtChange}
      />,
    );
    // 과거 시간 → 에러 발생
    fireEvent.change(screen.getByLabelText("Scheduled activation time"), {
      target: { value: "10:00" },
    });
    expect(
      screen.getByText("Cannot schedule in the past. Choose a future time."),
    ).toBeInTheDocument();
    // 비우기 → 에러 해제 + undefined 전달
    fireEvent.change(screen.getByLabelText("Scheduled activation time"), {
      target: { value: "" },
    });
    expect(
      screen.queryByText("Cannot schedule in the past. Choose a future time."),
    ).not.toBeInTheDocument();
    expect(onScheduledEnableAtChange).toHaveBeenCalledWith(undefined);
    vi.useRealTimers();
  });
});
