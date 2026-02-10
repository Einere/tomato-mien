import { useAtom } from 'jotai';
import { settingsAtom } from '@/store';
import type { TimeFormat } from '@/types/alarm';
import { Card } from '@/components/UI/Card';
import { Select } from '@/components/UI/Select';
import { Icon } from '@/components/UI/Icon';
import { formatTime, formatTimeRange } from '@/lib/dayjs';

const timeFormatOptions = [
  { value: '24h', label: '24시간제' },
  { value: '12h', label: '12시간제' },
];

export function SettingsView() {
  const [settings, setSettings] = useAtom(settingsAtom);

  const handleTimeFormatChange = (value: string) => {
    setSettings({ ...settings, timeFormat: value as TimeFormat });
  };

  return (
    <div className="px-5 py-6">
      <h1 className="mb-6 text-lg font-bold text-slate-900">Settings</h1>

      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-tomato-100 text-tomato-600">
              <Icon name="schedule" size="sm" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                시간 표시 형식
              </p>
              <p className="text-xs text-slate-500">
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
      </Card>

      <div className="mt-4">
        <span className="mb-2 block text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Preview
        </span>
        <Card padding="sm">
          <div className="flex flex-col gap-2 text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">특정 시각</span>
              <span>{formatTime(14, 30, settings.timeFormat)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">시간 범위</span>
              <span>
                {formatTimeRange(9, 0, 17, 0, settings.timeFormat)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">자정</span>
              <span>{formatTime(0, 0, settings.timeFormat)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
