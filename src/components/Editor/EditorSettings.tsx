import { Card } from "@/components/UI/Card";
import { Toggle } from "@/components/UI/Toggle";
import { Select } from "@/components/UI/Select";

const soundOptions = [
  { value: "default", label: "Default" },
  { value: "bell", label: "Bell" },
  { value: "chime", label: "Chime" },
  { value: "alert", label: "Alert" },
];

interface EditorSettingsProps {
  isCritical: boolean;
  soundName: string;
  onCriticalChange: (value: boolean) => void;
  onSoundChange: (value: string) => void;
}

export function EditorSettings({
  isCritical,
  soundName,
  onCriticalChange,
  onSoundChange,
}: EditorSettingsProps) {
  return (
    <div className="px-5 pb-4">
      <span className="text-overline text-subtle-foreground mb-2 block">
        Settings
      </span>
      <Card padding="none">
        <div className="border-border-muted flex items-center justify-between border-b p-4">
          <div>
            <p className="text-body text-foreground font-medium">
              Critical Alert
            </p>
            <p className="text-caption text-muted-foreground">
              Override Do Not Disturb mode
            </p>
          </div>
          <Toggle checked={isCritical} onChange={onCriticalChange} />
        </div>
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-body text-foreground font-medium">
              Notification Sound
            </p>
            <p className="text-caption text-muted-foreground">
              Choose alert tone
            </p>
          </div>
          <Select
            value={soundName}
            onChange={onSoundChange}
            options={soundOptions}
          />
        </div>
      </Card>
    </div>
  );
}
