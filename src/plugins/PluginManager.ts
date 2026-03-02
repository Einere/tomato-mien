import type {
  TomatoPlugin,
  PluginContext,
  PluginContributions,
  ViewContribution,
  NavItemContribution,
} from "@tomato-mien/plugin-core";
import type { ComponentType } from "react";

export interface PluginInfo {
  id: string;
  name: string;
  version: string;
  description?: string;
  enabled: boolean;
}

interface RegisteredPlugin {
  plugin: TomatoPlugin;
  contributions: PluginContributions | null;
  enabled: boolean;
}

export class PluginManager {
  private plugins = new Map<string, RegisteredPlugin>();

  register(plugin: TomatoPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin "${plugin.id}" is already registered`);
    }
    this.plugins.set(plugin.id, {
      plugin,
      contributions: null,
      enabled: false,
    });
  }

  activate(pluginId: string, ctx: PluginContext): void {
    const entry = this.plugins.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin "${pluginId}" is not registered`);
    }
    if (entry.enabled) return;

    entry.contributions = entry.plugin.activate(ctx);
    entry.enabled = true;
  }

  deactivate(pluginId: string): void {
    const entry = this.plugins.get(pluginId);
    if (!entry || !entry.enabled) return;

    entry.plugin.deactivate?.();
    entry.contributions = null;
    entry.enabled = false;
  }

  getViews(): ViewContribution[] {
    const views: ViewContribution[] = [];
    for (const entry of this.plugins.values()) {
      if (entry.enabled && entry.contributions?.views) {
        views.push(...entry.contributions.views);
      }
    }
    return views;
  }

  getNavItems(): NavItemContribution[] {
    const items: NavItemContribution[] = [];
    for (const entry of this.plugins.values()) {
      if (entry.enabled && entry.contributions?.navItems) {
        items.push(...entry.contributions.navItems);
      }
    }
    return items.sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
  }

  resolveView(viewId: string): ComponentType | null {
    for (const entry of this.plugins.values()) {
      if (!entry.enabled || !entry.contributions?.views) continue;
      const view = entry.contributions.views.find(v => v.id === viewId);
      if (view) return view.component;
    }
    return null;
  }

  getPluginList(): PluginInfo[] {
    return Array.from(this.plugins.values()).map(entry => ({
      id: entry.plugin.id,
      name: entry.plugin.name,
      version: entry.plugin.version,
      description: entry.plugin.description,
      enabled: entry.enabled,
    }));
  }
}
