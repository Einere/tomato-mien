import { Card } from "@tomato-mien/ui";
import tossQrImage from "@assets/toss_qr.png";

export function TossSupportContent() {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p className="text-body text-foreground text-center">
        Thank you for using Tomato Mien.
        <br />
        Your support helps keep development going.
      </p>
      <Card padding="md">
        <div className="flex flex-col items-center gap-3">
          <p className="text-caption text-muted-foreground">Toss QR</p>
          <img
            src={tossQrImage}
            alt="Toss support QR code"
            className="h-60 w-60 rounded-lg"
          />
        </div>
      </Card>
    </div>
  );
}
