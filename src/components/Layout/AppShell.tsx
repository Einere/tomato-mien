import { useAtomValue } from "jotai";
import type { ViewState } from "@/store/atoms";
import { viewAtom } from "@/store";
import { BottomNav } from "./BottomNav";
import { DashboardView } from "@/components/Dashboard/DashboardView";
import { EditorView } from "@/components/Editor/EditorView";
import { SettingsView } from "@/components/Settings/SettingsView";
import { useAlarmService } from "@/hooks/useAlarmService";
import { useElectronMenu } from "@/hooks/useElectronMenu";
import { usePluginManager } from "@/plugins/usePluginManager";

function CurrentView({ view }: { view: ViewState }) {
  const pluginManager = usePluginManager();

  if (view === "editor") return <EditorView />;
  if (view === "settings") return <SettingsView />;
  if (view === "dashboard") return <DashboardView />;

  const PluginView = pluginManager.resolveView(view);
  if (PluginView) return <PluginView />;

  return <DashboardView />;
}

export function AppShell() {
  useAlarmService();
  useElectronMenu();

  const view = useAtomValue(viewAtom);

  return (
    <div className="bg-background">
      <div className="mx-auto flex h-screen max-w-xl flex-col">
        <main
          className="flex-1 overflow-y-auto"
          style={{ viewTransitionName: "main-content" }}
        >
          <CurrentView view={view} />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
