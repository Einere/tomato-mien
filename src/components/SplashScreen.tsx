import { useEffect, useState } from "react";

const LOADING_MESSAGES = [
  "Boiling water",
  "Cooking noodles",
  "Making tomato sauce",
  "Slicing tomatoes",
  "Sprinkling pepper",
  "Setting the table",
  "Adjusting the heat",
  "Tasting the broth",
  "Setting the timer",
  "Smells delicious",
  "Chopping cilantro",
  "Slicing celery",
  "Frying spring rolls",
  "Brewing milk tea",
];

const DOT_CYCLE = [".", "..", "..."];
const DOT_INTERVAL_MS = 800;

function pickRandomMessage(): string {
  return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
}

function useLoadingMessage(): string {
  const [message, setMessage] = useState(pickRandomMessage);
  const [dotIndex, setDotIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDotIndex(prev => {
        const next = (prev + 1) % DOT_CYCLE.length;
        if (next === 0) {
          setMessage(pickRandomMessage());
        }
        return next;
      });
    }, DOT_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return `${message}${DOT_CYCLE[dotIndex]}`;
}

interface SplashScreenProps {
  error?: string | null;
  slowLoading?: boolean;
}

export function SplashScreen({ error, slowLoading }: SplashScreenProps) {
  const loadingText = useLoadingMessage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="animate-splash-bg from-primary-300 via-primary-600 to-primary-800 dark:from-primary-600 dark:via-primary-800 dark:to-primary-900 absolute inset-0 bg-gradient-to-br" />

      {/* Shimmer overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-splash-shimmer absolute -top-1/2 -left-full h-[200%] w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">
          Tomato Mien
        </h1>
        <p className="text-white/80">v{__APP_VERSION__}</p>
        <p className="h-6 text-sm text-white/70">{loadingText}</p>
        {slowLoading && (
          <p className="text-xs text-white/50">
            First launch may take a moment...
          </p>
        )}
        {error && (
          <div className="bg-danger-600/90 mt-4 max-w-sm rounded-lg px-4 py-3 text-sm text-white shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
