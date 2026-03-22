import { useMachine } from "@xstate/react";
import { useAtomValue, useSetAtom } from "jotai";
import { Button, Card, Select } from "@tomato-mien/ui";
import type { CSSProperties } from "react";
import { settingsAtom } from "@/store";
import { iapMachine } from "./iapMachine";

const celebrationBeans = [
  {
    color: "bg-amber-700",
    delay: "0ms",
    left: "10%",
    rotate: "-18deg",
    size: "h-3 w-2.5",
    x: "-24px",
  },
  {
    color: "bg-orange-500",
    delay: "60ms",
    left: "24%",
    rotate: "12deg",
    size: "h-2.5 w-2.5",
    x: "-8px",
  },
  {
    color: "bg-stone-700",
    delay: "120ms",
    left: "34%",
    rotate: "-10deg",
    size: "h-3.5 w-2.5",
    x: "10px",
  },
  {
    color: "bg-amber-500",
    delay: "180ms",
    left: "46%",
    rotate: "8deg",
    size: "h-2.5 w-2.5",
    x: "-14px",
  },
  {
    color: "bg-orange-600",
    delay: "40ms",
    left: "58%",
    rotate: "-6deg",
    size: "h-3 w-2.5",
    x: "16px",
  },
  {
    color: "bg-stone-600",
    delay: "140ms",
    left: "70%",
    rotate: "18deg",
    size: "h-3 w-2.5",
    x: "26px",
  },
  {
    color: "bg-amber-600",
    delay: "220ms",
    left: "82%",
    rotate: "-14deg",
    size: "h-2.5 w-2.5",
    x: "8px",
  },
];

function CoffeeCelebration({ active }: { active: boolean }) {
  if (!active) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {celebrationBeans.map(bean => (
        <span
          key={`${bean.left}-${bean.delay}`}
          className={`animate-coffee-pop absolute bottom-6 rounded-full opacity-0 ${bean.color} ${bean.size}`}
          style={
            {
              "--coffee-delay": bean.delay,
              "--coffee-rotate": bean.rotate,
              "--coffee-x": bean.x,
              left: bean.left,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

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
  const settings = useAtomValue(settingsAtom);
  const setSettings = useSetAtom(settingsAtom);
  const tipCount = settings.tipCount ?? 0;

  const [state, send] = useMachine(iapMachine, {
    input: {
      api: window.electronAPI,
      onPurchaseSuccess: quantity => {
        setSettings(current => ({
          ...current,
          tipCount: (current.tipCount ?? 0) + quantity,
        }));
      },
    },
  });

  if (state.matches("loading")) {
    return <Skeleton />;
  }

  if (state.matches("unavailable")) {
    return (
      <div className="py-6 text-center">
        <p className="text-body text-muted-foreground">
          Purchases are not available on this device.
        </p>
      </div>
    );
  }

  if (state.matches("initError")) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <p className="text-body text-muted-foreground">{state.context.initError}</p>
        <Button variant="secondary" onClick={() => send({ type: "retry" })}>
          Try again
        </Button>
      </div>
    );
  }

  const product = state.context.product;
  if (!product) {
    return null;
  }

  const isPurchasing = state.matches("purchasing");
  const isThanking = state.matches("thanking");
  const purchaseError = state.matches("ready") ? state.context.purchaseError : null;
  const quantityOptions = Array.from({ length: 10 }, (_, i) => {
    const value = String(i + 1);
    return { value, label: value };
  });

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p className="text-body text-foreground text-center">
        Thank you for using Tomato Mien.
        <br />
        A coffee helps support ongoing development.
      </p>

      <Card padding="md" className="relative w-full overflow-hidden">
        <CoffeeCelebration active={isThanking} />
        <div className="flex flex-col items-center gap-3">
          <p className="text-body text-foreground font-medium">
            {product.localizedTitle}
          </p>
          <p className="text-caption text-muted-foreground">
            {product.formattedPrice} / each
          </p>
          <p className="text-caption text-muted-foreground text-center">
            Coffee support is consumable and cannot be restored.
          </p>

          <div className="flex items-center gap-3">
            <label
              htmlFor="tip-quantity"
              className="text-caption text-foreground"
            >
              Quantity
            </label>
            <Select
              value={String(state.context.quantity)}
              onChange={value =>
                send({
                  type: "quantity.changed",
                  value: Number(value),
                })
              }
              options={quantityOptions}
              disabled={isPurchasing}
              className="min-w-16"
            />
          </div>

          <Button
            onClick={() => send({ type: "purchase" })}
            disabled={isPurchasing}
            className="w-full"
          >
            {isPurchasing ? "Processing..." : "Buy me a coffee"}
          </Button>
        </div>
      </Card>

      {isThanking && (
        <p className="text-body text-success-600 animate-thank-you-bounce text-center">
          Thank you. Your support means a lot.
        </p>
      )}

      {tipCount > 0 && !isThanking && (
        <p className="text-body text-muted-foreground text-center">
          You have sent {tipCount} coffees so far.
        </p>
      )}

      {purchaseError && (
        <p className="text-body text-danger-600 text-center">{purchaseError}</p>
      )}
    </div>
  );
}
