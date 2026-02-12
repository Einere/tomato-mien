import { useSetAtom } from "jotai";
import { viewAtom } from "@/store";
import { Icon } from "@/components/UI/Icon";

interface EditorHeaderProps {
  isNew: boolean;
}

export function EditorHeader({ isNew }: EditorHeaderProps) {
  const setView = useSetAtom(viewAtom);

  return (
    <div className="flex items-center gap-3 px-5 pt-6 pb-4">
      <button
        onClick={() => setView("dashboard")}
        aria-label="Back to dashboard"
        className="focus-visible:ring-ring text-muted-foreground hover:bg-muted flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <Icon name="arrow_back" size="sm" />
      </button>
      <h1 className="text-heading-2 text-foreground">
        {isNew ? "New Rule" : "Edit Rule"}
      </h1>
    </div>
  );
}
