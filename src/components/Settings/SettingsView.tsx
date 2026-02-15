import { useState } from "react";
import { useAtom } from "jotai";
import { settingsAtom } from "@/store";
import type { TimeFormat, Theme } from "@/types/alarm";
import { Card, Select, Icon, MenuRow } from "@tomato-mien/ui";
import { formatTime, formatTimeRange } from "@/lib/dayjs";
import { SupportView } from "./SupportView";
import { AboutView } from "./AboutView";

const timeFormatOptions = [
  { value: "24h", label: "24-hour" },
  { value: "12h", label: "12-hour" },
];

const themeOptions = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function SettingsView() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [subView, setSubView] = useState<"main" | "support" | "about">("main");

  const handleTimeFormatChange = (value: string) => {
    setSettings({ ...settings, timeFormat: value as TimeFormat });
  };

  const handleThemeChange = (value: string) => {
    setSettings({ ...settings, theme: value as Theme });
  };

  if (subView === "support") {
    return <SupportView onBack={() => setSubView("main")} />;
  }

  if (subView === "about") {
    return <AboutView onBack={() => setSubView("main")} />;
  }

  return (
    <div className="px-5 py-6">
      <h1 className="text-heading-3 text-foreground mb-6">Settings</h1>

      <Card padding="none">
        <MenuRow className="border-border-muted border-b">
          <MenuRow.Icon name="schedule" />
          <MenuRow.Label
            title="Time Format"
            description="How alarm times are displayed"
          />
          <Select
            value={settings.timeFormat}
            onChange={handleTimeFormatChange}
            options={timeFormatOptions}
          />
        </MenuRow>
        <MenuRow>
          <MenuRow.Icon name="dark_mode" />
          <MenuRow.Label title="Theme" description="Appearance mode" />
          <Select
            value={settings.theme ?? "system"}
            onChange={handleThemeChange}
            options={themeOptions}
          />
        </MenuRow>
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

      <div className="mt-6 flex flex-col gap-3">
        <Card padding="none">
          <MenuRow
            as="button"
            type="button"
            className="focus-visible:ring-ring w-full cursor-pointer rounded-xl transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={() => setSubView("support")}
          >
            <MenuRow.Icon name="favorite_border" />
            <MenuRow.Label
              title="Support This Project"
              description="Buy me a coffee via Toss"
              className="text-left"
            />
            <Icon name="chevron_right" size="sm" />
          </MenuRow>
        </Card>

        <Card padding="none">
          <MenuRow
            as="button"
            type="button"
            className="focus-visible:ring-ring w-full cursor-pointer rounded-xl transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={() => setSubView("about")}
          >
            <MenuRow.Icon name="info" />
            <MenuRow.Label
              title="About"
              description="App info & version"
              className="text-left"
            />
            <Icon name="chevron_right" size="sm" />
          </MenuRow>
        </Card>
      </div>
    </div>
  );
}
