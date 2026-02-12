import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorSettings } from "@/components/Editor/EditorSettings";

describe("EditorSettings", () => {
  it("Critical Alert 토글을 렌더링한다", () => {
    render(<EditorSettings isCritical={false} onCriticalChange={() => {}} />);
    expect(screen.getByText("Critical Alert")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("isCritical=true이면 토글이 체크된 상태로 렌더링된다", () => {
    render(<EditorSettings isCritical={true} onCriticalChange={() => {}} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("토글 클릭 시 onCriticalChange를 호출한다", () => {
    const onCriticalChange = vi.fn();
    render(
      <EditorSettings isCritical={false} onCriticalChange={onCriticalChange} />,
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(onCriticalChange).toHaveBeenCalledWith(true);
  });

  it("Notification Sound 섹션이 없다", () => {
    render(<EditorSettings isCritical={false} onCriticalChange={() => {}} />);
    expect(screen.queryByText("Notification Sound")).not.toBeInTheDocument();
  });
});
