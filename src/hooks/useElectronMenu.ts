import { useEffect } from "react";
import { useSetAtom } from "jotai";
import {
  addRuleAtom,
  enableAllRulesAtom,
  disableAllRulesAtom,
  navigateToAboutAtom,
} from "@/store";
import { useViewTransition } from "@tomato-mien/view-transition";

export function useElectronMenu() {
  const addRule = useSetAtom(addRuleAtom);
  const enableAll = useSetAtom(enableAllRulesAtom);
  const disableAll = useSetAtom(disableAllRulesAtom);
  const navigateToAbout = useSetAtom(navigateToAboutAtom);
  const { triggerTransition } = useViewTransition();

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    api.onMenuAction((_event, action) => {
      switch (action) {
        case "menu-new-rule":
          triggerTransition(() => addRule(), "drill-forward");
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
        case "menu-about":
          triggerTransition(() => navigateToAbout(), "drill-forward");
          break;
      }
    });

    return () => {
      api.removeMenuListeners();
    };
  }, [addRule, enableAll, disableAll, navigateToAbout, triggerTransition]);
}
