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
});
