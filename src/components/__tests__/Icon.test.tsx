import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  AddIcon,
  AlarmIcon,
  ArrowBackIcon,
  SearchIcon,
  SettingsIcon,
} from "@tomato-mien/ui";

describe("Icon components", () => {
  it("renders SVG element", () => {
    const { container } = render(<AddIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("fill", "currentColor");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("renders at default md size (24px)", () => {
    const { container } = render(<AlarmIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });

  it("renders at sm size (18px)", () => {
    const { container } = render(<ArrowBackIcon size="sm" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "18");
    expect(svg).toHaveAttribute("height", "18");
  });

  it("renders at lg size (32px)", () => {
    const { container } = render(<SearchIcon size="lg" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("applies custom className", () => {
    const { container } = render(
      <SettingsIcon className="mt-1 text-red-500" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-red-500");
    expect(svg).toHaveClass("mt-1");
  });

  it("contains a path element with d attribute", () => {
    const { container } = render(<AddIcon />);
    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path?.getAttribute("d")).toBeTruthy();
  });
});
