interface SplashScreenProps {
  error?: string | null;
}

export function SplashScreen({ error }: SplashScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="animate-splash-bg from-primary-300 via-primary-600 to-primary-800 dark:from-primary-700 dark:via-primary-900 dark:to-secondary-900 absolute inset-0 bg-gradient-to-br" />

      {/* Shimmer overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-splash-shimmer absolute -top-1/2 -left-full h-[200%] w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">
          Tomato Mien
        </h1>
        <p className="text-white/80">v{__APP_VERSION__}</p>
        <div className="h-1 w-16 animate-pulse rounded-full bg-white/60" />
        {error && (
          <div className="bg-danger-600/90 mt-4 max-w-sm rounded-lg px-4 py-3 text-sm text-white shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
