import { useAtom } from "jotai";
import { cn } from "@/lib/cn";
import { viewAtom } from "@/store";
import type { ViewState } from "@/store";
import { RuleIcon, SettingsIcon } from "@tomato-mien/ui";
import type { ComponentType } from "react";
import type { IconProps } from "@tomato-mien/ui";
import {
  useViewTransition,
  type TransitionDirection,
} from "@tomato-mien/view-transition";

function getTabDirection(
  from: ViewState,
  to: ViewState,
): TransitionDirection | undefined {
  if (from === "editor" && to === "dashboard") return "drill-backward";
  if (from === "editor") return undefined; // editor → settings: plain crossfade
  if (to === "settings") return "slide-left";
  if (to === "dashboard") return "slide-right";
  return undefined;
}

const tabs = [
  { id: "dashboard", icon: RuleIcon, label: "Rules" },
  { id: "settings", icon: SettingsIcon, label: "Settings" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function getActiveTab(view: ViewState): TabId {
  if (view === "settings") return "settings";
  return "dashboard";
}

export function BottomNav() {
  const [view, setView] = useAtom(viewAtom);
  const { triggerTransition } = useViewTransition();
  const currentTab = getActiveTab(view);

  return (
    <nav className="pb-safe border-border bg-surface flex items-center justify-around border-t px-2">
      {tabs.map(tab => {
        const isActive = tab.id === currentTab;
        const TabIcon: ComponentType<IconProps> = tab.icon;

        return (
          <button
            key={tab.id}
            aria-current={isActive ? "page" : undefined}
            onClick={() => {
              const target: ViewState =
                tab.id === "dashboard" ? "dashboard" : "settings";
              if (view === target) return;
              const direction = getTabDirection(view, target);
              triggerTransition(() => setView(target), direction);
            }}
            className={cn(
              "focus-visible:ring-ring text-caption flex flex-1 flex-col items-center gap-0.5 py-2 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              isActive ? "text-primary-600" : "text-subtle-foreground",
              "cursor-pointer",
            )}
          >
            <TabIcon
              className={cn(
                isActive ? "text-primary-600" : "text-subtle-foreground",
              )}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
