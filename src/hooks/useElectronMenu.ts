import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { addRuleAtom, enableAllRulesAtom, disableAllRulesAtom } from "@/store";

export function useElectronMenu() {
  const addRule = useSetAtom(addRuleAtom);
  const enableAll = useSetAtom(enableAllRulesAtom);
  const disableAll = useSetAtom(disableAllRulesAtom);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    api.onMenuAction((_event, action) => {
      switch (action) {
        case "menu-new-rule":
          addRule();
          break;
        case "menu-enable-all-alarms":
          if (window.confirm("Enable all rules?")) {
            enableAll();
          }
          break;
        case "menu-disable-all-alarms":
          if (window.confirm("Disable all rules?")) {
            disableAll();
          }
          break;
      }
    });

    return () => {
      api.removeMenuListeners();
    };
  }, [addRule, enableAll, disableAll]);
}
