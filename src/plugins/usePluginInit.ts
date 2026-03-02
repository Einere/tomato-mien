import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { settingsAtom } from "@/store";
import { PluginManager } from "./PluginManager";
import { createPluginContext } from "./createPluginContext";
import { builtinPlugins } from "./registry";

export function usePluginInit(): PluginManager {
  const settings = useAtomValue(settingsAtom);
  const enabledIds = settings.enabledPlugins ?? [];

  const manager = useMemo(() => {
    // DESIGN CONTRACT: PluginManager is created once at app startup.
    // enabledPlugins changes require app restart to take effect.
    // PluginSection UI displays "Changes take effect after restarting the app."
    const mgr = new PluginManager();
    const ctx = createPluginContext();

    for (const plugin of builtinPlugins) {
      mgr.register(plugin);
    }
    for (const id of enabledIds) {
      try {
        mgr.activate(id, ctx);
      } catch (error) {
        console.warn(`[PluginManager] Failed to activate plugin: ${id}`, error);
      }
    }
    return mgr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return manager;
}
