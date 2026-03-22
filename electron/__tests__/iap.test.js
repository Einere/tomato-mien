import { beforeEach, describe, expect, it, vi } from "vitest";

const cryptoMock = vi.hoisted(() => ({
  randomUUID: vi.fn(),
}));

const electronMock = vi.hoisted(() => {
  const handlers = new Map();
  const listeners = new Map();

  return {
    handlers,
    ipcMain: {
      handle: vi.fn((channel, handler) => {
        handlers.set(channel, handler);
      }),
    },
    inAppPurchase: {
      canMakePayments: vi.fn(),
      finishTransactionByDate: vi.fn(),
      getProducts: vi.fn(),
      on: vi.fn((event, listener) => {
        listeners.set(event, listener);
      }),
      purchaseProduct: vi.fn(),
    },
    listeners,
    reset() {
      handlers.clear();
      listeners.clear();
      this.ipcMain.handle.mockClear();
      this.inAppPurchase.canMakePayments.mockReset();
      this.inAppPurchase.finishTransactionByDate.mockReset();
      this.inAppPurchase.getProducts.mockReset();
      this.inAppPurchase.on.mockClear();
      this.inAppPurchase.purchaseProduct.mockReset();
    },
  };
});

vi.mock("node:crypto", () => ({
  default: {
    randomUUID: cryptoMock.randomUUID,
  },
  randomUUID: cryptoMock.randomUUID,
}));

vi.mock("electron", () => ({
  inAppPurchase: electronMock.inAppPurchase,
  ipcMain: electronMock.ipcMain,
}));

