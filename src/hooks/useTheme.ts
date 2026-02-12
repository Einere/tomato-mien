import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { settingsAtom } from "@/store";

export function useTheme() {
  const settings = useAtomValue(settingsAtom);
  const theme = settings.theme ?? "system";

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
      return;
    }

    if (theme === "light") {
      root.classList.remove("dark");
      return;
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => root.classList.toggle("dark", mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [theme]);
}
