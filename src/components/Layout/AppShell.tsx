import { useAtomValue } from "jotai";
import { viewAtom } from "@/store";
import { BottomNav } from "./BottomNav";
import { DashboardView } from "@/components/Dashboard/DashboardView";
import { EditorView } from "@/components/Editor/EditorView";
import { SettingsView } from "@/components/Settings/SettingsView";
import { useAlarmService } from "@/hooks/useAlarmService";
import { useElectronMenu } from "@/hooks/useElectronMenu";

export function AppShell() {
  useAlarmService();
  useElectronMenu();

  const view = useAtomValue(viewAtom);
  const isEditor = typeof view === "object" && view.view === "editor";
  const isSettings = view === "settings";

  return (
    <div className='flex h-screen flex-col bg-slate-50'>
      <main className='flex-1 overflow-y-auto'>
        {isEditor ? (
          <EditorView />
        ) : isSettings ? (
          <SettingsView />
        ) : (
          <DashboardView />
        )}
      </main>
      <BottomNav />
    </div>
  );
}
