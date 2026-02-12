import { useAtom } from "jotai";
import { settingsAtom } from "@/store";
import type { TimeFormat, Theme } from "@/types/alarm";
import { Card } from "@/components/UI/Card";
import { Select } from "@/components/UI/Select";
import { Icon } from "@/components/UI/Icon";
import { formatTime, formatTimeRange } from "@/lib/dayjs";

const timeFormatOptions = [
  { value: "24h", label: "24시간제" },
  { value: "12h", label: "12시간제" },
];

const themeOptions = [
  { value: "system", label: "시스템" },
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
];

export function SettingsView() {
  const [settings, setSettings] = useAtom(settingsAtom);

  const handleTimeFormatChange = (value: string) => {
    setSettings({ ...settings, timeFormat: value as TimeFormat });
  };

  const handleThemeChange = (value: string) => {
    setSettings({ ...settings, theme: value as Theme });
  };

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
                시간 표시 형식
              </p>
              <p className="text-caption text-muted-foreground">
                알람 시간을 표시하는 방식
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
              <p className="text-body text-foreground font-semibold">테마</p>
              <p className="text-caption text-muted-foreground">
                화면 밝기 모드 설정
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
                특정 시각
              </span>
              <span>{formatTime(14, 30, settings.timeFormat)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-caption text-muted-foreground">
                시간 범위
              </span>
              <span>{formatTimeRange(9, 0, 17, 0, settings.timeFormat)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-caption text-muted-foreground">자정</span>
              <span>{formatTime(0, 0, settings.timeFormat)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
