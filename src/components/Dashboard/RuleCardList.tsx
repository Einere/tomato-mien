import { useAtomValue } from "jotai";
import { filteredRulesAtom } from "@/store";
import { RuleCard } from "./RuleCard";

export function RuleCardList() {
  const rules = useAtomValue(filteredRulesAtom);

  if (rules.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <p className="text-body text-subtle-foreground">No rules yet.</p>
        <p className="text-caption text-subtle-foreground">
          Tap &quot;+ Create&quot; to add your first rule.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 px-5">
      {rules.map(rule => (
        <RuleCard key={rule.id} rule={rule} />
      ))}
    </div>
  );
}
