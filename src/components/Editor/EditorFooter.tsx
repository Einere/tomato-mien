import { Button } from "@/components/UI/Button";

interface EditorFooterProps {
  onCancel: () => void;
  onSave: () => void;
  hasChanges: boolean;
}

export function EditorFooter({
  onCancel,
  onSave,
  hasChanges,
}: EditorFooterProps) {
  return (
    <div className="flex gap-3 px-5 pt-2 pb-6">
      <Button variant="secondary" onClick={onCancel} className="flex-1">
        Cancel
      </Button>
      <Button onClick={onSave} disabled={!hasChanges} className="flex-1">
        Save Changes
      </Button>
    </div>
  );
}
