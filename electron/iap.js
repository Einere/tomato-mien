import { inAppPurchase, ipcMain } from "electron";

const TIP_PRODUCT_ID = "com.tomatomien.tip";
const PURCHASE_TIMEOUT_MS = 30_000;

export function setupIAP() {
  ipcMain.handle("iap-can-make-payments", () => {
    return inAppPurchase.canMakePayments();
  });

  ipcMain.handle("iap-get-products", async (_event, productIds) => {
    return inAppPurchase.getProducts(productIds);
  });

  ipcMain.handle("iap-purchase", async (_event, productId, quantity) => {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return { success: false, error: "Invalid quantity (must be 1-10)" };
    }

    return new Promise((resolve) => {
      let settled = false;

      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        inAppPurchase.removeListener(
          "transactions-updated",
          transactionHandler,
        );
        resolve({ success: false, error: "Purchase timed out" });
      }, PURCHASE_TIMEOUT_MS);

      const transactionHandler = (_event, transactions) => {
        const target = transactions.find(
          (t) => t.payment.productIdentifier === productId,
        );
        if (!target) return;

        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        inAppPurchase.removeListener(
          "transactions-updated",
          transactionHandler,
        );

        switch (target.transactionState) {
          case "purchased":
            inAppPurchase.finishTransactionByDate(target.transactionDate);
            resolve({ success: true });
            break;
          case "failed":
            console.error("IAP purchase failed:", target.errorMessage);
            resolve({
              success: false,
              error: target.errorMessage || "Purchase failed",
            });
            break;
          default:
            resolve({
              success: false,
              error: `Unexpected state: ${target.transactionState}`,
            });
        }
      };

      inAppPurchase.on("transactions-updated", transactionHandler);
      inAppPurchase.purchaseProduct(productId, quantity);
    });
  });
}
