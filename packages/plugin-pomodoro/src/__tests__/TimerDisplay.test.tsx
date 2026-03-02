import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimerDisplay } from "../components/TimerDisplay";

describe("TimerDisplay", () => {
  it("displays formatted remaining time", () => {
    render(
      <TimerDisplay remainingSeconds={1500} totalSeconds={1500} state="working" />,
    );
    expect(screen.getByText("25:00")).toBeInTheDocument();
  });

  it("displays 00:00 when remaining is 0", () => {
    render(
      <TimerDisplay remainingSeconds={0} totalSeconds={1500} state="idle" />,
    );
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("shows state label for working", () => {
    render(
      <TimerDisplay remainingSeconds={1500} totalSeconds={1500} state="working" />,
    );
    expect(screen.getByText("Focus")).toBeInTheDocument();
  });

  it("shows state label for shortBreak", () => {
    render(
      <TimerDisplay
        remainingSeconds={300}
        totalSeconds={300}
        state="shortBreak"
      />,
    );
    expect(screen.getByText("Short Break")).toBeInTheDocument();
  });

  it("shows state label for longBreak", () => {
    render(
      <TimerDisplay
        remainingSeconds={900}
        totalSeconds={900}
        state="longBreak"
      />,
    );
    expect(screen.getByText("Long Break")).toBeInTheDocument();
  });

  it("renders SVG progress circle", () => {
    const { container } = render(
      <TimerDisplay remainingSeconds={750} totalSeconds={1500} state="working" />,
    );
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBeGreaterThanOrEqual(2);
  });
});
