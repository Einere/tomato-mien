import { useState, useEffect } from "react";
import { Provider } from "jotai";
import { AppShell } from "@/components/Layout/AppShell";
import { SplashScreen } from "@/components/SplashScreen";
import { runMigration } from "@/db/migration";
import { useTheme } from "@/hooks/useTheme";

const SLOW_THRESHOLD_MS = 3000;

function HydrationGate({ children }: { children: React.ReactNode }) {
  useTheme();
  const [migrated, setMigrated] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [fadeInDone, setFadeInDone] = useState(false);
  const [slowLoading, setSlowLoading] = useState(false);

  useEffect(() => {
    const slowTimer = setTimeout(() => setSlowLoading(true), SLOW_THRESHOLD_MS);

    runMigration()
      .then(() => {
        clearTimeout(slowTimer);
        setFadeOut(true);
      })
      .catch(err => {
        clearTimeout(slowTimer);
        console.error("[HydrationGate] Migration failed:", err);
        setError(err instanceof Error ? err.message : "Migration failed");
      });

    return () => clearTimeout(slowTimer);
  }, []);

  // fadeOut 시작 후 CSS transition duration(300ms)과 동일한 타이밍으로 migrated 설정
  useEffect(() => {
    if (!fadeOut) return;
    const timer = setTimeout(() => setMigrated(true), 300);
    return () => clearTimeout(timer);
  }, [fadeOut]);

  useEffect(() => {
    if (!migrated) return;
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
          <SplashScreen error={error} slowLoading={slowLoading} />
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
