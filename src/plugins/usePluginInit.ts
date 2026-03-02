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
    const mgr = new PluginManager();
    const ctx = createPluginContext();

    for (const plugin of builtinPlugins) {
      mgr.register(plugin);
    }
    for (const id of enabledIds) {
      try {
        mgr.activate(id, ctx);
      } catch {
        console.warn(`[PluginManager] Failed to activate plugin: ${id}`);
      }
    }
    return mgr;
    // enabledIds는 앱 재시작 시에만 반영되므로 의존성 불필요
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return manager;
}
