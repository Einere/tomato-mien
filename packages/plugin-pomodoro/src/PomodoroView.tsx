import { Card, TimerIcon } from "@tomato-mien/ui";

export function PomodoroView() {
  return (
    <div className="px-5 py-6">
      <h1 className="text-heading-1 text-foreground mb-6">Pomodoro</h1>
      <Card>
        <div className="flex flex-col items-center gap-4 py-8">
          <TimerIcon size="lg" className="text-primary-600" />
          <p className="text-body text-muted-foreground">
            Pomodoro timer coming soon.
          </p>
        </div>
      </Card>
    </div>
  );
}
