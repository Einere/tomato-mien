import { createContext } from "react";
import type { PluginManager } from "./PluginManager";

export const PluginManagerContext = createContext<PluginManager | null>(null);

export const PluginManagerProvider = PluginManagerContext.Provider;
