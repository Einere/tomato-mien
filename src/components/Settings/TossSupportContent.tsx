import { Card } from "@tomato-mien/ui";
import tossQrImage from "@assets/toss_qr.png";

export function TossSupportContent() {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p className="text-body text-foreground text-center">
        Tomato Mien을 사용해 주셔서 감사합니다.
        <br />
        후원은 개발을 지속하는 데 큰 힘이 됩니다.
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
