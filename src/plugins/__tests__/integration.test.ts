import { describe, it, expect } from "vitest";
import { PluginManager } from "../PluginManager";
import { pomodoroPlugin } from "@tomato-mien/plugin-pomodoro";
import type { PluginContext } from "@tomato-mien/plugin-core";

function createMockContext(): PluginContext {
  return {
    notifications: { show: async () => {} },
    audio: { playAlarm: async () => {} },
  };
}

describe("Plugin system integration", () => {
  it("registers and activates the pomodoro plugin", () => {
    const manager = new PluginManager();
    const ctx = createMockContext();

    manager.register(pomodoroPlugin);
    manager.activate("pomodoro", ctx);

    expect(manager.getViews()).toHaveLength(1);
    expect(manager.getViews()[0].id).toBe("pomodoro");

    expect(manager.getNavItems()).toHaveLength(1);
    expect(manager.getNavItems()[0].label).toBe("Pomodoro");

    expect(manager.resolveView("pomodoro")).toBeDefined();
  });

  it("lists pomodoro in plugin list as enabled", () => {
    const manager = new PluginManager();
    const ctx = createMockContext();

    manager.register(pomodoroPlugin);
    manager.activate("pomodoro", ctx);

    const list = manager.getPluginList();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      id: "pomodoro",
      name: "Pomodoro Timer",
      enabled: true,
    });
  });

  it("deactivates cleanly", () => {
    const manager = new PluginManager();
    const ctx = createMockContext();

    manager.register(pomodoroPlugin);
    manager.activate("pomodoro", ctx);
    manager.deactivate("pomodoro");

    expect(manager.getViews()).toHaveLength(0);
    expect(manager.getNavItems()).toHaveLength(0);
    expect(manager.getPluginList()[0].enabled).toBe(false);
  });
});
