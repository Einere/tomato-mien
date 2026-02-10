import { Card } from '@/components/UI/Card';
import { Icon } from '@/components/UI/Icon';

export function SmartSuggestions() {
  return (
    <div className="px-5 pb-6 pt-4">
      <Card
        padding="none"
        className="overflow-hidden bg-gradient-to-r from-tomato-600 to-tomato-500"
      >
        <div className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
            <Icon name="auto_awesome" size="sm" className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">
              Smart Suggestions
            </p>
            <p className="text-xs text-white/80">
              Add interval rules to stay focused during work hours.
            </p>
          </div>
          <Icon name="chevron_right" size="sm" className="text-white/60" />
        </div>
      </Card>
    </div>
  );
}
