import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PomodoroSettings } from "../components/PomodoroSettings";
import type { PomodoroConfig } from "../schemas/pomodoroSchema";

const defaultConfig: PomodoroConfig = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStart: false,
};

describe("PomodoroSettings", () => {
  it("renders all setting fields", () => {
    render(<PomodoroSettings config={defaultConfig} onChange={() => {}} />);
    expect(screen.getByLabelText("Work")).toBeInTheDocument();
    expect(screen.getByLabelText("Short Break")).toBeInTheDocument();
    expect(screen.getByLabelText("Long Break")).toBeInTheDocument();
    expect(screen.getByLabelText("Long Break Every")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("displays current config values", () => {
    render(<PomodoroSettings config={defaultConfig} onChange={() => {}} />);
    expect(screen.getByLabelText("Work")).toHaveValue(25);
    expect(screen.getByLabelText("Short Break")).toHaveValue(5);
    expect(screen.getByLabelText("Long Break")).toHaveValue(15);
    expect(screen.getByLabelText("Long Break Every")).toHaveValue(4);
  });

  it("calls onChange with updated workMinutes", () => {
    const onChange = vi.fn();
    render(<PomodoroSettings config={defaultConfig} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Work"), {
      target: { value: "30" },
    });
    expect(onChange).toHaveBeenCalledWith({
      ...defaultConfig,
      workMinutes: 30,
    });
  });

  it("calls onChange with updated shortBreakMinutes", () => {
    const onChange = vi.fn();
    render(<PomodoroSettings config={defaultConfig} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Short Break"), {
      target: { value: "10" },
    });
    expect(onChange).toHaveBeenCalledWith({
      ...defaultConfig,
      shortBreakMinutes: 10,
    });
  });

  it("calls onChange when autoStart toggled", () => {
    const onChange = vi.fn();
    render(<PomodoroSettings config={defaultConfig} onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith({
      ...defaultConfig,
      autoStart: true,
    });
  });

  it("clamps values to valid range", () => {
    const onChange = vi.fn();
    render(<PomodoroSettings config={defaultConfig} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Work"), {
      target: { value: "200" },
    });
    expect(onChange).toHaveBeenCalledWith({
      ...defaultConfig,
      workMinutes: 120,
    });
  });

  it("clamps values below minimum to 1", () => {
    const onChange = vi.fn();
    render(<PomodoroSettings config={defaultConfig} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Work"), {
      target: { value: "0" },
    });
    expect(onChange).toHaveBeenCalledWith({
      ...defaultConfig,
      workMinutes: 1,
    });
  });
});
