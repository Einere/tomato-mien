import { Card, Toggle } from "@tomato-mien/ui";

interface EditorSettingsProps {
  notificationEnabled: boolean;
  onNotificationEnabledChange: (value: boolean) => void;
}

export function EditorSettings({
  notificationEnabled,
  onNotificationEnabledChange,
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
              Notification
            </p>
            <p className="text-caption text-muted-foreground">
              Show in notification center
            </p>
          </div>
          <Toggle
            checked={notificationEnabled}
            onChange={onNotificationEnabledChange}
          />
        </div>
      </Card>
    </div>
  );
}
