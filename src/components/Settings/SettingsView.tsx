import { useState } from "react";
import { useAtom } from "jotai";
import { settingsAtom } from "@/store";
import type { TimeFormat, Theme } from "@/types/alarm";
import { Card, Select, Icon, Button } from "@tomato-mien/ui";
import { formatTime, formatTimeRange } from "@/lib/dayjs";
import tossQrImage from "@/assets/toss_qr.png";

const timeFormatOptions = [
  { value: "24h", label: "24-hour" },
  { value: "12h", label: "12-hour" },
];

const themeOptions = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function SupportView({ onBack }: { onBack: () => void }) {
  return (
    <div className="px-5 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <Icon name="arrow_back" size="sm" />
        </Button>
        <h1 className="text-heading-3 text-foreground">Support This Project</h1>
      </div>

      <Card padding="none">
        <div className="flex flex-col items-center gap-3 p-6">
          <p className="text-caption text-muted-foreground text-center">
            Scan the QR code with Toss to buy me a coffee
          </p>
          <img
            src={tossQrImage}
            alt="Toss QR code for donation"
            className="h-48 w-48 rounded-lg"
          />
        </div>
      </Card>
    </div>
  );
}

export function SettingsView() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [subView, setSubView] = useState<"main" | "support">("main");

  const handleTimeFormatChange = (value: string) => {
    setSettings({ ...settings, timeFormat: value as TimeFormat });
  };

  const handleThemeChange = (value: string) => {
    setSettings({ ...settings, theme: value as Theme });
  };

  if (subView === "support") {
    return <SupportView onBack={() => setSubView("main")} />;
  }

  return (
    <div className="px-5 py-6">
      <h1 className="text-heading-3 text-foreground mb-6">Settings</h1>

      <Card padding="none">
        <div className="border-border-muted flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <div className="bg-accent text-accent-foreground flex h-9 w-9 items-center justify-center rounded-lg">
              <Icon name="schedule" size="sm" />
            </div>
            <div>
              <p className="text-body text-foreground font-semibold">
                Time Format
              </p>
              <p className="text-caption text-muted-foreground">
                How alarm times are displayed
              </p>
            </div>
          </div>
          <Select
            value={settings.timeFormat}
            onChange={handleTimeFormatChange}
            options={timeFormatOptions}
          />
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="bg-accent text-accent-foreground flex h-9 w-9 items-center justify-center rounded-lg">
              <Icon name="dark_mode" size="sm" />
            </div>
            <div>
              <p className="text-body text-foreground font-semibold">Theme</p>
              <p className="text-caption text-muted-foreground">
                Appearance mode
              </p>
            </div>
          </div>
          <Select
            value={settings.theme ?? "system"}
            onChange={handleThemeChange}
            options={themeOptions}
          />
        </div>
      </Card>

      <div className="mt-4">
        <span className="text-overline text-subtle-foreground mb-2 block">
          Preview
        </span>
        <Card padding="sm">
          <div className="text-body text-foreground flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-caption text-muted-foreground">
                Specific Time
              </span>
              <span>{formatTime(14, 30, settings.timeFormat)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-caption text-muted-foreground">
                Time Range
              </span>
              <span>{formatTimeRange(9, 0, 17, 0, settings.timeFormat)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-caption text-muted-foreground">
                Midnight
              </span>
              <span>{formatTime(0, 0, settings.timeFormat)}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card padding="none">
          <button
            type="button"
            className="focus-visible:ring-ring flex w-full cursor-pointer items-center justify-between rounded-xl p-4 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={() => setSubView("support")}
          >
            <div className="flex items-center gap-3">
              <div className="bg-accent text-accent-foreground flex h-9 w-9 items-center justify-center rounded-lg">
                <Icon name="favorite_border" size="sm" />
              </div>
              <div className="text-left">
                <p className="text-body text-foreground font-semibold">
                  Support This Project
                </p>
                <p className="text-caption text-muted-foreground">
                  Buy me a coffee via Toss
                </p>
              </div>
            </div>
            <Icon name="chevron_right" size="sm" />
          </button>
        </Card>
      </div>
    </div>
  );
}
