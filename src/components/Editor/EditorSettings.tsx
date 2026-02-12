import { Card } from "@/components/UI/Card";
import { Toggle } from "@/components/UI/Toggle";

interface EditorSettingsProps {
  isCritical: boolean;
  onCriticalChange: (value: boolean) => void;
}

export function EditorSettings({
  isCritical,
  onCriticalChange,
}: EditorSettingsProps) {
  return (
    <div className="px-5 pb-4">
      <span className="text-overline text-subtle-foreground mb-2 block">
        Settings
      </span>
      <Card padding="none">
        <div className="flex items-center justify-between p-4">
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
      </Card>
    </div>
  );
}
