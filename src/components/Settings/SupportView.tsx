import { Card, Icon, Button } from "@tomato-mien/ui";
import tossQrImage from "@/assets/toss_qr.png";

export function SupportView({ onBack }: { onBack: () => void }) {
  return (
    <div className="px-5 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" className="h-9 w-9 p-0" onClick={onBack}>
          <Icon name="arrow_back" size="sm" />
        </Button>
        <h1 className="text-heading-3 text-foreground">Support This Project</h1>
      </div>

      <Card padding="none">
        <div className="flex flex-col items-center gap-3 p-6">
          <p className="text-caption text-muted-foreground text-center">
            Scan the QR code with Toss to buy me a coffee
          </p>
          <img
            src={tossQrImage}
            alt="Toss QR code for donation"
            className="h-48 w-48 rounded-lg"
          />
        </div>
      </Card>
    </div>
  );
}
