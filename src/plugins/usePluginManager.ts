import { useContext } from "react";
import { PluginManagerContext } from "./PluginManagerContext";
import type { PluginManager } from "./PluginManager";

export function usePluginManager(): PluginManager {
  const manager = useContext(PluginManagerContext);
  if (!manager) {
    throw new Error(
      "usePluginManager must be used within PluginManagerProvider",
    );
  }
  return manager;
}
