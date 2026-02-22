import { Card, Toggle, Button } from "@tomato-mien/ui";
import { formatTimeValue, timeToDate } from "@/lib/dayjs";

interface EditorSettingsProps {
  notificationEnabled: boolean;
  onNotificationEnabledChange: (value: boolean) => void;
  scheduledEnableAt: Date | undefined;
  onScheduledEnableAtChange: (value: Date | undefined) => void;
  ruleEnabled: boolean;
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
        <div className="border-border border-t p-4">
          <div className="flex items-center justify-between">
            <div className={ruleEnabled ? "opacity-50" : ""}>
              <p className="text-body text-foreground font-medium">
                Scheduled Activation
              </p>
              <p className="text-caption text-muted-foreground">
                Auto-enable this rule at a future time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                aria-label="Scheduled activation time"
                disabled={ruleEnabled}
                className="text-body text-foreground bg-surface border-border rounded-lg border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={
                  scheduledEnableAt
                    ? formatTimeValue(
                        scheduledEnableAt.getHours(),
                        scheduledEnableAt.getMinutes(),
                      )
                    : ""
                }
                onChange={e => {
                  const value = e.target.value;
                  onScheduledEnableAtChange(
                    value ? timeToDate(value) : undefined,
                  );
                }}
              />
              {scheduledEnableAt && !ruleEnabled && (
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
        </div>
      </Card>
    </div>
  );
}
