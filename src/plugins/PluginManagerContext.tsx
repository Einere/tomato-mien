import { createContext, useContext } from "react";
import type { PluginManager } from "./PluginManager";

const PluginManagerContext = createContext<PluginManager | null>(null);

export const PluginManagerProvider = PluginManagerContext.Provider;

export function usePluginManager(): PluginManager {
  const manager = useContext(PluginManagerContext);
  if (!manager) {
    throw new Error(
      "usePluginManager must be used within PluginManagerProvider",
    );
  }
  return manager;
}
