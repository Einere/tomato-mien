import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Provider } from "jotai";
import { createStore } from "jotai";
import { SettingsView } from "../Settings/SettingsView";
import { db } from "@/db/database";

beforeEach(async () => {
  await db.rules.clear();
  await db.settings.clear();
  await db.metadata.clear();
});

function renderWithStore() {
  const store = createStore();
  return render(
    <Provider store={store}>
      <SettingsView />
    </Provider>,
  );
}

describe("About menu item", () => {
  it("renders About card in main settings view", () => {
    renderWithStore();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("App info & version")).toBeInTheDocument();
  });

  it("navigates to AboutView when About card is clicked", () => {
    renderWithStore();
    fireEvent.click(screen.getByText("About"));
    expect(screen.getByText("Tomato Mien")).toBeInTheDocument();
    expect(screen.getByText("Simple rule-based alarm app")).toBeInTheDocument();
    expect(screen.getByText("Made by Einere")).toBeInTheDocument();
  });
});

describe("AboutView", () => {
  function navigateToAbout() {
    renderWithStore();
    fireEvent.click(screen.getByText("About"));
  }

  it("displays app logo", () => {
    navigateToAbout();
    expect(screen.getByAltText("Tomato Mien logo")).toBeInTheDocument();
  });

  it("displays version text", () => {
    navigateToAbout();
    expect(screen.getByText(/^v/)).toBeInTheDocument();
  });

  it("displays Homepage, Privacy Policy, and Support links", () => {
    navigateToAbout();
    const links = screen.getAllByRole("link");
    const hrefs = links.map(link => link.getAttribute("href"));
    expect(hrefs).toContain("https://einere.github.io/tomato-mien/");
    expect(hrefs.some(h => h?.includes("privacy.html"))).toBe(true);
    expect(hrefs).toContain("mailto:kjwsx23@einere.me");
  });

  it("external links open in new tab", () => {
    navigateToAbout();
    const links = screen.getAllByRole("link");
    const externalLinks = links.filter(
      link => !link.getAttribute("href")?.startsWith("mailto:"),
    );
    for (const link of externalLinks) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("navigates back to main settings view", () => {
    navigateToAbout();
    expect(screen.queryByText("Time Format")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByText("Time Format")).toBeInTheDocument();
  });
});

describe("Easter egg", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function navigateToAbout() {
    renderWithStore();
    fireEvent.click(screen.getByText("About"));
  }

  function getVersionButton() {
    return screen.getByText(/^v/);
  }

  it("does not show secret message before 7 clicks", () => {
    navigateToAbout();
    const versionBtn = getVersionButton();
    for (let i = 0; i < 6; i++) {
      fireEvent.click(versionBtn);
    }
    expect(screen.queryByText("You found a secret!")).not.toBeInTheDocument();
  });

  it("shows secret message after 7 clicks", () => {
    navigateToAbout();
    const versionBtn = getVersionButton();
    for (let i = 0; i < 7; i++) {
      fireEvent.click(versionBtn);
    }
    expect(screen.getByText("You found a secret!")).toBeInTheDocument();
  });

  it("spins the logo after 7 clicks", () => {
    navigateToAbout();
    const versionBtn = getVersionButton();
    const logo = screen.getByAltText("Tomato Mien logo");
    expect(logo.className).not.toContain("animate-spin");
    for (let i = 0; i < 7; i++) {
      fireEvent.click(versionBtn);
    }
    expect(logo.className).toContain("animate-spin");
  });

  it("resets click count after 2 second timeout", () => {
    navigateToAbout();
    const versionBtn = getVersionButton();
    for (let i = 0; i < 5; i++) {
      fireEvent.click(versionBtn);
    }
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    // After reset, 2 more clicks should not trigger (total only 2, not 7)
    fireEvent.click(versionBtn);
    fireEvent.click(versionBtn);
    expect(screen.queryByText("You found a secret!")).not.toBeInTheDocument();
  });
});
