import { useState, useEffect } from "react";
import { Provider } from "jotai";
import { AppShell } from "@/components/Layout/AppShell";
import { SplashScreen } from "@/components/SplashScreen";
import { runMigration } from "@/db/migration";
import { useTheme } from "@/hooks/useTheme";

function HydrationGate({ children }: { children: React.ReactNode }) {
  useTheme();
  const [migrated, setMigrated] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [fadeInDone, setFadeInDone] = useState(false);

  useEffect(() => {
    runMigration()
      .then(() => {
        setFadeOut(true);
        setTimeout(() => setMigrated(true), 500);
      })
      .catch(err => {
        console.error("[HydrationGate] Migration failed:", err);
        setError(err instanceof Error ? err.message : "Migration failed");
      });
  }, []);

  useEffect(() => {
    if (!migrated) return;
    // Children are mounted with opacity-0 (invisible).
    // Wait two frames so the browser finishes painting the mount,
    // then start the fade-in animation on a clean frame.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    });
  }, [migrated]);

  return (
    <>
      {!visible && (
        <div
          className={`transition-opacity duration-300 ${fadeOut ? "opacity-0" : "opacity-100"}`}
        >
          <SplashScreen error={error} />
        </div>
      )}
      {migrated && (
        <div
          className={
            visible ? (fadeInDone ? "" : "animate-fade-in") : "opacity-0"
          }
          onAnimationEnd={() => setFadeInDone(true)}
        >
          {children}
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <Provider>
      <HydrationGate>
        <AppShell />
      </HydrationGate>
    </Provider>
  );
}

export default App;
