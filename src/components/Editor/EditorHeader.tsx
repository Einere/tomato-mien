import { useSetAtom } from "jotai";
import { viewAtom } from "@/store";
import { Button } from "@/components/UI/Button";
import { Icon } from "@/components/UI/Icon";

interface EditorHeaderProps {
  isNew: boolean;
}

export function EditorHeader({ isNew }: EditorHeaderProps) {
  const setView = useSetAtom(viewAtom);

  return (
    <div className="flex items-center gap-3 px-5 pt-6 pb-4">
      <Button
        variant="ghost"
        onClick={() => setView("dashboard")}
        aria-label="Back to dashboard"
        className="h-9 w-9 p-0"
      >
        <Icon name="arrow_back" size="sm" />
      </Button>
      <h1 className="text-heading-2 text-foreground">
        {isNew ? "New Rule" : "Edit Rule"}
      </h1>
    </div>
  );
}
