import { useEffect } from "react";
import { useAtom } from "jotai";
import { settingsAtom, settingsSubViewAtom } from "@/store";
import type { TimeFormat, Theme } from "@/types/alarm";
import {
  Card,
  Select,
  ChevronRightIcon,
  ScheduleIcon,
  DarkModeIcon,
  InfoIcon,
  MenuRow,
} from "@tomato-mien/ui";
import { formatTime, formatTimeRange } from "@/lib/dayjs";
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
  const [subView, setSubView] = useAtom(settingsSubViewAtom);

  useEffect(() => {
    return () => setSubView("main");
  }, [setSubView]);

  const handleTimeFormatChange = (value: string) => {
    setSettings({ ...settings, timeFormat: value as TimeFormat });
  };

  const handleThemeChange = (value: string) => {
    setSettings({ ...settings, theme: value as Theme });
  };

  if (subView === "about") {
    return <AboutView onBack={() => setSubView("main")} />;
  }

  return (
    <div className="px-5 py-6">
      <h1 className="text-heading-1 text-foreground mb-6">Settings</h1>

      <Card padding="none">
        <MenuRow className="border-border-muted border-b">
          <MenuRow.Icon icon={ScheduleIcon} />
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
          <MenuRow.Icon icon={DarkModeIcon} />
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
            onClick={() => setSubView("about")}
          >
            <MenuRow.Icon icon={InfoIcon} />
            <MenuRow.Label
              title="About"
              description="App info & version"
              className="text-left"
            />
            <ChevronRightIcon size="sm" />
          </MenuRow>
        </Card>
      </div>
    </div>
  );
}
