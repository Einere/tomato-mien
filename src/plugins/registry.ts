import type { TomatoPlugin } from "@tomato-mien/plugin-core";
import { pomodoroPlugin } from "@tomato-mien/plugin-pomodoro";

/** 빌트인 플러그인 목록. 새 플러그인은 여기에 추가한다. */
export const builtinPlugins: TomatoPlugin[] = [pomodoroPlugin];
