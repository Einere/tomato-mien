import { useMachine } from "@xstate/react";
import { useAtomValue, useSetAtom } from "jotai";
import { Button, Card } from "@tomato-mien/ui";
import { settingsAtom } from "@/store";
import { iapMachine } from "./iapMachine";

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

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p className="text-body text-foreground text-center">
        Thank you for using Tomato Mien.
        <br />
        A one-time tip helps keep development going.
      </p>

      <Card padding="md" className="w-full">
        <div className="flex flex-col items-center gap-3">
          <p className="text-body text-foreground font-medium">
            {product.localizedTitle}
          </p>
          <p className="text-caption text-muted-foreground">
            {product.formattedPrice} / each
          </p>
          <p className="text-caption text-muted-foreground text-center">
            Tips are consumable and cannot be restored.
          </p>

          <div className="flex items-center gap-3">
            <label
              htmlFor="tip-quantity"
              className="text-caption text-foreground"
            >
              Quantity
            </label>
            <select
              id="tip-quantity"
              value={state.context.quantity}
              onChange={e =>
                send({
                  type: "quantity.changed",
                  value: Number(e.target.value),
                })
              }
              className="border-border-muted text-body rounded-md border bg-transparent px-2 py-1"
              disabled={isPurchasing}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={() => send({ type: "purchase" })}
            disabled={isPurchasing}
            className="w-full"
          >
            {isPurchasing ? "Processing..." : "Send a tip"}
          </Button>
        </div>
      </Card>

      {isThanking && (
        <p className="text-body text-success-600 text-center">
          Thank you. Your tip was completed.
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
