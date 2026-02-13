import { useState, useEffect } from "react";
import { Provider } from "jotai";
import { AppShell } from "@/components/Layout/AppShell";
import { SplashScreen } from "@/components/SplashScreen";
import { runMigration } from "@/db/migration";

function HydrationGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    runMigration()
      .then(() => {
        setFadeOut(true);
        setTimeout(() => setReady(true), 500);
      })
      .catch(err => {
        console.error("[HydrationGate] Migration failed:", err);
        setError(err instanceof Error ? err.message : "Migration failed");
      });
  }, []);

  if (ready) return <>{children}</>;

  return (
    <div
      className={`transition-opacity duration-300 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      <SplashScreen error={error} />
    </div>
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
