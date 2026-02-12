import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SpecificTimeInput } from "@/components/Editor/ConditionInputs/SpecificTimeInput";
import type { SpecificCondition } from "@/types/alarm";

function makeCondition(
  overrides: Partial<SpecificCondition> = {},
): SpecificCondition {
  return { type: "specific", hour: 14, minute: 30, ...overrides };
}

describe("SpecificTimeInput", () => {
  it('hour select에서 "매시" 선택 시 hour=undefined로 onChange 호출', () => {
    const onChange = vi.fn();
    render(
      <SpecificTimeInput condition={makeCondition()} onChange={onChange} />,
    );

    const [hourSelect] = screen.getAllByRole("combobox");
    fireEvent.change(hourSelect, { target: { value: "" } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: "specific", hour: undefined }),
    );
  });

  it("hour select에서 숫자 선택 시 해당 숫자로 onChange 호출", () => {
    const onChange = vi.fn();
    render(
      <SpecificTimeInput
        condition={makeCondition({ hour: undefined })}
        onChange={onChange}
      />,
    );

    const [hourSelect] = screen.getAllByRole("combobox");
    fireEvent.change(hourSelect, { target: { value: "0" } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: "specific", hour: 0 }),
    );
  });

  it("minute select 변경 시 올바른 minute 값으로 onChange 호출", () => {
    const onChange = vi.fn();
    render(
      <SpecificTimeInput condition={makeCondition()} onChange={onChange} />,
    );

    const selects = screen.getAllByRole("combobox");
    const minuteSelect = selects[1];
    fireEvent.change(minuteSelect, { target: { value: "45" } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: "specific", minute: 45 }),
    );
  });

  it("기존 condition 값이 select에 올바르게 반영됨", () => {
    render(
      <SpecificTimeInput
        condition={makeCondition({ hour: 8, minute: 15 })}
        onChange={() => {}}
      />,
    );

    const [hourSelect, minuteSelect] = screen.getAllByRole("combobox");
    expect(hourSelect).toHaveValue("8");
    expect(minuteSelect).toHaveValue("15");
  });

  it("hour=undefined일 때 hour select가 매시(빈 값)로 표시됨", () => {
    render(
      <SpecificTimeInput
        condition={makeCondition({ hour: undefined, minute: 25 })}
        onChange={() => {}}
      />,
    );

    const [hourSelect, minuteSelect] = screen.getAllByRole("combobox");
    expect(hourSelect).toHaveValue("");
    expect(minuteSelect).toHaveValue("25");
  });

  it("hour=0(자정)이 올바르게 표시됨", () => {
    render(
      <SpecificTimeInput
        condition={makeCondition({ hour: 0, minute: 0 })}
        onChange={() => {}}
      />,
    );

    const [hourSelect] = screen.getAllByRole("combobox");
    expect(hourSelect).toHaveValue("0");
  });
});
