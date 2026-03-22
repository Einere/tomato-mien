import { assign, fromPromise, setup } from "xstate";
import { TIP_PRODUCT_ID } from "@/constants/iap";
import type {
  ElectronAPI,
  IAPProduct,
  IAPPurchaseResult,
} from "@/types/electron";

type LoadProductsResult =
  | { kind: "unavailable" }
  | { kind: "ready"; product: IAPProduct };

type PurchaseResult =
  | { kind: "success"; quantity: number }
  | { kind: "cancelled" }
  | { kind: "failed"; message: string };

interface IAPMachineContext {
  api?: ElectronAPI;
  initError: string | null;
  onPurchaseSuccess: (quantity: number) => void;
  product: IAPProduct | null;
  purchaseError: string | null;
  quantity: number;
}

type IAPMachineEvent =
  | { type: "quantity.changed"; value: number }
  | { type: "purchase" }
  | { type: "retry" };

interface IAPMachineInput {
  api?: ElectronAPI;
  onPurchaseSuccess: (quantity: number) => void;
}

function getDoneOutput<T>(event: unknown): T {
  return (event as { output: T }).output;
}

function getErrorMessage(event: unknown, fallback: string): string {
  const error = (event as { error?: unknown }).error;
  return error instanceof Error ? error.message : fallback;
}

async function loadProducts(api?: ElectronAPI): Promise<LoadProductsResult> {
  if (!api) {
    throw new Error("Unable to load product information.");
  }

  const canMakePayments = await api.iapCanMakePayments();
  if (!canMakePayments) {
    return { kind: "unavailable" };
  }

  const products = await api.iapGetProducts([TIP_PRODUCT_ID]);
  if (products.length === 0) {
    throw new Error("Unable to load product information.");
  }

  return { kind: "ready", product: products[0] };
}

async function purchaseTip(
  api: ElectronAPI | undefined,
  quantity: number,
): Promise<PurchaseResult> {
  if (!api) {
    return { kind: "failed", message: "An error occurred during purchase. Please try again." };
  }

  const result: IAPPurchaseResult = await api.iapPurchase(TIP_PRODUCT_ID, quantity);
  if (result.success) {
    return { kind: "success", quantity };
  }

  if (result.cancelled) {
    return { kind: "cancelled" };
  }

  return {
    kind: "failed",
    message: result.error ?? "Purchase failed. Please try again.",
  };
}

export const iapMachine = setup({
  types: {
    context: {} as IAPMachineContext,
    events: {} as IAPMachineEvent,
    input: {} as IAPMachineInput,
  },
  actors: {
    loadProducts: fromPromise(
      async ({ input }: { input: { api?: ElectronAPI } }) => loadProducts(input.api),
    ),
    purchaseTip: fromPromise(
      async ({ input }: { input: { api?: ElectronAPI; quantity: number } }) =>
        purchaseTip(input.api, input.quantity),
    ),
  },
  actions: {
    assignInitError: assign({
      initError: ({ event }) =>
        getErrorMessage(event, "Unable to load product information."),
    }),
    assignProduct: assign({
      initError: null,
      product: ({ event }) => {
        const output = getDoneOutput<LoadProductsResult>(event);
        return output.kind === "ready" ? output.product : null;
      },
      purchaseError: null,
    }),
    assignPurchaseError: assign({
      purchaseError: ({ event }) => {
        const output = getDoneOutput<PurchaseResult>(event);
        return output.kind === "failed"
          ? output.message
          : "Purchase failed. Please try again.";
      },
    }),
    assignQuantity: assign({
      quantity: ({ event }) =>
        (event as Extract<IAPMachineEvent, { type: "quantity.changed" }>).value,
    }),
    clearPurchaseError: assign({
      purchaseError: null,
    }),
    handlePurchaseSuccess: ({ context }) => {
      context.onPurchaseSuccess(context.quantity);
    },
  },
  guards: {
    isUnavailable: ({ event }) => {
      const output = getDoneOutput<LoadProductsResult>(event);
      return output.kind === "unavailable";
    },
    purchaseCancelled: ({ event }) => {
      const output = getDoneOutput<PurchaseResult>(event);
      return output.kind === "cancelled";
    },
    purchaseSucceeded: ({ event }) => {
      const output = getDoneOutput<PurchaseResult>(event);
      return output.kind === "success";
    },
  },
}).createMachine({
  id: "iap",
  initial: "loading",
  context: ({ input }) => ({
    api: input.api,
    initError: null,
    onPurchaseSuccess: input.onPurchaseSuccess,
    product: null,
    purchaseError: null,
    quantity: 1,
  }),
  states: {
    loading: {
      invoke: {
        src: "loadProducts",
        input: ({ context }) => ({ api: context.api }),
        onDone: [
          {
            guard: "isUnavailable",
            target: "unavailable",
          },
          {
            target: "ready",
            actions: "assignProduct",
          },
        ],
        onError: {
          target: "initError",
          actions: "assignInitError",
        },
      },
    },
    unavailable: {},
    initError: {
      on: {
        retry: {
          target: "loading",
        },
      },
    },
    ready: {
      on: {
        "quantity.changed": {
          actions: "assignQuantity",
        },
        purchase: {
          target: "purchasing",
          actions: "clearPurchaseError",
        },
      },
    },
    purchasing: {
      invoke: {
        src: "purchaseTip",
        input: ({ context }) => ({
          api: context.api,
          quantity: context.quantity,
        }),
        onDone: [
          {
            guard: "purchaseSucceeded",
            target: "thanking",
            actions: ["handlePurchaseSuccess", "clearPurchaseError"],
          },
          {
            guard: "purchaseCancelled",
            target: "ready",
            actions: "clearPurchaseError",
          },
          {
            target: "ready",
            actions: "assignPurchaseError",
          },
        ],
        onError: {
          target: "ready",
          actions: assign({
            purchaseError: "An error occurred during purchase. Please try again.",
          }),
        },
      },
    },
    thanking: {
      after: {
        3000: {
          target: "ready",
          actions: "clearPurchaseError",
        },
      },
    },
  },
});
