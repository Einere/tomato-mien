import { useAtom } from "jotai";
import { cn } from "@/lib/cn";
import { viewAtom } from "@/store";
import type { ViewState } from "@/store";
import { Icon } from "@/components/UI/Icon";

const tabs = [
  { id: "dashboard", icon: "shield", label: "Rules" },
  { id: "activity", icon: "timeline", label: "Activity" },
  { id: "apps", icon: "apps", label: "Apps" },
  { id: "settings", icon: "settings", label: "Settings" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function getActiveTab(view: ViewState): TabId {
  if (view === "dashboard") return "dashboard";
  if (view === "settings") return "settings";
  if (typeof view === "object" && view.view === "editor") return "dashboard";
  return "dashboard";
}

export function BottomNav() {
  const [view, setView] = useAtom(viewAtom);
  const currentTab = getActiveTab(view);

  return (
    <nav className="pb-safe flex items-center justify-around border-t border-slate-200 bg-white px-2">
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
              "focus-visible:ring-primary-500 flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              isActive && !isPlaceholder
                ? "text-primary-600"
                : "text-slate-400",
              isPlaceholder ? "cursor-default" : "cursor-pointer",
            )}
          >
            <Icon
              name={tab.icon}
              size="sm"
              className={cn(
                isActive && !isPlaceholder
                  ? "text-primary-600"
                  : "text-slate-400",
              )}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
