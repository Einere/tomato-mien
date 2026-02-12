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
          if (window.confirm("모든 규칙을 활성화하시겠습니까?")) {
            enableAll();
          }
          break;
        case "menu-disable-all-alarms":
          if (window.confirm("모든 규칙을 비활성화하시겠습니까?")) {
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
