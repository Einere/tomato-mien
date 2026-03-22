export interface IAPProduct {
  productIdentifier: string;
  localizedTitle: string;
  localizedDescription: string;
  formattedPrice: string;
  price: number;
}

export interface IAPPurchaseResult {
  success: boolean;
  /** 사용자가 직접 다이얼로그를 취소한 경우 true (SKErrorPaymentCancelled). */
  cancelled?: boolean;
  error?: string;
}

export interface NotificationOptions {
  body?: string;
  icon?: string;
  silent?: boolean;
}

export interface NotificationResult {
  success: boolean;
  error?: string;
}

export interface ElectronAPI {
  onMenuAction: (callback: (event: unknown, action: string) => void) => void;
  removeMenuListeners: () => void;
  platform: string;
  showNotification: (
    title: string,
    options: NotificationOptions,
  ) => Promise<NotificationResult>;
  requestNotificationPermission: () => Promise<boolean>;
  isMAS: boolean;
  iapCanMakePayments: () => Promise<boolean>;
  iapGetProducts: (productIds: string[]) => Promise<IAPProduct[]>;
  iapPurchase: (
    productId: string,
    quantity: number,
  ) => Promise<IAPPurchaseResult>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
