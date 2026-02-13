import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorSettings } from "@/components/Editor/EditorSettings";

const defaultProps = {
  isCritical: false,
  onCriticalChange: () => {},
  notificationEnabled: true,
  onNotificationEnabledChange: () => {},
};

describe("EditorSettings", () => {
  it("Critical Alert 토글을 렌더링한다", () => {
    render(<EditorSettings {...defaultProps} />);
    expect(screen.getByText("Critical Alert")).toBeInTheDocument();
  });

  it("토글 클릭 시 onCriticalChange를 호출한다", () => {
    const onCriticalChange = vi.fn();
    render(
      <EditorSettings {...defaultProps} onCriticalChange={onCriticalChange} />,
    );
    const toggles = screen.getAllByRole("switch");
    // Critical Alert 토글은 두 번째
    fireEvent.click(toggles[1]);
    expect(onCriticalChange).toHaveBeenCalledWith(true);
  });

  it("Notification 토글을 렌더링한다", () => {
    render(<EditorSettings {...defaultProps} />);
    expect(screen.getByText("Notification")).toBeInTheDocument();
    expect(screen.getByText("Show in notification center")).toBeInTheDocument();
  });

  it("notificationEnabled=true이면 Notification 토글이 체크된 상태", () => {
    render(<EditorSettings {...defaultProps} notificationEnabled={true} />);
    const toggles = screen.getAllByRole("switch");
    // Notification 토글은 첫 번째
    expect(toggles[0]).toHaveAttribute("aria-checked", "true");
  });

  it("notificationEnabled=false이면 Notification 토글이 해제된 상태", () => {
    render(<EditorSettings {...defaultProps} notificationEnabled={false} />);
    const toggles = screen.getAllByRole("switch");
    expect(toggles[0]).toHaveAttribute("aria-checked", "false");
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
    const toggles = screen.getAllByRole("switch");
    fireEvent.click(toggles[0]);
    expect(onNotificationEnabledChange).toHaveBeenCalledWith(false);
  });
});
