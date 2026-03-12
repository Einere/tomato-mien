import { Card } from "@tomato-mien/ui";

const TOSS_QR_URL = "https://toss.me/tomatomien";

export function TossSupportContent() {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p className="text-body text-foreground text-center">
        Tomato Mien을 사용해 주셔서 감사합니다.
        <br />
        후원은 개발을 지속하는 데 큰 힘이 됩니다.
      </p>
      <Card padding="md">
        <a
          href={TOSS_QR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:text-primary-700 text-body block text-center underline"
        >
          Toss로 후원하기
        </a>
      </Card>
    </div>
  );
}
