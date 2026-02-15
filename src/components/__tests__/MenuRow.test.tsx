import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MenuRow } from "@tomato-mien/ui";

describe("MenuRow", () => {
  it("renders as div by default", () => {
    const { container } = render(
      <MenuRow>
        <span>content</span>
      </MenuRow>,
    );
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("renders as button when as='button'", () => {
    render(
      <MenuRow as="button" type="button">
        <span>content</span>
      </MenuRow>,
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders as anchor when as='a'", () => {
    render(
      <MenuRow as="a" href="https://example.com" target="_blank">
        <span>content</span>
      </MenuRow>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("forwards onClick to button", () => {
    const onClick = vi.fn();
    render(
      <MenuRow as="button" type="button" onClick={onClick}>
        <span>click me</span>
      </MenuRow>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("merges custom className", () => {
    const { container } = render(
      <MenuRow className="custom-class border-b">
        <span>content</span>
      </MenuRow>,
    );
    expect(container.firstChild).toHaveClass("border-b");
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("MenuRow.Icon", () => {
  it("renders icon with the given name", () => {
    render(<MenuRow.Icon name="schedule" />);
    expect(screen.getByText("schedule")).toBeInTheDocument();
  });
});

describe("MenuRow.Label", () => {
  it("renders title", () => {
    render(<MenuRow.Label title="Time Format" />);
    expect(screen.getByText("Time Format")).toBeInTheDocument();
  });

  it("renders title and description", () => {
    render(<MenuRow.Label title="Theme" description="Appearance mode" />);
    expect(screen.getByText("Theme")).toBeInTheDocument();
    expect(screen.getByText("Appearance mode")).toBeInTheDocument();
  });

  it("does not render description paragraph when omitted", () => {
    const { container } = render(<MenuRow.Label title="About" />);
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(1);
  });
});
