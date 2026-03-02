import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimerControls } from "../components/TimerControls";

describe("TimerControls", () => {
  const noop = () => {};

  it("shows Start button when idle", () => {
    render(
      <TimerControls
        state="idle"
        isRunning={false}
        onStart={noop}
        onPause={noop}
        onReset={noop}
      />,
    );
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
  });

  it("shows Pause and Reset buttons when running", () => {
    render(
      <TimerControls
        state="working"
        isRunning={true}
        onStart={noop}
        onPause={noop}
        onReset={noop}
      />,
    );
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });

  it("shows Resume and Reset buttons when paused", () => {
    render(
      <TimerControls
        state="working"
        isRunning={false}
        onStart={noop}
        onPause={noop}
        onReset={noop}
      />,
    );
    expect(screen.getByRole("button", { name: "Resume" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });

  it("calls onStart when Start is clicked", () => {
    const onStart = vi.fn();
    render(
      <TimerControls
        state="idle"
        isRunning={false}
        onStart={onStart}
        onPause={noop}
        onReset={noop}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("calls onPause when Pause is clicked", () => {
    const onPause = vi.fn();
    render(
      <TimerControls
        state="working"
        isRunning={true}
        onStart={noop}
        onPause={onPause}
        onReset={noop}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(onPause).toHaveBeenCalledOnce();
  });

  it("calls onReset when Reset is clicked", () => {
    const onReset = vi.fn();
    render(
      <TimerControls
        state="working"
        isRunning={true}
        onStart={noop}
        onPause={noop}
        onReset={onReset}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
