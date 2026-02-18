import { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  ArrowBackIcon,
  OpenInNewIcon,
  CodeIcon,
  LanguageIcon,
  Button,
  MenuRow,
} from "@tomato-mien/ui";
import appLogoImage from "@assets/icon-rounded.png";

const EASTER_EGG_TAP_COUNT = 7;
const EASTER_EGG_RESET_MS = 2000;

export function AboutView({ onBack }: { onBack: () => void }) {
  const [tapCount, setTapCount] = useState(0);
  const [easterEggActive, setEasterEggActive] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleVersionClick = useCallback(() => {
    if (easterEggActive) return;

    const nextCount = tapCount + 1;
    setTapCount(nextCount);

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);

    if (nextCount >= EASTER_EGG_TAP_COUNT) {
      setEasterEggActive(true);
      setTapCount(0);
    } else {
      resetTimerRef.current = setTimeout(() => {
        setTapCount(0);
      }, EASTER_EGG_RESET_MS);
    }
  }, [tapCount, easterEggActive]);

  return (
    <div className="px-5 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Button
          variant="ghost"
          className="h-9 w-9 p-0"
          onClick={onBack}
          aria-label="Back"
        >
          <ArrowBackIcon />
        </Button>
        <h1 className="text-heading-3 text-foreground">About</h1>
      </div>

      <div className="flex flex-col items-center gap-3 py-6">
        <img
          src={appLogoImage}
          alt="Tomato Mien logo"
          className={`h-24 w-24 rounded-2xl ${easterEggActive ? "animate-spin" : ""}`}
        />
        <h2 className="text-heading-2 text-foreground">Tomato Mien</h2>
        <button
          type="button"
          className="text-caption text-muted-foreground cursor-pointer rounded-md px-2 py-1 transition-colors select-none active:bg-black/5 dark:active:bg-white/10"
          onClick={handleVersionClick}
        >
          v{__APP_VERSION__}
        </button>
        {easterEggActive && (
          <p className="text-caption text-primary-600 animate-bounce">
            You found a secret!
          </p>
        )}
        <p className="text-caption text-muted-foreground">
          Simple rule-based alarm app
        </p>
      </div>

      <Card padding="none">
        <MenuRow
          as="a"
          href="https://github.com/Einere/tomato-mien"
          target="_blank"
          rel="noopener noreferrer"
          className="border-border-muted border-b transition-shadow hover:shadow-md"
        >
          <MenuRow.Icon icon={CodeIcon} />
          <MenuRow.Label title="GitHub" />
          <OpenInNewIcon size="sm" />
        </MenuRow>
        <MenuRow
          as="a"
          href="https://einere.github.io/tomato-mien/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-shadow hover:shadow-md"
        >
          <MenuRow.Icon icon={LanguageIcon} />
          <MenuRow.Label title="Homepage" />
          <OpenInNewIcon size="sm" />
        </MenuRow>
      </Card>

      <p className="text-caption text-muted-foreground mt-6 text-center">
        Made by Einere
      </p>
    </div>
  );
}
