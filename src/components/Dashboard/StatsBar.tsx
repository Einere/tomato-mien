import { useAtomValue } from "jotai";
import { activeRuleCountAtom, totalRuleCountAtom } from "@/store";
import { Card } from "@/components/UI/Card";

export function StatsBar() {
  const activeCount = useAtomValue(activeRuleCountAtom);
  const totalCount = useAtomValue(totalRuleCountAtom);

  return (
    <div className="mx-5 mb-4 grid grid-cols-2 gap-3">
      <Card className="flex flex-col items-center py-3">
        <span className="text-overline text-subtle-foreground">
          Active Rules
        </span>
        <span className="text-heading-1 text-primary-600">{activeCount}</span>
      </Card>
      <Card className="flex flex-col items-center py-3">
        <span className="text-overline text-subtle-foreground">
          Total Rules
        </span>
        <span className="text-heading-1 text-foreground">{totalCount}</span>
      </Card>
    </div>
  );
}
