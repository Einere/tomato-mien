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
import { usePluginManager } from "@/plugins/usePluginManager";

interface TabDef {
  id: string;
  icon: ComponentType<IconProps>;
  label: string;
  order: number;
}

const coreTabs: TabDef[] = [
  { id: "dashboard", icon: RuleIcon, label: "Rules", order: 0 },
  { id: "settings", icon: SettingsIcon, label: "Settings", order: 100 },
];

function getTabDirection(
  from: ViewState,
  to: ViewState,
): TransitionDirection | undefined {
  if (from === "editor" && to === "dashboard") return "drill-backward";
  if (from === "editor") return undefined;
  if (to === "settings") return "slide-left";
  if (to === "dashboard") return "slide-right";
  return undefined;
}

function getActiveTab(view: ViewState, tabIds: string[]): string {
  if (tabIds.includes(view)) return view;
  return "dashboard";
}

export function BottomNav() {
  const [view, setView] = useAtom(viewAtom);
  const { triggerTransition } = useViewTransition();
  const pluginManager = usePluginManager();

  const pluginTabs: TabDef[] = pluginManager.getNavItems().map(item => ({
    id: item.viewId,
    // Plugin icons are expected to accept IconProps ({ className, size })
    icon: item.icon as ComponentType<IconProps>,
    label: item.label,
    order: item.order ?? 50,
  }));

  const allTabs = [...coreTabs, ...pluginTabs].sort(
    (a, b) => a.order - b.order,
  );

  const tabIds = allTabs.map(t => t.id);
  const currentTab = getActiveTab(view, tabIds);

  return (
    <nav className="pb-safe border-border bg-surface flex items-center justify-around border-t px-2">
      {allTabs.map(tab => {
        const isActive = tab.id === currentTab;
        const TabIcon = tab.icon;

        return (
          <button
            key={tab.id}
            aria-current={isActive ? "page" : undefined}
            onClick={() => {
              const target: ViewState = tab.id;
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
