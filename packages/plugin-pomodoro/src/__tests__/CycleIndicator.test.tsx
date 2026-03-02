import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CycleIndicator } from "../components/CycleIndicator";

describe("CycleIndicator", () => {
  it("renders correct number of dots", () => {
    render(<CycleIndicator completed={2} total={4} />);
    const dots = screen.getAllByTestId("cycle-dot");
    expect(dots).toHaveLength(4);
  });

  it("marks completed cycles", () => {
    const { container } = render(<CycleIndicator completed={2} total={4} />);
    const filledDots = container.querySelectorAll("[data-completed='true']");
    const emptyDots = container.querySelectorAll("[data-completed='false']");
    expect(filledDots).toHaveLength(2);
    expect(emptyDots).toHaveLength(2);
  });

  it("shows cycle count text", () => {
    render(<CycleIndicator completed={2} total={4} />);
    expect(screen.getByText("2 / 4")).toBeInTheDocument();
  });

  it("handles 0 completed cycles", () => {
    const { container } = render(<CycleIndicator completed={0} total={4} />);
    const filledDots = container.querySelectorAll("[data-completed='true']");
    expect(filledDots).toHaveLength(0);
  });

  it("handles all cycles completed", () => {
    const { container } = render(<CycleIndicator completed={4} total={4} />);
    const filledDots = container.querySelectorAll("[data-completed='true']");
    expect(filledDots).toHaveLength(4);
  });
});
