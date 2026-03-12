import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { settingsAtom } from "@/store";
import { Button, Card } from "@tomato-mien/ui";
import type { IAPProduct } from "@/types/electron";
import { TIP_PRODUCT_ID } from "@/constants/iap";

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4 py-6">
      <div className="mx-auto h-6 w-48 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mx-auto h-10 w-64 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mx-auto h-10 w-32 rounded bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

export function IAPSupportContent() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [product, setProduct] = useState<IAPProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canPay, setCanPay] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const thanksTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tipCount = settings.tipCount ?? 0;

  useEffect(() => {
    return () => {
      if (thanksTimerRef.current) clearTimeout(thanksTimerRef.current);
    };
  }, []);

  useEffect(() => {
    async function init() {
      const api = window.electronAPI;
      if (!api) return;

      try {
        const canMake = await api.iapCanMakePayments();
        setCanPay(canMake);

        if (canMake) {
          const products = await api.iapGetProducts([TIP_PRODUCT_ID]);
          if (products.length > 0) {
            setProduct(products[0]);
          } else {
            setError("상품 정보를 불러올 수 없습니다.");
          }
        }
      } catch (e) {
        console.error("IAP init error:", e);
        setError("상품 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  const handlePurchase = async () => {
    const api = window.electronAPI;
    if (!api || !product) return;

    setPurchasing(true);
    try {
      const result = await api.iapPurchase(TIP_PRODUCT_ID, quantity);
      if (result.success) {
        setSettings({
          ...settings,
          tipCount: tipCount + quantity,
        });
        setShowThanks(true);
        thanksTimerRef.current = setTimeout(() => setShowThanks(false), 3000);
      }
    } catch (e) {
      console.error("IAP purchase error:", e);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    const api = window.electronAPI;
    if (!api) return;

    api
      .iapGetProducts([TIP_PRODUCT_ID])
      .then(products => {
        if (products.length > 0) {
          setProduct(products[0]);
        } else {
          setError("상품 정보를 불러올 수 없습니다.");
        }
      })
      .catch(() => setError("상품 정보를 불러올 수 없습니다."))
      .finally(() => setLoading(false));
  };

  if (loading) return <Skeleton />;

  if (!canPay) {
    return (
      <div className="py-6 text-center">
        <p className="text-body text-muted-foreground">
          이 기기에서는 결제를 사용할 수 없습니다.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <p className="text-body text-muted-foreground">{error}</p>
        <Button variant="secondary" onClick={handleRetry}>
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p className="text-body text-foreground text-center">
        Tomato Mien을 사용해 주셔서 감사합니다.
        <br />
        후원은 개발을 지속하는 데 큰 힘이 됩니다.
      </p>

      {product && (
        <Card padding="md" className="w-full">
          <div className="flex flex-col items-center gap-3">
            <p className="text-body text-foreground font-medium">
              {product.localizedTitle}
            </p>
            <p className="text-caption text-muted-foreground">
              {product.formattedPrice} / 1개
            </p>

            <div className="flex items-center gap-3">
              <label
                htmlFor="tip-quantity"
                className="text-caption text-foreground"
              >
                수량
              </label>
              <select
                id="tip-quantity"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="border-border-muted text-body rounded-md border bg-transparent px-2 py-1"
                disabled={purchasing}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full"
            >
              {purchasing ? "처리 중..." : "후원하기"}
            </Button>
          </div>
        </Card>
      )}

      {showThanks && (
        <Card padding="md" className="border-success-200 bg-success-50 w-full">
          <p className="text-body text-success-700 text-center">
            감사합니다! 후원이 완료되었습니다.
          </p>
        </Card>
      )}

      {tipCount > 0 && (
        <p className="text-caption text-muted-foreground">
          지금까지 {tipCount}잔의 커피를 보내주셨어요
        </p>
      )}
    </div>
  );
}
