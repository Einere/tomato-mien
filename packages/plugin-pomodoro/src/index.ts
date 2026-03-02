import type { TomatoPlugin } from "@tomato-mien/plugin-core";
import { TimerIcon } from "@tomato-mien/ui";
import { PomodoroView } from "./PomodoroView";

export const pomodoroPlugin: TomatoPlugin = {
  id: "pomodoro",
  name: "Pomodoro Timer",
  version: "0.1.0",
  description: "25min work, 5min break cycles",

  activate() {
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
};
