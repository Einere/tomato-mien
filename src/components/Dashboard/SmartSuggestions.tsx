import { Card } from "@/components/UI/Card";
import { Icon } from "@/components/UI/Icon";

export function SmartSuggestions() {
  return (
    <div className="px-5 pt-4 pb-6">
      <Card
        padding="none"
        className="from-primary-600 to-primary-500 cursor-pointer overflow-hidden bg-gradient-to-r transition-shadow hover:shadow-md"
      >
        <div className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
            <Icon name="auto_awesome" size="sm" className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-body font-semibold text-white">
              Smart Suggestions
            </p>
            <p className="text-caption text-white/80">
              Add interval rules to stay focused during work hours.
            </p>
          </div>
          <Icon name="chevron_right" size="sm" className="text-white/60" />
        </div>
      </Card>
    </div>
  );
}
