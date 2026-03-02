import type { PluginContext, TomatoPlugin } from "@tomato-mien/plugin-core";
import { TimerIcon } from "@tomato-mien/ui";
import { PomodoroView } from "./PomodoroView";

/**
 * Module-level plugin context. Set by PluginManager.activate(),
 * which runs outside React lifecycle. Do NOT call activate()
 * from within useEffect or component render.
 */
let pluginCtx: PluginContext | null = null;

export function getPluginContext(): PluginContext {
  if (!pluginCtx) throw new Error("Pomodoro plugin not activated");
  return pluginCtx;
}

export const pomodoroPlugin: TomatoPlugin = {
  id: "pomodoro",
  name: "Pomodoro Timer",
  version: "0.1.0",
  description: "25min work, 5min break cycles",

  activate(ctx) {
    pluginCtx = ctx;
    return {
      views: [{ id: "pomodoro", component: PomodoroView }],
      navItems: [
        {
          viewId: "pomodoro",
          label: "Pomodoro",
          icon: TimerIcon,
          order: 30,
        },
      ],
    };
  },

  deactivate() {
    pluginCtx = null;
  },
};
