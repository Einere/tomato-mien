import { describe, it, expect, beforeEach, vi } from "vitest";
import { PluginManager } from "../PluginManager";
import type { TomatoPlugin, PluginContext } from "@tomato-mien/plugin-core";

function createMockContext(): PluginContext {
  return {
    notifications: { show: vi.fn() },
    audio: { playAlarm: vi.fn() },
  };
}

function createMockPlugin(overrides?: Partial<TomatoPlugin>): TomatoPlugin {
  return {
    id: "test-plugin",
    name: "Test Plugin",
    version: "1.0.0",
    activate: vi.fn(() => ({
      views: [{ id: "test-view", component: () => null }],
      navItems: [
        { viewId: "test-view", label: "Test", icon: () => null, order: 50 },
      ],
    })),
    ...overrides,
  };
}

describe("PluginManager", () => {
  let manager: PluginManager;
  let ctx: PluginContext;

  beforeEach(() => {
    manager = new PluginManager();
    ctx = createMockContext();
  });

  describe("register", () => {
    it("registers a plugin without activating it", () => {
      const plugin = createMockPlugin();
      manager.register(plugin);

      expect(plugin.activate).not.toHaveBeenCalled();
      expect(manager.getPluginList()).toHaveLength(1);
      expect(manager.getPluginList()[0]).toMatchObject({
        id: "test-plugin",
        name: "Test Plugin",
        enabled: false,
      });
    });

    it("throws on duplicate plugin id", () => {
      const plugin = createMockPlugin();
      manager.register(plugin);
      expect(() => manager.register(plugin)).toThrow();
    });
  });

  describe("activate", () => {
    it("calls activate with context and collects contributions", () => {
      const plugin = createMockPlugin();
      manager.register(plugin);
      manager.activate(plugin.id, ctx);

      expect(plugin.activate).toHaveBeenCalledWith(ctx);
      expect(manager.getViews()).toHaveLength(1);
      expect(manager.getViews()[0].id).toBe("test-view");
      expect(manager.getNavItems()).toHaveLength(1);
    });

    it("marks plugin as enabled after activation", () => {
      const plugin = createMockPlugin();
      manager.register(plugin);
      manager.activate(plugin.id, ctx);

      expect(manager.getPluginList()[0].enabled).toBe(true);
    });

    it("throws if plugin is not registered", () => {
      expect(() => manager.activate("unknown", ctx)).toThrow();
    });

    it("is idempotent — activating twice does not duplicate contributions", () => {
      const plugin = createMockPlugin();
      manager.register(plugin);
      manager.activate(plugin.id, ctx);
      manager.activate(plugin.id, ctx);

      expect(manager.getViews()).toHaveLength(1);
    });
  });

  describe("deactivate", () => {
    it("calls deactivate and removes contributions", () => {
      const deactivate = vi.fn();
      const plugin = createMockPlugin({ deactivate });
      manager.register(plugin);
      manager.activate(plugin.id, ctx);
      manager.deactivate(plugin.id);

      expect(deactivate).toHaveBeenCalled();
      expect(manager.getViews()).toHaveLength(0);
      expect(manager.getNavItems()).toHaveLength(0);
      expect(manager.getPluginList()[0].enabled).toBe(false);
    });

    it("handles plugins without deactivate callback", () => {
      const plugin = createMockPlugin({ deactivate: undefined });
      manager.register(plugin);
      manager.activate(plugin.id, ctx);

      expect(() => manager.deactivate(plugin.id)).not.toThrow();
    });
  });

  describe("getViews / getNavItems", () => {
    it("returns empty arrays when no plugins are active", () => {
      expect(manager.getViews()).toEqual([]);
      expect(manager.getNavItems()).toEqual([]);
    });

    it("merges contributions from multiple active plugins", () => {
      const pluginA = createMockPlugin({
        id: "a",
        activate: () => ({
          views: [{ id: "view-a", component: () => null }],
          navItems: [
            { viewId: "view-a", label: "A", icon: () => null, order: 10 },
          ],
        }),
      });
      const pluginB = createMockPlugin({
        id: "b",
        activate: () => ({
          views: [{ id: "view-b", component: () => null }],
          navItems: [
            { viewId: "view-b", label: "B", icon: () => null, order: 20 },
          ],
        }),
      });

      manager.register(pluginA);
      manager.register(pluginB);
      manager.activate("a", ctx);
      manager.activate("b", ctx);

      expect(manager.getViews()).toHaveLength(2);
      expect(manager.getNavItems()).toHaveLength(2);
    });

    it("sorts navItems by order", () => {
      const pluginA = createMockPlugin({
        id: "a",
        activate: () => ({
          navItems: [{ viewId: "a", label: "A", icon: () => null, order: 99 }],
        }),
      });
      const pluginB = createMockPlugin({
        id: "b",
        activate: () => ({
          navItems: [{ viewId: "b", label: "B", icon: () => null, order: 10 }],
        }),
      });

      manager.register(pluginA);
      manager.register(pluginB);
      manager.activate("a", ctx);
      manager.activate("b", ctx);

      const items = manager.getNavItems();
      expect(items[0].label).toBe("B");
      expect(items[1].label).toBe("A");
    });
  });

  describe("resolveView", () => {
    it("returns component for a registered view id", () => {
      const TestComponent = () => null;
      const plugin = createMockPlugin({
        activate: () => ({
          views: [{ id: "test-view", component: TestComponent }],
        }),
      });
      manager.register(plugin);
      manager.activate(plugin.id, ctx);

      expect(manager.resolveView("test-view")).toBe(TestComponent);
    });

    it("returns null for an unknown view id", () => {
      expect(manager.resolveView("unknown")).toBeNull();
    });
  });
});
