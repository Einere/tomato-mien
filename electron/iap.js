import { inAppPurchase, ipcMain } from "electron";
import { randomUUID } from "node:crypto";
import { TIP_PRODUCT_ID } from "./iap.config.js";

const ALLOWED_PRODUCT_IDS = new Set([TIP_PRODUCT_ID]);
const PURCHASE_TIMEOUT_MS = 30_000;

const pendingPurchases = new Map();
let isIAPSetup = false;

function finishTransaction(transaction) {
  if (!transaction?.transactionDate) return;

  try {
    inAppPurchase.finishTransactionByDate(transaction.transactionDate);
  } catch (error) {
    console.error("IAP transaction cleanup failed:", error);
  }
}

function settlePendingPurchase(purchaseToken, result) {
  const pendingPurchase = pendingPurchases.get(purchaseToken);
  if (!pendingPurchase || pendingPurchase.settled) {
    return false;
  }

  pendingPurchase.settled = true;
  clearTimeout(pendingPurchase.timeout);
  pendingPurchases.delete(purchaseToken);
  pendingPurchase.resolve(result);
  return true;
}

function findPendingPurchaseByToken(purchaseToken) {
  if (!purchaseToken) return null;
  return pendingPurchases.get(purchaseToken) ?? null;
}

function registerTransactionListener() {
  inAppPurchase.on("transactions-updated", (_event, transactions) => {
    for (const transaction of transactions) {
      const productId = transaction.payment?.productIdentifier;
      if (!ALLOWED_PRODUCT_IDS.has(productId)) continue;

      const purchaseToken = transaction.payment?.applicationUsername;
      const pendingPurchase = findPendingPurchaseByToken(purchaseToken);

      if (transaction.transactionState === "purchasing") {
        continue;
      }

      switch (transaction.transactionState) {
        case "purchased":
          finishTransaction(transaction);
          if (pendingPurchase) {
            settlePendingPurchase(purchaseToken, { success: true });
          }
          break;
        case "restored":
          // Tip jar는 consumable이므로 복원 대상이 아니다.
          // 남아 있는 restored transaction은 정리만 하고 현재 구매 성공으로 간주하지 않는다.
          finishTransaction(transaction);
          if (pendingPurchase) {
            settlePendingPurchase(purchaseToken, {
              success: false,
              error: "이 후원 상품은 구매 복원을 지원하지 않습니다.",
            });
          }
          break;
        case "failed":
          finishTransaction(transaction);
          if (!pendingPurchase) {
            break;
          }

          if (transaction.errorCode === 2) {
            settlePendingPurchase(purchaseToken, {
              success: false,
              cancelled: true,
            });
          } else {
            console.error("IAP purchase failed:", transaction.errorMessage);
            settlePendingPurchase(purchaseToken, {
              success: false,
              error: transaction.errorMessage || "Purchase failed",
            });
          }
          break;
        case "deferred":
          if (pendingPurchase) {
            settlePendingPurchase(purchaseToken, {
              success: false,
              error: "보호자 승인이 필요합니다. 승인 후 다시 시도해 주세요.",
            });
          }
          break;
        default:
          if (pendingPurchase) {
            settlePendingPurchase(purchaseToken, {
              success: false,
              error: `Unexpected state: ${transaction.transactionState}`,
            });
          }
      }
    }
  });
}

export function setupIAP() {
  if (isIAPSetup) {
    return;
  }

  isIAPSetup = true;
  registerTransactionListener();

  ipcMain.handle("iap-can-make-payments", () => {
    return inAppPurchase.canMakePayments();
  });

  ipcMain.handle("iap-get-products", async (_event, productIds) => {
    const safeIds = productIds.filter(id => ALLOWED_PRODUCT_IDS.has(id));
    return inAppPurchase.getProducts(safeIds);
  });

  ipcMain.handle("iap-purchase", async (_event, productId, quantity) => {
    if (!ALLOWED_PRODUCT_IDS.has(productId)) {
      return { success: false, error: "Unknown product" };
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return { success: false, error: "Invalid quantity (must be 1-10)" };
    }

    if (pendingPurchases.size > 0) {
      return { success: false, error: "Purchase already in progress" };
    }

    const purchaseToken = randomUUID();

    return new Promise(resolve => {
      const timeout = setTimeout(() => {
        settlePendingPurchase(purchaseToken, {
          success: false,
          error: "Purchase timed out",
        });
      }, PURCHASE_TIMEOUT_MS);

      pendingPurchases.set(purchaseToken, {
        productId,
        resolve,
        settled: false,
        timeout,
      });

      void (async () => {
        try {
          const didStart = await inAppPurchase.purchaseProduct(productId, {
            quantity,
            username: purchaseToken,
          });

          if (didStart === false) {
            settlePendingPurchase(purchaseToken, {
              success: false,
              error: "Purchase could not be started",
            });
          }
        } catch (error) {
          settlePendingPurchase(purchaseToken, {
            success: false,
            error:
              error instanceof Error ? error.message : "Purchase failed to start",
          });
        }
      })();
    });
  });
}
