import { Button, ArrowBackIcon } from "@tomato-mien/ui";
import { IAPSupportContent } from "./IAPSupportContent";
import { TossSupportContent } from "./TossSupportContent";

export function SupportView({ onBack }: { onBack: () => void }) {
  const isMAS = window.electronAPI?.isMAS === true;

  return (
    <div className="px-5 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Button
          variant="ghost"
          className="h-9 w-9 p-0"
          onClick={onBack}
          aria-label="Back"
        >
          <ArrowBackIcon />
        </Button>
        <h1 className="text-heading-3 text-foreground">Support</h1>
      </div>

      {isMAS ? <IAPSupportContent /> : <TossSupportContent />}
    </div>
  );
}
