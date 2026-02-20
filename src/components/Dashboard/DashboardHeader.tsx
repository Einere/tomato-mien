import { useSetAtom } from "jotai";
import { addRuleAtom } from "@/store";
import { Button, AddIcon } from "@tomato-mien/ui";
import { useViewTransition } from "@tomato-mien/view-transition";

export function DashboardHeader() {
  const addRule = useSetAtom(addRuleAtom);
  const { triggerTransition } = useViewTransition();

  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-2">
      <h1 className="text-heading-1 text-foreground">Rules</h1>
      <Button
        onClick={() => triggerTransition(() => addRule(), "drill-forward")}
        className="gap-1"
      >
        <AddIcon size="sm" className="text-white" />
        Create
      </Button>
    </div>
  );
}
