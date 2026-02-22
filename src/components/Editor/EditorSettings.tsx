import { Card, Toggle, Button } from "@tomato-mien/ui";

interface EditorSettingsProps {
  notificationEnabled: boolean;
  onNotificationEnabledChange: (value: boolean) => void;
  scheduledEnableAt: Date | undefined;
  onScheduledEnableAtChange: (value: Date | undefined) => void;
  ruleEnabled: boolean;
}

function toDatetimeLocalString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getMinDatetimeLocal(): string {
  return toDatetimeLocalString(new Date());
}

export function EditorSettings({
  notificationEnabled,
  onNotificationEnabledChange,
  scheduledEnableAt,
  onScheduledEnableAtChange,
  ruleEnabled,
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
        {!ruleEnabled && (
          <div className="border-border border-t p-4">
            <div className="mb-2">
              <p className="text-body text-foreground font-medium">
                Scheduled Activation
              </p>
              <p className="text-caption text-muted-foreground">
                Auto-enable this rule at a future time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                className="text-body text-foreground bg-surface border-border flex-1 rounded-lg border px-3 py-2"
                value={
                  scheduledEnableAt
                    ? toDatetimeLocalString(scheduledEnableAt)
                    : ""
                }
                min={getMinDatetimeLocal()}
                onChange={e => {
                  const value = e.target.value;
                  onScheduledEnableAtChange(
                    value ? new Date(value) : undefined,
                  );
                }}
              />
              {scheduledEnableAt && (
                <Button
                  variant="ghost"
                  color="danger"
                  onClick={() => onScheduledEnableAtChange(undefined)}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
