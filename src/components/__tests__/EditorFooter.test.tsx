import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorFooter } from "@/components/Editor/EditorFooter";

describe("EditorFooter", () => {
  const defaultProps = {
    onCancel: vi.fn(),
    onSave: vi.fn(),
    hasChanges: true,
    isValid: true,
  };

  it("Save 버튼이 hasChanges=true, isValid=true일 때 활성화", () => {
    render(<EditorFooter {...defaultProps} />);
    const saveButton = screen.getByRole("button", { name: "Save Changes" });
    expect(saveButton).not.toBeDisabled();
  });

  it("Save 버튼이 hasChanges=false일 때 비활성화", () => {
    render(<EditorFooter {...defaultProps} hasChanges={false} />);
    const saveButton = screen.getByRole("button", { name: "Save Changes" });
    expect(saveButton).toBeDisabled();
  });

  it("Save 버튼이 isValid=false일 때 비활성화", () => {
    render(<EditorFooter {...defaultProps} isValid={false} />);
    const saveButton = screen.getByRole("button", { name: "Save Changes" });
    expect(saveButton).toBeDisabled();
  });

  it("Save 버튼이 hasChanges=false, isValid=false일 때 비활성화", () => {
    render(
      <EditorFooter {...defaultProps} hasChanges={false} isValid={false} />,
    );
    const saveButton = screen.getByRole("button", { name: "Save Changes" });
    expect(saveButton).toBeDisabled();
  });

  it("활성화된 Save 버튼 클릭 시 onSave 호출", () => {
    const onSave = vi.fn();
    render(<EditorFooter {...defaultProps} onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it("Cancel 버튼 클릭 시 onCancel 호출", () => {
    const onCancel = vi.fn();
    render(<EditorFooter {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