describe("setupIAP", () => {
  beforeEach(async () => {
    vi.resetModules();
    electronMock.reset();
    cryptoMock.randomUUID.mockReset();
    cryptoMock.randomUUID.mockReturnValue("purchase-token-1");

    const { setupIAP } = await import("../iap.js");
    setupIAP();
  });

  it("registers the transaction listener during setup", () => {
    expect(electronMock.inAppPurchase.on).toHaveBeenCalledWith(
      "transactions-updated",
      expect.any(Function),
    );
    expect(electronMock.handlers.has("iap-purchase")).toBe(true);
  });

  it("settles cancelled purchases and cleans up the failed transaction", async () => {
    electronMock.inAppPurchase.purchaseProduct.mockResolvedValue(true);
    const purchase = electronMock.handlers.get("iap-purchase");
    const onTransactionsUpdated =
      electronMock.listeners.get("transactions-updated");

    const resultPromise = purchase(null, "com.tomatomien.tip", 1);

    onTransactionsUpdated(null, [
      {
        errorCode: 2,
        payment: {
          applicationUsername: "purchase-token-1",
          productIdentifier: "com.tomatomien.tip",
        },
        transactionDate: "2026-03-22T00:00:00.000Z",
        transactionState: "failed",
      },
    ]);

    await expect(resultPromise).resolves.toEqual({
      cancelled: true,
      success: false,
    });
    expect(electronMock.inAppPurchase.finishTransactionByDate).toHaveBeenCalledWith(
      "2026-03-22T00:00:00.000Z",
    );
  });

  it("settles successful purchases and finishes the transaction", async () => {
    electronMock.inAppPurchase.purchaseProduct.mockResolvedValue(true);
    const purchase = electronMock.handlers.get("iap-purchase");
    const onTransactionsUpdated =
      electronMock.listeners.get("transactions-updated");

    const resultPromise = purchase(null, "com.tomatomien.tip", 2);

    onTransactionsUpdated(null, [
      {
        payment: {
          applicationUsername: "purchase-token-1",
          productIdentifier: "com.tomatomien.tip",
        },
        transactionDate: "2026-03-22T00:00:00.000Z",
        transactionState: "purchased",
      },
    ]);

    await expect(resultPromise).resolves.toEqual({ success: true });
    expect(electronMock.inAppPurchase.finishTransactionByDate).toHaveBeenCalledWith(
      "2026-03-22T00:00:00.000Z",
    );
  });

  it("returns an immediate error when the purchase dialog cannot start", async () => {
    electronMock.inAppPurchase.purchaseProduct.mockResolvedValue(false);
    const purchase = electronMock.handlers.get("iap-purchase");

    await expect(purchase(null, "com.tomatomien.tip", 1)).resolves.toEqual({
      error: "Purchase could not be started",
      success: false,
    });

    expect(electronMock.inAppPurchase.purchaseProduct).toHaveBeenCalledWith(
      "com.tomatomien.tip",
      {
        quantity: 1,
        username: "purchase-token-1",
      },
    );
  });

  it("ignores old transactions from the same product but still cleans them up", async () => {
    electronMock.inAppPurchase.purchaseProduct.mockResolvedValue(true);
    const purchase = electronMock.handlers.get("iap-purchase");
    const onTransactionsUpdated =
      electronMock.listeners.get("transactions-updated");

    const resultPromise = purchase(null, "com.tomatomien.tip", 1);

    onTransactionsUpdated(null, [
      {
        payment: {
          applicationUsername: "stale-token",
          productIdentifier: "com.tomatomien.tip",
        },
        transactionDate: "2026-03-21T00:00:00.000Z",
        transactionState: "purchased",
      },
    ]);

    let settled = false;
    void resultPromise.then(() => {
      settled = true;
    });
    await Promise.resolve();

    expect(settled).toBe(false);
    expect(electronMock.inAppPurchase.finishTransactionByDate).toHaveBeenCalledWith(
      "2026-03-21T00:00:00.000Z",
    );

    onTransactionsUpdated(null, [
      {
        payment: {
          applicationUsername: "purchase-token-1",
          productIdentifier: "com.tomatomien.tip",
        },
        transactionDate: "2026-03-22T00:00:00.000Z",
        transactionState: "purchased",
      },
    ]);

    await expect(resultPromise).resolves.toEqual({ success: true });
  });

  it("returns an error for deferred transactions", async () => {
    electronMock.inAppPurchase.purchaseProduct.mockResolvedValue(true);
    const purchase = electronMock.handlers.get("iap-purchase");
    const onTransactionsUpdated =
      electronMock.listeners.get("transactions-updated");

    const resultPromise = purchase(null, "com.tomatomien.tip", 1);

    onTransactionsUpdated(null, [
      {
        payment: {
          applicationUsername: "purchase-token-1",
          productIdentifier: "com.tomatomien.tip",
        },
        transactionState: "deferred",
      },
    ]);

    await expect(resultPromise).resolves.toEqual({
      error: "보호자 승인이 필요합니다. 승인 후 다시 시도해 주세요.",
      success: false,
    });
  });

  it("does not treat restored transactions as a successful consumable purchase", async () => {
    electronMock.inAppPurchase.purchaseProduct.mockResolvedValue(true);
    const purchase = electronMock.handlers.get("iap-purchase");
    const onTransactionsUpdated =
      electronMock.listeners.get("transactions-updated");

    const resultPromise = purchase(null, "com.tomatomien.tip", 1);

    onTransactionsUpdated(null, [
      {
        payment: {
          applicationUsername: "purchase-token-1",
          productIdentifier: "com.tomatomien.tip",
        },
        transactionDate: "2026-03-22T00:00:00.000Z",
        transactionState: "restored",
      },
    ]);

    await expect(resultPromise).resolves.toEqual({
      error: "이 후원 상품은 구매 복원을 지원하지 않습니다.",
      success: false,
    });
    expect(electronMock.inAppPurchase.finishTransactionByDate).toHaveBeenCalledWith(
      "2026-03-22T00:00:00.000Z",
    );
  });

  it("rejects a second purchase while one is already pending", async () => {
    electronMock.inAppPurchase.purchaseProduct.mockResolvedValue(true);
    cryptoMock.randomUUID
      .mockReturnValueOnce("purchase-token-1")
      .mockReturnValueOnce("purchase-token-2");

    const purchase = electronMock.handlers.get("iap-purchase");

    const firstPurchase = purchase(null, "com.tomatomien.tip", 1);
    await expect(purchase(null, "com.tomatomien.tip", 1)).resolves.toEqual({
      error: "Purchase already in progress",
      success: false,
    });

    const onTransactionsUpdated =
      electronMock.listeners.get("transactions-updated");
    onTransactionsUpdated(null, [
      {
        payment: {
          applicationUsername: "purchase-token-1",
          productIdentifier: "com.tomatomien.tip",
        },
        transactionDate: "2026-03-22T00:00:00.000Z",
        transactionState: "failed",
        errorCode: 2,
      },
    ]);

    await expect(firstPurchase).resolves.toEqual({
      cancelled: true,
      success: false,
    });
  });
});
