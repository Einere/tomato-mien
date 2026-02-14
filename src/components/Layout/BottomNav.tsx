import { useAtom } from "jotai";
import { cn } from "@/lib/cn";
import { viewAtom } from "@/store";
import type { ViewState } from "@/store";
import { Icon } from "@tomato-mien/ui";

const tabs = [
  { id: "dashboard", icon: "rule", label: "Rules" },
  // NOTE: 당장 사용하지 않는 메뉴
  // { id: "activity", icon: "timeline", label: "Activity" },
  // { id: "apps", icon: "apps", label: "Apps" },
  { id: "settings", icon: "settings", label: "Settings" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function getActiveTab(view: ViewState): TabId {
  if (view === "settings") return "settings";
  return "dashboard";
}

export function BottomNav() {
  const [view, setView] = useAtom(viewAtom);
  const currentTab = getActiveTab(view);

  return (
    <nav className="pb-safe border-border bg-surface flex items-center justify-around border-t px-2">
      {tabs.map(tab => {
        const isActive = tab.id === currentTab;
        const isPlaceholder = tab.id !== "dashboard" && tab.id !== "settings";

        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === "dashboard") {
                setView("dashboard");
              } else if (tab.id === "settings") {
                setView("settings");
              }
            }}
            className={cn(
              "focus-visible:ring-ring text-caption flex flex-1 flex-col items-center gap-0.5 py-2 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              isActive && !isPlaceholder
                ? "text-primary-600"
                : "text-subtle-foreground",
              isPlaceholder ? "cursor-default" : "cursor-pointer",
            )}
          >
            <Icon
              name={tab.icon}
              size="sm"
              className={cn(
                isActive && !isPlaceholder
                  ? "text-primary-600"
                  : "text-subtle-foreground",
              )}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
