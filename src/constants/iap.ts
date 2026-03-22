/**
 * Tip Jar 상품 ID.
 * SSOT: electron/iap.config.js
 * Renderer 측은 vite.config.ts의 define으로 주입된 __TIP_PRODUCT_ID__를 사용한다.
 * Electron Main은 electron/iap.config.js를 직접 import한다.
 */
export const TIP_PRODUCT_ID = __TIP_PRODUCT_ID__;
